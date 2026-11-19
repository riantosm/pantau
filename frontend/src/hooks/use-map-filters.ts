import { useCallback, useMemo } from "react";
import {
  resetFilters,
  setQuery,
  setStatusFilter,
  setTypeFilter,
  useAppDispatch,
  useAppSelector,
} from "@/redux";
import type { Entity, EntityStatus } from "@/types/entity.types";
import { filterEntities, countByStatus } from "@/utils/entity-filter";

/**
 * Pencarian & filter daftar entitas. Data cukup kecil, jadi disaring di browser
 * (tanpa request baru setiap kali mengetik). API tetap mendukung ?typeId=&status=&q=.
 */
export function useMapFilters(entities: Entity[]) {
  const dispatch = useAppDispatch();
  const { query, typeFilter, statusFilter } = useAppSelector((state) => state.mapUi);

  const filtered = useMemo(
    () => filterEntities(entities, { query, typeId: typeFilter, status: statusFilter }),
    [entities, query, typeFilter, statusFilter],
  );
  const counts = useMemo(() => countByStatus(entities), [entities]);
  const isFiltering = query.trim() !== "" || typeFilter !== null || statusFilter !== null;

  return {
    query,
    typeFilter,
    statusFilter,
    filtered,
    counts,
    isFiltering,
    setQuery: useCallback((q: string) => dispatch(setQuery(q)), [dispatch]),
    setTypeFilter: useCallback((id: string | null) => dispatch(setTypeFilter(id)), [dispatch]),
    setStatusFilter: useCallback(
      (s: EntityStatus | null) => dispatch(setStatusFilter(s)),
      [dispatch],
    ),
    resetFilters: useCallback(() => dispatch(resetFilters()), [dispatch]),
  };
}
