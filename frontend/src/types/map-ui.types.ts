import type { EntityStatus } from "@/types/entity.types";

/**
 * Mode halaman peta:
 * browse = lihat-lihat · pick = pilih lokasi entitas baru · form = tambah/ubah entitas ·
 * types = kelola jenis entitas.
 */
export type MapMode = "browse" | "pick" | "form" | "types";

export interface LatLng {
  latitude: number;
  longitude: number;
}

/** State UI halaman peta: pencarian, filter, entitas terpilih, dan mode tambah/ubah. */
export interface IMapUiReduxState {
  query: string;
  typeFilter: string | null;
  statusFilter: EntityStatus | null;
  selectedId: string | null;
  mode: MapMode;
  /** ID entitas yang sedang diubah; null = form tambah. */
  editingId: string | null;
  /** Posisi pin lokasi di peta selama mode pick/form. */
  draft: LatLng | null;
}
