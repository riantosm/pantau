import type { LatLngTuple } from "leaflet";

/** Pusat awal peta (Bandung) sebelum data dimuat. */
export const MAP_DEFAULT_CENTER: LatLngTuple = [-6.917, 107.619];
export const MAP_DEFAULT_ZOOM = 13;
/** Zoom minimal saat terbang ke entitas yang dipilih. */
export const MAP_FOCUS_ZOOM = 15;

/**
 * Tile gelap Stadia Maps "Alidade Smooth Dark".
 * CARTO Dark Matter (rencana awal) sekarang mewajibkan API key. Stadia gratis untuk proyek
 * non-komersial: di localhost tanpa kunci, di domain production cukup daftarkan domainnya
 * di akun Stadia (tanpa kunci di kode).
 */
export const MAP_TILE_URL =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";
export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
