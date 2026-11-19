import { SlidersHorizontal } from "lucide-react";
import { Chip } from "@/components/atoms/Chip";
import { StatusMark } from "@/components/atoms/StatusMark";
import { ENTITY_STATUSES, ENTITY_STATUS_LABEL } from "@/constants/entity-status";
import type { EntityType } from "@/types/entity-type.types";
import type { EntityStatus } from "@/types/entity.types";
import { cn } from "@/utils/cn";

interface TypeChipsProps {
  types: EntityType[];
  value: string | null;
  onChange: (typeId: string | null) => void;
  /** scroll = satu baris yang bisa digeser (mobile). */
  layout?: "wrap" | "scroll";
  className?: string;
}

export function TypeChips({ types, value, onChange, layout = "wrap", className }: TypeChipsProps) {
  return (
    <div
      role="group"
      aria-label="Filter jenis"
      className={cn(
        "flex gap-1.5",
        layout === "wrap" ? "flex-wrap" : "overflow-x-auto [scrollbar-width:none] [&>*]:shrink-0",
        className,
      )}
    >
      <Chip pressed={value === null} onClick={() => onChange(null)}>
        Semua
      </Chip>
      {types.map((t) => (
        <Chip key={t.id} pressed={value === t.id} onClick={() => onChange(t.id)}>
          {t.name}
        </Chip>
      ))}
    </div>
  );
}

interface StatusChipsProps {
  value: EntityStatus | null;
  onChange: (status: EntityStatus | null) => void;
}

export function StatusChips({ value, onChange }: StatusChipsProps) {
  return (
    <div role="group" aria-label="Filter status" className="flex flex-wrap gap-1.5">
      <Chip pressed={value === null} onClick={() => onChange(null)}>
        Semua
      </Chip>
      {ENTITY_STATUSES.map((s) => (
        <Chip
          key={s}
          pressed={value === s}
          onClick={() => onChange(s)}
          leading={<StatusMark status={s} />}
        >
          {ENTITY_STATUS_LABEL[s]}
        </Chip>
      ))}
    </div>
  );
}

interface EntityFiltersProps {
  types: EntityType[];
  typeFilter: string | null;
  statusFilter: EntityStatus | null;
  onTypeChange: (typeId: string | null) => void;
  onStatusChange: (status: EntityStatus | null) => void;
  onManageTypes?: () => void;
}

/** Filter jenis + status di sidebar desktop. */
export function EntityFilters({
  types,
  typeFilter,
  statusFilter,
  onTypeChange,
  onStatusChange,
  onManageTypes,
}: EntityFiltersProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-text-muted">Jenis</span>
        <button
          type="button"
          onClick={onManageTypes}
          disabled={!onManageTypes}
          className="inline-flex items-center gap-1.5 rounded-control border border-border-strong px-2.5 py-[3px] text-xs text-text disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SlidersHorizontal className="size-3" strokeWidth={1.5} aria-hidden />
          Kelola jenis
        </button>
      </div>
      <TypeChips types={types} value={typeFilter} onChange={onTypeChange} />
      <span className="mt-1 text-xs text-text-muted">Status</span>
      <StatusChips value={statusFilter} onChange={onStatusChange} />
    </div>
  );
}
