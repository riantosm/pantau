import type { EntityStatus } from "@/types/entity.types";
import { cn } from "@/utils/cn";

export type StatusMarkSize = "sm" | "md" | "lg";

/** Bentuk per status supaya tidak bergantung pada warna saja: lingkaran · wajik · lingkaran kosong. */
const SHAPE_CLASS: Record<EntityStatus, string> = {
  active: "rounded-full border-success bg-success",
  maintenance: "rotate-45 rounded-[1px] border-warning bg-warning",
  inactive: "rounded-full border-neutral bg-transparent",
};

/** Wajik digambar sedikit lebih kecil supaya luas visualnya setara dengan lingkaran. */
const SIZE_CLASS: Record<StatusMarkSize, Record<EntityStatus, string>> = {
  sm: { active: "size-2.5", maintenance: "size-[9px]", inactive: "size-2.5" },
  md: { active: "size-3.5", maintenance: "size-3", inactive: "size-3.5" },
  lg: { active: "size-4", maintenance: "size-3.5", inactive: "size-4" },
};

interface StatusMarkProps {
  status: EntityStatus;
  size?: StatusMarkSize;
  className?: string;
}

export function StatusMark({ status, size = "sm", className }: StatusMarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block shrink-0 border-[1.5px]",
        SHAPE_CLASS[status],
        SIZE_CLASS[size][status],
        className,
      )}
    />
  );
}
