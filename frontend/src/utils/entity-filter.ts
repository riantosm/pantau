import type { Entity, EntityStatus } from "@/types/entity.types";

export interface EntityFilter {
  query: string;
  typeId: string | null;
  status: EntityStatus | null;
}

/** Saring entitas berdasarkan nama (tanpa beda huruf besar/kecil), jenis, dan status. */
export function filterEntities(entities: Entity[], filter: EntityFilter): Entity[] {
  const q = filter.query.trim().toLocaleLowerCase("id");
  return entities.filter(
    (e) =>
      (!q || e.name.toLocaleLowerCase("id").includes(q)) &&
      (!filter.typeId || e.typeId === filter.typeId) &&
      (!filter.status || e.status === filter.status),
  );
}

export type StatusCounts = Record<EntityStatus, number> & { total: number };

/** Jumlah entitas per status, untuk ringkasan angka. */
export function countByStatus(entities: Entity[]): StatusCounts {
  const counts: StatusCounts = { active: 0, maintenance: 0, inactive: 0, total: entities.length };
  entities.forEach((e) => {
    counts[e.status] += 1;
  });
  return counts;
}
