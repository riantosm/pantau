import type { ReactNode } from "react";
import { Eyebrow } from "@/components/atoms/Eyebrow";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  eyebrow: string;
  message: ReactNode;
  action?: ReactNode;
  tone?: "default" | "danger";
  className?: string;
}

/** Pesan kosong/error di dalam daftar: eyebrow + kalimat + aksi opsional. */
export function EmptyState({
  eyebrow,
  message,
  action,
  tone = "default",
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-start gap-2 px-6 py-9", className)}>
      <Eyebrow className={tone === "danger" ? "text-danger" : undefined}>{eyebrow}</Eyebrow>
      <p className="text-text-3">{message}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
