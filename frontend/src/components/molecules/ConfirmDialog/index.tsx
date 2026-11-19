import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/atoms/Button";
import { Eyebrow } from "@/components/atoms/Eyebrow";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dialog konfirmasi tindakan yang tidak bisa dibatalkan (hapus).
 * Fokus awal di tombol Batal (pilihan aman), Escape menutup, fokus kembali ke pemicu.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, isLoading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-scrim p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex w-full max-w-[440px] flex-col gap-3.5 rounded-card border border-border-strong bg-surface p-6"
      >
        <Eyebrow>Konfirmasi</Eyebrow>
        <h2
          id={titleId}
          className="font-serif text-[30px] leading-[1.13] tracking-[0.01em] text-text-strong"
        >
          {title}
        </h2>
        <div className="text-text-3">{children}</div>
        <div className="mt-1.5 flex justify-end gap-2">
          <Button ref={cancelRef} variant="outline" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="danger-solid" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
