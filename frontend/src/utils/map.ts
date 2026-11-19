import L from "leaflet";
import type { Entity } from "@/types/entity.types";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, MAP_FOCUS_ZOOM } from "@/constants/map";

const DESKTOP_QUERY = "(min-width: 1024px)";
/** Tinggi bottom sheet mobile dalam keadaan ringkas (h-80). */
const MOBILE_SHEET_PX = 320;

export function isDesktopViewport(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

/** Padding fitBounds: di mobile, bagian bawah peta tertutup bottom sheet. */
function fitPadding(): L.FitBoundsOptions {
  const pad = 56;
  return isDesktopViewport()
    ? // kanan: kontrol zoom · bawah: legenda status
      { paddingTopLeft: [pad, pad], paddingBottomRight: [pad + 40, pad + 48] }
    : { paddingTopLeft: [pad, 150], paddingBottomRight: [pad, MOBILE_SHEET_PX + pad] };
}

/** Tampilkan semua entitas di layar. */
export function fitToEntities(map: L.Map, entities: Entity[], animate = true): void {
  // Pastikan Leaflet memakai ukuran wadah terbaru sebelum menghitung zoom.
  map.invalidateSize({ pan: false });
  if (entities.length === 0) {
    map.setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, { animate });
    return;
  }
  const bounds = L.latLngBounds(entities.map((e) => [e.latitude, e.longitude] as L.LatLngTuple));
  map.fitBounds(bounds, { ...fitPadding(), maxZoom: MAP_FOCUS_ZOOM, animate });
}

/**
 * Terbang ke satu titik. Di mobile, titik digeser ke atas supaya tidak tertutup bottom sheet.
 */
export function flyToPoint(map: L.Map, latitude: number, longitude: number): void {
  const zoom = Math.max(map.getZoom(), MAP_FOCUS_ZOOM);
  const offsetY = isDesktopViewport() ? 0 : MOBILE_SHEET_PX / 2;
  const target = map.unproject(map.project([latitude, longitude], zoom).add([0, offsetY]), zoom);
  map.flyTo(target, zoom, { duration: 0.8 });
}

/** Tinggi strip peta yang tetap terlihat di atas sheet form mobile (h-[calc(100dvh-108px)]). */
const MOBILE_FORM_STRIP_PX = 108;

/**
 * Pastikan pin lokasi draf terlihat. Desktop: geser hanya kalau pin keluar layar.
 * Mobile: sheet form menutupi hampir seluruh peta, jadi pin ditaruh di tengah strip atas.
 */
export function revealDraftPin(map: L.Map, latitude: number, longitude: number): void {
  const point = L.latLng(latitude, longitude);
  if (isDesktopViewport()) {
    if (!map.getBounds().pad(-0.1).contains(point)) map.panTo(point);
    return;
  }
  const size = map.getSize();
  const shift = size.y / 2 - MOBILE_FORM_STRIP_PX / 2;
  const center = map.unproject(map.project(point).add([0, shift]));
  map.panTo(center);
}
