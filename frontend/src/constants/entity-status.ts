import type { EntityStatus } from "@/types/entity.types";

/** Urutan tampil status di filter, ringkasan, dan form. */
export const ENTITY_STATUSES: readonly EntityStatus[] = ["active", "maintenance", "inactive"];

export const ENTITY_STATUS_LABEL: Record<EntityStatus, string> = {
  active: "Aktif",
  maintenance: "Perawatan",
  inactive: "Nonaktif",
};
