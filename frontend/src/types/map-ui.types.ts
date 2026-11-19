import type { EntityStatus } from "@/types/entity.types";

/** State UI halaman peta: pencarian, filter, dan entitas yang dipilih. */
export interface IMapUiReduxState {
  query: string;
  typeFilter: string | null;
  statusFilter: EntityStatus | null;
  selectedId: string | null;
}
