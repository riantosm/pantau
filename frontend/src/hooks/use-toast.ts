import { useCallback } from "react";
import { dismissToast, showToast, useAppDispatch, useAppSelector } from "@/redux";

export function useToast() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.toast.current);

  return {
    toast,
    success: useCallback((message: string) => dispatch(showToast("success", message)), [dispatch]),
    error: useCallback((message: string) => dispatch(showToast("error", message)), [dispatch]),
    dismiss: useCallback((id: number) => dispatch(dismissToast(id)), [dispatch]),
  };
}
