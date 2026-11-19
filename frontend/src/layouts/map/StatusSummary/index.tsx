import { ENTITY_STATUSES, ENTITY_STATUS_LABEL } from "@/constants/entity-status";
import type { StatusCounts } from "@/utils/entity-filter";
import { cn } from "@/utils/cn";

interface StatusSummaryProps {
  counts: StatusCounts;
  /** plain = sidebar desktop · boxed = kotak bergaris dengan pemisah (bottom sheet mobile). */
  variant?: "plain" | "boxed";
  isLoading?: boolean;
  className?: string;
}

/** Ringkasan jumlah per status, selalu grid 3 kolom dengan lebar sama. */
export function StatusSummary({
  counts,
  variant = "plain",
  isLoading = false,
  className,
}: StatusSummaryProps) {
  const boxed = variant === "boxed";
  return (
    <dl
      className={cn(
        "grid grid-cols-3",
        boxed ? "rounded-card border border-border" : "gap-2",
        className,
      )}
    >
      {ENTITY_STATUSES.map((status, i) => (
        <div
          key={status}
          className={cn(
            "flex min-w-0 flex-col-reverse gap-1",
            boxed && "items-center px-2 py-3",
            boxed && i === 1 && "border-x border-border",
          )}
        >
          <dt className={cn("text-text-muted", boxed ? "text-xs" : "text-[13px]")}>
            {ENTITY_STATUS_LABEL[status]}
          </dt>
          <dd
            className={cn(
              "font-serif leading-none tracking-[0.01em] text-text-strong tabular-nums",
              boxed ? "text-[32px]" : "text-[40px]",
              isLoading && "text-text-faint",
            )}
          >
            {isLoading ? "–" : counts[status]}
          </dd>
        </div>
      ))}
    </dl>
  );
}
