import { useEffect } from "react";
import { Check } from "lucide-react";
import type { Toast } from "@/types/toast.types";
import { cn } from "@/utils/cn";

interface ToastViewProps {
  toast: Toast | null;
  onDismiss: (id: number) => void;
  className?: string;
}

const DURATION_MS: Record<Toast["tone"], number> = { success: 3500, error: 6000 };

/** Pesan singkat pill di bawah tengah peta. Hilang sendiri; klik untuk menutup lebih cepat. */
export function ToastView({ toast, onDismiss, className }: ToastViewProps) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => onDismiss(toast.id), DURATION_MS[toast.tone]);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  // Wadah aria-live selalu ada supaya pembaca layar mengumumkan pesan baru.
  return (
    <div aria-live="polite" className={cn("flex justify-center", className)}>
      {toast ? (
        <button
          key={toast.id}
          type="button"
          role={toast.tone === "error" ? "alert" : "status"}
          onClick={() => onDismiss(toast.id)}
          className={cn(
            "flex max-w-full items-center gap-2.5 rounded-control border bg-surface-2 py-2.5 text-left text-sm",
            toast.tone === "success"
              ? "border-border-strong pr-[18px] pl-3 text-text-strong"
              : "border-danger-line px-[18px] text-danger",
          )}
        >
          {toast.tone === "success" ? (
            <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full border border-success-line text-success">
              <Check className="size-3" strokeWidth={2.5} aria-hidden />
            </span>
          ) : null}
          {toast.message}
        </button>
      ) : null}
    </div>
  );
}
