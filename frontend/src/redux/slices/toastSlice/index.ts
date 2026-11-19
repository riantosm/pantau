import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IToastReduxState, ToastTone } from "@/types/toast.types";

const initialState: IToastReduxState = { current: null };
let nextId = 1;

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: {
      reducer(state, action: PayloadAction<{ id: number; tone: ToastTone; message: string }>) {
        state.current = action.payload;
      },
      prepare(tone: ToastTone, message: string) {
        return { payload: { id: nextId++, tone, message } };
      },
    },
    /** Hanya menutup toast dengan id itu, supaya toast yang lebih baru tidak ikut tertutup. */
    dismissToast(state, action: PayloadAction<number>) {
      if (state.current?.id === action.payload) state.current = null;
    },
  },
});

export const { showToast, dismissToast } = toastSlice.actions;
export default toastSlice.reducer;
