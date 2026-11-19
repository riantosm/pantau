import { useCallback, useMemo } from "react";
import { entityTypeService } from "@/services/entity-type.service";
import {
  setEntityTypes,
  setEntityTypesError,
  setEntityTypesLoading,
  useAppDispatch,
  useAppSelector,
  type AppThunk,
} from "@/redux";
import type { EntityType } from "@/types/entity-type.types";

const fetchEntityTypes = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  if (getState().entityType.status === "loading") return;
  dispatch(setEntityTypesLoading());
  try {
    dispatch(setEntityTypes(await entityTypeService.list()));
  } catch (error) {
    dispatch(setEntityTypesError(error instanceof Error ? error.message : "Gagal memuat jenis"));
  }
};

export function useEntityTypes() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.entityType);

  const typeById = useMemo(() => {
    const map = new Map<string, EntityType>();
    items.forEach((t) => map.set(t.id, t));
    return map;
  }, [items]);

  const loadEntityTypes = useCallback(() => {
    if (status === "idle") void dispatch(fetchEntityTypes());
  }, [dispatch, status]);

  const reloadEntityTypes = useCallback(() => dispatch(fetchEntityTypes()), [dispatch]);

  return { types: items, typeById, status, error, loadEntityTypes, reloadEntityTypes };
}
