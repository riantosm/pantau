import type { ReactNode } from "react";
import { Maximize, Minus, Plus } from "lucide-react";
import { IconButton } from "@/components/atoms/IconButton";
import { StatusMark } from "@/components/atoms/StatusMark";
import { ENTITY_STATUSES, ENTITY_STATUS_LABEL } from "@/constants/entity-status";
import { cn } from "@/utils/cn";

interface MapStageProps {
  /** Lapisan di atas peta (mis. header + pencarian mobile). */
  overlay?: ReactNode;
  className?: string;
}

/**
 * Area peta. Untuk sementara berisi latar dekoratif; peta Leaflet + tile CARTO Dark Matter
 * dan marker dipasang di Tugas 6 tanpa mengubah kerangka di sekitarnya.
 */
export function MapStage({ overlay, className }: MapStageProps) {
  return (
    <main className={cn("relative min-w-0 flex-1 overflow-hidden bg-map", className)}>
      <MapBackdrop />

      {/* Di mobile, bawah peta tertutup bottom sheet: geser catatan ke area yang terlihat. */}
      <div className="absolute inset-0 flex items-center justify-center p-6 pb-[340px] lg:pb-6">
        <p className="max-w-xs rounded-card border border-dashed border-border-strong bg-map/80 px-4 py-3 text-center text-sm text-text-muted">
          Peta interaktif (Leaflet + CARTO Dark Matter) dipasang di Tugas 6.
        </p>
      </div>

      {overlay}

      <div className="absolute top-5 right-5 z-10 hidden flex-col gap-2 lg:flex">
        <IconButton
          aria-label="Perbesar peta"
          variant="raised"
          size="md"
          icon={<Plus strokeWidth={1.5} />}
          disabled
        />
        <IconButton
          aria-label="Perkecil peta"
          variant="raised"
          size="md"
          icon={<Minus strokeWidth={1.5} />}
          disabled
        />
        <IconButton
          aria-label="Tampilkan semua entitas"
          variant="raised"
          size="md"
          icon={<Maximize strokeWidth={1.5} />}
          disabled
        />
      </div>

      <ul
        aria-label="Legenda status"
        className="absolute bottom-5 left-5 z-10 hidden flex-wrap items-center gap-4 rounded-card border border-border bg-surface px-4 py-2.5 text-[13px] text-text-2 lg:flex"
      >
        {ENTITY_STATUSES.map((s) => (
          <li key={s} className="inline-flex items-center gap-2">
            <StatusMark status={s} />
            {ENTITY_STATUS_LABEL[s]}
          </li>
        ))}
      </ul>
      <span className="absolute right-3 bottom-2 z-10 hidden text-[11px] text-text-faint lg:block">
        © OpenStreetMap · © CARTO
      </span>
    </main>
  );
}

/** Garis jalan & blok kota samar, hanya dekorasi sampai Leaflet terpasang. */
function MapBackdrop() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 760"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full text-border"
    >
      <g fill="currentColor" opacity="0.25">
        <rect x="40" y="40" width="160" height="90" rx="4" />
        <rect x="600" y="170" width="140" height="110" rx="4" />
        <rect x="450" y="370" width="130" height="80" rx="4" />
        <rect x="120" y="510" width="160" height="80" rx="4" />
        <rect x="860" y="490" width="120" height="150" rx="4" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="3" opacity="0.5">
        <path d="M0 150 H1000 M0 460 H1000 M150 0 V760 M420 0 V760 M820 0 V760" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round">
        <path d="M-20 320 C 250 290 520 360 1020 310" />
        <path d="M560 -20 C 530 220 610 470 520 780" />
        <path d="M-20 600 C 300 580 700 540 1020 510" />
      </g>
    </svg>
  );
}
