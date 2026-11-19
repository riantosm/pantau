import { type Action, combineReducers, configureStore, type ThunkAction } from "@reduxjs/toolkit";
import { persistReducer, persistStore, type PersistConfig, type Storage } from "redux-persist";
import { entitySlice, entityTypeSlice, mapUiSlice, toastSlice } from "./slices";

const storage: Storage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
};

const reducer = combineReducers({
  entity: entitySlice,
  entityType: entityTypeSlice,
  mapUi: mapUiSlice,
  toast: toastSlice,
});

// Tanpa auth: tidak ada yang di-persist. Data selalu diambil ulang dari API.
const persistConfig: PersistConfig<ReturnType<typeof reducer>> = {
  key: "pantau-root-1",
  version: 1,
  storage,
  whitelist: [],
};

// Disimpan ke variabel dulu: kalau persistReducer() ditulis langsung di dalam configureStore(),
// TypeScript menebak tipe state dari konteks dan hasilnya `any` (RootState ikut jadi any).
const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
