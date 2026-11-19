import { useCallback, useMemo } from "react";
import { selectEntity, useAppDispatch, useAppSelector } from "@/redux";
import type { Entity } from "@/types/entity.types";

export function useSelectedEntity(entities: Entity[]) {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((state) => state.mapUi.selectedId);
  const selected = useMemo(
    () => entities.find((e) => e.id === selectedId) ?? null,
    [entities, selectedId],
  );

  return {
    selectedId,
    selected,
    select: useCallback((id: string | null) => dispatch(selectEntity(id)), [dispatch]),
  };
}
