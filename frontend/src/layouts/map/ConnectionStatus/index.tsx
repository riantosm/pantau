import type { LoadStatus } from "@/types/api.types";
import { cn } from "@/utils/cn";

const LABEL: Record<LoadStatus, string> = {
  idle: "Menghubungkan…",
  loading: "Menghubungkan…",
  loaded: "API terhubung",
  error: "API tidak terjangkau",
};

const DOT: Record<LoadStatus, string> = {
  idle: "bg-warning animate-pulse",
  loading: "bg-warning animate-pulse",
  loaded: "bg-success",
  error: "bg-danger",
};

interface ConnectionStatusProps {
  status: LoadStatus;
  /** pill = berbingkai, untuk di atas peta (mobile). */
  variant?: "plain" | "pill";
}

export function ConnectionStatus({ status, variant = "plain" }: ConnectionStatusProps) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-2 text-[13px] text-text-muted",
        variant === "pill" &&
          "gap-1.5 rounded-control border border-border-strong bg-surface-2 px-2.5 py-1 text-xs",
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", DOT[status])} />
      {LABEL[status]}
    </span>
  );
}
