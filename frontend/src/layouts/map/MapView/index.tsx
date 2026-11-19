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
import { fitToEntities, flyToPoint } from "@/utils/map";

interface MapViewProps {
  /** Entitas yang tampil (sudah tersaring). */
  entities: Entity[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Dipanggil sekali saat peta siap, supaya kontrol di luar peta bisa memakainya. */
  onReady: (map: L.Map) => void;
}

/** Ikon dibuat sekali per kombinasi status × terpilih, lalu dipakai ulang. */
const iconCache = new Map<string, L.DivIcon>();

function markerIcon(status: EntityStatus, selected: boolean): L.DivIcon {
  const key = `${status}-${selected}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = L.divIcon({
      className: `pantau-marker pantau-marker--${status}${selected ? " pantau-marker--selected" : ""}`,
      html: '<span class="pantau-marker__dot"></span>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      tooltipAnchor: [12, 0],
    });
    iconCache.set(key, icon);
  }
  return icon;
}

/** Peta Leaflet + tile CARTO Dark Matter + marker per entitas. */
export function MapView({ entities, selectedId, onSelect, onReady }: MapViewProps) {
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
        const selected = e.id === selectedId;
        return (
          <Marker
            key={e.id}
            position={[e.latitude, e.longitude]}
            icon={markerIcon(e.status, selected)}
            title={`${e.name} · ${ENTITY_STATUS_LABEL[e.status]}`}
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

      <FitOnFirstData entities={entities} />
      <FocusSelected entities={entities} selectedId={selectedId} />
      <KeepSizeInSync />
      <DeselectOnMapClick onSelect={onSelect} />
    </MapContainer>
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

/** Klik area kosong peta menutup detail. (Di Tugas 7 klik peta juga dipakai untuk memilih lokasi.) */
function DeselectOnMapClick({ onSelect }: { onSelect: (id: string | null) => void }) {
  useMapEvents({ click: () => onSelect(null) });
  return null;
}
