import { StatusBadge } from "@/components/atoms/StatusBadge";
import type { EntityType } from "@/types/entity-type.types";
import type { Entity } from "@/types/entity.types";
import { cn } from "@/utils/cn";
import { EntityTypeIcon } from "@/layouts/map/EntityTypeIcon";

interface EntityListItemProps {
  entity: Entity;
  type?: EntityType;
  selected: boolean;
  onSelect: (id: string) => void;
  compact?: boolean;
}

export function EntityListItem({ entity, type, selected, onSelect, compact }: EntityListItemProps) {
  return (
    <li>
      <button
        type="button"
        aria-current={selected ? "true" : undefined}
        onClick={() => onSelect(entity.id)}
        className={cn(
          "flex w-full items-center gap-3 border-b border-border text-left transition hover:bg-surface",
          compact ? "px-5 py-3" : "px-6 py-3",
          selected && "bg-surface-2 hover:bg-surface-2",
        )}
      >
        {compact ? null : <EntityTypeIcon icon={type?.icon} />}
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="text-xs font-semibold tracking-[-0.02em] text-copper">
            {type?.name ?? "Tanpa jenis"}
          </span>
          <span className="truncate text-text-strong">{entity.name}</span>
        </span>
        <StatusBadge status={entity.status} />
      </button>
    </li>
  );
}
