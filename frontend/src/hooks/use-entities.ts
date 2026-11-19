import { useCallback } from "react";
import { entityService } from "@/services/entity.service";
import {
  setEntities,
  setEntitiesError,
  setEntitiesLoading,
  useAppDispatch,
  useAppSelector,
  type AppThunk,
} from "@/redux";

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

  return { entities: items, status, error, loadEntities, reloadEntities };
}
