import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Entity, IEntityReduxState } from "@/types/entity.types";

const initialState: IEntityReduxState = { items: [], status: "idle", error: null };

export const entitySlice = createSlice({
  name: "entity",
  initialState,
  reducers: {
    setEntitiesLoading(state) {
      state.status = "loading";
      state.error = null;
    },
    setEntities(state, action: PayloadAction<Entity[]>) {
      state.items = action.payload;
      state.status = "loaded";
    },
    setEntitiesError(state, action: PayloadAction<string>) {
      state.status = "error";
      state.error = action.payload;
    },
    addEntity(state, action: PayloadAction<Entity>) {
      state.items.unshift(action.payload); // terbaru di atas, sama seperti urutan API
    },
    updateEntity(state, action: PayloadAction<Entity>) {
      const i = state.items.findIndex((e) => e.id === action.payload.id);
      if (i >= 0) state.items[i] = action.payload;
    },
    removeEntity(state, action: PayloadAction<string>) {
      state.items = state.items.filter((e) => e.id !== action.payload);
    },
  },
});

export const {
  setEntitiesLoading,
  setEntities,
  setEntitiesError,
  addEntity,
  updateEntity,
  removeEntity,
} = entitySlice.actions;

export default entitySlice.reducer;
