import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EntityStatus } from "@/types/entity.types";
import type { IMapUiReduxState } from "@/types/map-ui.types";

const initialState: IMapUiReduxState = {
  query: "",
  typeFilter: null,
  statusFilter: null,
  selectedId: null,
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
  },
});

export const { setQuery, setTypeFilter, setStatusFilter, resetFilters, selectEntity } =
  mapUiSlice.actions;

export default mapUiSlice.reducer;
