import { useCallback, useMemo } from "react";
import { entityTypeService } from "@/services/entity-type.service";
import {
  addEntityType,
  removeEntityType,
  setEntityTypes,
  setEntityTypesError,
  setEntityTypesLoading,
  setTypeFilter,
  updateEntityType,
  useAppDispatch,
  useAppSelector,
  type AppThunk,
} from "@/redux";
import type { EntityType, EntityTypeInput } from "@/types/entity-type.types";

const fetchEntityTypes = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  if (getState().entityType.status === "loading") return;
  dispatch(setEntityTypesLoading());
  try {
    dispatch(setEntityTypes(await entityTypeService.list()));
  } catch (error) {
    dispatch(setEntityTypesError(error instanceof Error ? error.message : "Gagal memuat jenis"));
  }
};

/** Hapus jenis; kalau jenis itu sedang dipakai sebagai filter, filter direset. */
const deleteEntityTypeThunk =
  (type: EntityType): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    await entityTypeService.remove(type.id);
    dispatch(removeEntityType(type.id));
    if (getState().mapUi.typeFilter === type.id) dispatch(setTypeFilter(null));
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

  const createEntityType = useCallback(
    async (input: EntityTypeInput): Promise<EntityType> => {
      const created = await entityTypeService.create(input);
      dispatch(addEntityType(created));
      return created;
    },
    [dispatch],
  );

  const saveEntityType = useCallback(
    async (id: string, input: EntityTypeInput): Promise<EntityType> => {
      const saved = await entityTypeService.update(id, input);
      dispatch(updateEntityType(saved));
      return saved;
    },
    [dispatch],
  );

  const deleteEntityType = useCallback(
    (type: EntityType) => dispatch(deleteEntityTypeThunk(type)),
    [dispatch],
  );

  return {
    types: items,
    typeById,
    status,
    error,
    loadEntityTypes,
    reloadEntityTypes,
    createEntityType,
    saveEntityType,
    deleteEntityType,
  };
}
