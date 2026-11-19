import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EntityStatus } from "@/types/entity.types";
import type { IMapUiReduxState, LatLng } from "@/types/map-ui.types";

const initialState: IMapUiReduxState = {
  query: "",
  typeFilter: null,
  statusFilter: null,
  selectedId: null,
  mode: "browse",
  editingId: null,
  draft: null,
};

export const mapUiSlice = createSlice({
  name: "mapUi",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setTypeFilter(state, action: PayloadAction<string | null>) {
      state.typeFilter = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<EntityStatus | null>) {
      state.statusFilter = action.payload;
    },
    resetFilters(state) {
      state.query = "";
      state.typeFilter = null;
      state.statusFilter = null;
    },
    selectEntity(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },

    /** Tombol "Tambah entitas": masuk mode pilih lokasi. */
    startCreate(state) {
      state.mode = "pick";
      state.selectedId = null;
      state.editingId = null;
      state.draft = null;
    },
    /** Lewati klik peta, langsung ke form dengan koordinat kosong. */
    startManualCreate(state) {
      state.mode = "form";
      state.editingId = null;
    },
    /** Panel detail → Ubah. Pin mulai dari lokasi entitas. */
    startEdit(state, action: PayloadAction<{ id: string } & LatLng>) {
      const { id, latitude, longitude } = action.payload;
      state.mode = "form";
      state.editingId = id;
      state.selectedId = id;
      state.draft = { latitude, longitude };
    },
    /** Pin ditaruh/digeser. Dari mode pick otomatis lanjut ke form. */
    setDraft(state, action: PayloadAction<LatLng>) {
      const next = action.payload;
      const same =
        state.draft &&
        state.draft.latitude === next.latitude &&
        state.draft.longitude === next.longitude;
      if (!same) state.draft = next;
      if (state.mode === "pick") state.mode = "form";
    },
    /** Kembali ke mode lihat. Kalau sedang mengubah, detail entitas itu tetap terbuka. */
    exitMode(state) {
      state.mode = "browse";
      state.editingId = null;
      state.draft = null;
    },
    openTypes(state) {
      state.mode = "types";
      state.selectedId = null;
      state.editingId = null;
      state.draft = null;
    },
  },
});

export const {
  setQuery,
  setTypeFilter,
  setStatusFilter,
  resetFilters,
  selectEntity,
  startCreate,
  startManualCreate,
  startEdit,
  setDraft,
  exitMode,
  openTypes,
} = mapUiSlice.actions;

export default mapUiSlice.reducer;
