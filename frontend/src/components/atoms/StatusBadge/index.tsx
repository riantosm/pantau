import { ENTITY_STATUS_LABEL } from "@/constants/entity-status";
import type { EntityStatus } from "@/types/entity.types";
import { cn } from "@/utils/cn";

const TONE_CLASS: Record<EntityStatus, string> = {
  active: "border-success-line text-success",
  maintenance: "border-warning-line text-warning",
  inactive: "border-neutral-line text-text-muted",
};

export function StatusBadge({ status, className }: { status: EntityStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-control border px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASS[status],
        className,
      )}
    >
      {ENTITY_STATUS_LABEL[status]}
    </span>
  );
}
