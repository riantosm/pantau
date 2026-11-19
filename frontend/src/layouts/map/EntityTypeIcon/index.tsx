import { ENTITY_TYPE_ICONS, FALLBACK_TYPE_ICON } from "@/constants/entity-icons";
import type { EntityTypeIcon as IconName } from "@/types/entity-type.types";
import { cn } from "@/utils/cn";

/** Ikon jenis di dalam lingkaran bergaris, dipakai di daftar entitas dan daftar jenis. */
export function EntityTypeIcon({ icon, className }: { icon?: IconName; className?: string }) {
  const Icon = icon ? ENTITY_TYPE_ICONS[icon] : FALLBACK_TYPE_ICON;
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-[34px] shrink-0 items-center justify-center rounded-control border border-border-strong text-text-3",
        className,
      )}
    >
      <Icon className="size-[15px]" strokeWidth={1.5} />
    </span>
  );
}
