import { useCallback } from "react";
import { entityService } from "@/services/entity.service";
import {
  addEntity,
  adjustEntityCount,
  removeEntity,
  setEntities,
  setEntitiesError,
  setEntitiesLoading,
  updateEntity,
  useAppDispatch,
  useAppSelector,
  type AppThunk,
} from "@/redux";
import type { Entity, EntityInput } from "@/types/entity.types";

/** Ambil semua entitas. Diabaikan kalau sedang memuat, supaya StrictMode tidak fetch dua kali. */
const fetchEntities = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  if (getState().entity.status === "loading") return;
  dispatch(setEntitiesLoading());
  try {
    dispatch(setEntities(await entityService.list()));
  } catch (error) {
    dispatch(setEntitiesError(error instanceof Error ? error.message : "Gagal memuat entitas"));
  }
};

export function useEntities() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.entity);

  /** Muat sekali (kalau belum pernah dimuat). */
  const loadEntities = useCallback(() => {
    if (status === "idle") void dispatch(fetchEntities());
  }, [dispatch, status]);

  /** Muat ulang paksa, mis. dari tombol "Coba lagi". */
  const reloadEntities = useCallback(() => dispatch(fetchEntities()), [dispatch]);

  /**
   * Mutasi melempar Error dari service (pesan ramah + error axios di `cause`), supaya form bisa
   * memetakan error per field. entityCount di jenis ikut disesuaikan tanpa request ulang.
   */
  const createEntity = useCallback(
    async (input: EntityInput): Promise<Entity> => {
      const created = await entityService.create(input);
      dispatch(addEntity(created));
      dispatch(adjustEntityCount({ typeId: created.typeId, delta: 1 }));
      return created;
    },
    [dispatch],
  );

  const saveEntity = useCallback(
    async (before: Entity, input: EntityInput): Promise<Entity> => {
      const saved = await entityService.update(before.id, input);
      dispatch(updateEntity(saved));
      if (saved.typeId !== before.typeId) {
        dispatch(adjustEntityCount({ typeId: before.typeId, delta: -1 }));
        dispatch(adjustEntityCount({ typeId: saved.typeId, delta: 1 }));
      }
      return saved;
    },
    [dispatch],
  );

  const deleteEntity = useCallback(
    async (entity: Entity): Promise<void> => {
      await entityService.remove(entity.id);
      dispatch(removeEntity(entity.id));
      dispatch(adjustEntityCount({ typeId: entity.typeId, delta: -1 }));
    },
    [dispatch],
  );

  /** Entitas sudah dihapus orang lain (404): buang dari daftar lokal. */
  const forgetEntity = useCallback((id: string) => dispatch(removeEntity(id)), [dispatch]);

  return {
    entities: items,
    status,
    error,
    loadEntities,
    reloadEntities,
    createEntity,
    saveEntity,
    deleteEntity,
    forgetEntity,
  };
}
