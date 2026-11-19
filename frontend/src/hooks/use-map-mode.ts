import { useCallback } from "react";
import {
  exitMode,
  openTypes,
  setDraft,
  startCreate,
  startEdit,
  startManualCreate,
  useAppDispatch,
  useAppSelector,
} from "@/redux";
import type { Entity } from "@/types/entity.types";
import type { LatLng } from "@/types/map-ui.types";

/** Mode halaman peta (lihat · pilih lokasi · form · kelola jenis) dan pin lokasi draf. */
export function useMapMode() {
  const dispatch = useAppDispatch();
  const { mode, editingId, draft } = useAppSelector((state) => state.mapUi);

  return {
    mode,
    editingId,
    draft,
    startCreate: useCallback(() => dispatch(startCreate()), [dispatch]),
    startManualCreate: useCallback(() => dispatch(startManualCreate()), [dispatch]),
    startEdit: useCallback(
      (e: Entity) =>
        dispatch(startEdit({ id: e.id, latitude: e.latitude, longitude: e.longitude })),
      [dispatch],
    ),
    setDraft: useCallback((p: LatLng) => dispatch(setDraft(p)), [dispatch]),
    exitMode: useCallback(() => dispatch(exitMode()), [dispatch]),
    openTypes: useCallback(() => dispatch(openTypes()), [dispatch]),
  };
}
