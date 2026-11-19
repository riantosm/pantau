import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EntityType, IEntityTypeReduxState } from "@/types/entity-type.types";

const initialState: IEntityTypeReduxState = { items: [], status: "idle", error: null };

const byName = (a: EntityType, b: EntityType) =>
  a.name.localeCompare(b.name, "id", { sensitivity: "base" });

export const entityTypeSlice = createSlice({
  name: "entityType",
  initialState,
  reducers: {
    setEntityTypesLoading(state) {
      state.status = "loading";
      state.error = null;
    },
    setEntityTypes(state, action: PayloadAction<EntityType[]>) {
      state.items = action.payload;
      state.status = "loaded";
    },
    setEntityTypesError(state, action: PayloadAction<string>) {
      state.status = "error";
      state.error = action.payload;
    },
    addEntityType(state, action: PayloadAction<EntityType>) {
      state.items.push(action.payload);
      state.items.sort(byName); // API mengurutkan A–Z
    },
    updateEntityType(state, action: PayloadAction<EntityType>) {
      const i = state.items.findIndex((t) => t.id === action.payload.id);
      if (i >= 0) state.items[i] = action.payload;
      state.items.sort(byName);
    },
    removeEntityType(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    /** Menyesuaikan entityCount setelah entitas ditambah/dihapus/dipindah jenis. */
    adjustEntityCount(state, action: PayloadAction<{ typeId: string; delta: number }>) {
      const t = state.items.find((x) => x.id === action.payload.typeId);
      if (t) t.entityCount = Math.max(0, t.entityCount + action.payload.delta);
    },
  },
});

export const {
  setEntityTypesLoading,
  setEntityTypes,
  setEntityTypesError,
  addEntityType,
  updateEntityType,
  removeEntityType,
  adjustEntityCount,
} = entityTypeSlice.actions;

export default entityTypeSlice.reducer;
