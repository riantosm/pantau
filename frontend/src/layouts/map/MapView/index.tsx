import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { ENTITY_STATUS_LABEL } from "@/constants/entity-status";
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
} from "@/constants/map";
import type { Entity, EntityStatus } from "@/types/entity.types";
import type { LatLng, MapMode } from "@/types/map-ui.types";
import { fitToEntities, flyToPoint, revealDraftPin } from "@/utils/map";

interface MapViewProps {
  /** Entitas yang tampil (sudah tersaring). */
  entities: Entity[];
  selectedId: string | null;
  mode: MapMode;
  /** Entitas yang sedang diubah: markernya disembunyikan, diganti pin draf. */
  editingId: string | null;
  draft: LatLng | null;
  onSelect: (id: string | null) => void;
  /** Klik peta saat memilih lokasi / mengisi form, atau pin selesai digeser. */
  onPlace: (point: LatLng) => void;
  /** Dipanggil saat peta siap, supaya kontrol di luar peta bisa memakainya. */
  onReady: (map: L.Map) => void;
}

/** Ikon dibuat sekali per kombinasi status × terpilih × redup, lalu dipakai ulang. */
const iconCache = new Map<string, L.DivIcon>();

function markerIcon(status: EntityStatus, selected: boolean, muted: boolean): L.DivIcon {
  const key = `${status}-${selected}-${muted}`;
  let icon = iconCache.get(key);
  if (!icon) {
    const classes = ["pantau-marker", `pantau-marker--${status}`];
    if (selected) classes.push("pantau-marker--selected");
    if (muted) classes.push("pantau-marker--muted");
    icon = L.divIcon({
      className: classes.join(" "),
      html: '<span class="pantau-marker__dot"></span>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      tooltipAnchor: [12, 0],
    });
    iconCache.set(key, icon);
  }
  return icon;
}

const pinIcon = L.divIcon({
  className: "pantau-pin",
  iconSize: [46, 46],
  iconAnchor: [23, 23],
  tooltipAnchor: [20, 0],
});

const roundCoord = (n: number) => Math.round(n * 1e5) / 1e5;

/** Peta Leaflet + tile gelap + marker per entitas + pin lokasi saat tambah/ubah. */
export function MapView({
  entities,
  selectedId,
  mode,
  editingId,
  draft,
  onSelect,
  onPlace,
  onReady,
}: MapViewProps) {
  const placing = mode === "pick" || mode === "form";

  return (
    <MapContainer
      center={MAP_DEFAULT_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      zoomControl={false}
      className="absolute inset-0 z-0"
      ref={(map) => {
        if (map) onReady(map);
      }}
    >
      <TileLayer url={MAP_TILE_URL} attribution={MAP_TILE_ATTRIBUTION} maxZoom={20} />

      {entities.map((e) => {
        if (e.id === editingId) return null;
        const selected = e.id === selectedId && !placing;
        return (
          <Marker
            key={e.id}
            position={[e.latitude, e.longitude]}
            icon={markerIcon(e.status, selected, placing)}
            title={`${e.name} · ${ENTITY_STATUS_LABEL[e.status]}`}
            keyboard={!placing}
            zIndexOffset={selected ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(e.id) }}
          >
            {selected ? (
              <Tooltip permanent direction="right" className="pantau-label">
                {e.name}
              </Tooltip>
            ) : null}
          </Marker>
        );
      })}

      {placing && draft ? (
        <DraftPin draft={draft} isEdit={editingId !== null} onMove={onPlace} />
      ) : null}

      <FitOnFirstData entities={entities} />
      <FocusSelected entities={entities} selectedId={selectedId} />
      <KeepSizeInSync />
      <MapClicks placing={placing} mode={mode} onSelect={onSelect} onPlace={onPlace} />
    </MapContainer>
  );
}

/** Pin putih yang bisa digeser. Peta digeser supaya pin selalu terlihat (lihat revealDraftPin). */
function DraftPin({
  draft,
  isEdit,
  onMove,
}: {
  draft: LatLng;
  isEdit: boolean;
  onMove: (p: LatLng) => void;
}) {
  const map = useMap();
  const position = useMemo<L.LatLngTuple>(
    () => [draft.latitude, draft.longitude],
    [draft.latitude, draft.longitude],
  );

  useEffect(() => {
    revealDraftPin(map, position[0], position[1]);
  }, [map, position]);

  return (
    <Marker
      position={position}
      icon={pinIcon}
      draggable
      zIndexOffset={2000}
      title="Lokasi entitas, geser untuk memindahkan"
      eventHandlers={{
        dragend: (ev) => {
          const p = (ev.target as L.Marker).getLatLng();
          onMove({ latitude: roundCoord(p.lat), longitude: roundCoord(p.lng) });
        },
      }}
    >
      <Tooltip permanent direction="right" className="pantau-label pantau-label--pin">
        {isEdit ? "Lokasi" : "Lokasi baru"}
      </Tooltip>
    </Marker>
  );
}

/** Saat data pertama kali tersedia, tampilkan semua entitas di layar. */
function FitOnFirstData({ entities }: { entities: Entity[] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || entities.length === 0) return;
    done.current = true;
    fitToEntities(map, entities, false);
  }, [map, entities]);
  return null;
}

/** Terbang ke entitas yang dipilih (dari daftar maupun marker). */
function FocusSelected({
  entities,
  selectedId,
}: {
  entities: Entity[];
  selectedId: string | null;
}) {
  const map = useMap();
  const target = useMemo(
    () => entities.find((e) => e.id === selectedId) ?? null,
    [entities, selectedId],
  );
  const lat = target?.latitude;
  const lng = target?.longitude;
  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    flyToPoint(map, lat, lng);
  }, [map, selectedId, lat, lng]);
  return null;
}

/**
 * Leaflet tidak tahu kalau wadahnya berubah ukuran (mis. panel kanan dibuka/ditutup),
 * jadi beri tahu lewat invalidateSize setiap kali ukuran wadah berubah.
 */
function KeepSizeInSync() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

/**
 * Klik peta: saat memilih lokasi / mengisi form → taruh pin; saat melihat → tutup detail.
 * Kursor jadi crosshair selama memilih lokasi.
 */
function MapClicks({
  placing,
  mode,
  onSelect,
  onPlace,
}: {
  placing: boolean;
  mode: MapMode;
  onSelect: (id: string | null) => void;
  onPlace: (p: LatLng) => void;
}) {
  const map = useMapEvents({
    click: (e) => {
      if (placing)
        onPlace({ latitude: roundCoord(e.latlng.lat), longitude: roundCoord(e.latlng.lng) });
      else if (mode === "browse") onSelect(null);
    },
  });
  useEffect(() => {
    map.getContainer().classList.toggle("pantau-picking", placing);
  }, [map, placing]);
  return null;
}
