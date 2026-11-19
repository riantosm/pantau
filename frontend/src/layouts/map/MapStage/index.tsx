import type { ReactNode } from "react";
import { Maximize, Minus, Plus } from "lucide-react";
import { IconButton } from "@/components/atoms/IconButton";
import { StatusMark } from "@/components/atoms/StatusMark";
import { ENTITY_STATUSES, ENTITY_STATUS_LABEL } from "@/constants/entity-status";
import { cn } from "@/utils/cn";

export interface MapControlHandlers {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitAll: () => void;
}

interface MapStageProps {
  /** Peta Leaflet (MapView). */
  map: ReactNode;
  /** Lapisan di atas peta: header + pencarian mobile, banner, kartu pesan. */
  overlay?: ReactNode;
  /** null = peta belum siap, tombol dinonaktifkan. */
  controls: MapControlHandlers | null;
  className?: string;
}

/** Bingkai area peta: peta, kontrol zoom, dan legenda status. */
export function MapStage({ map, overlay, controls, className }: MapStageProps) {
  return (
    <main className={cn("relative isolate min-w-0 flex-1 overflow-hidden bg-map", className)}>
      {map}
      {overlay}

      <div className="absolute top-5 right-5 z-[1000] hidden flex-col gap-2 lg:flex">
        <IconButton
          aria-label="Perbesar peta"
          variant="raised"
          size="md"
          icon={<Plus strokeWidth={1.5} />}
          disabled={!controls}
          onClick={controls?.onZoomIn}
        />
        <IconButton
          aria-label="Perkecil peta"
          variant="raised"
          size="md"
          icon={<Minus strokeWidth={1.5} />}
          disabled={!controls}
          onClick={controls?.onZoomOut}
        />
        <IconButton
          aria-label="Tampilkan semua entitas"
          title="Tampilkan semua entitas"
          variant="raised"
          size="md"
          icon={<Maximize strokeWidth={1.5} />}
          disabled={!controls}
          onClick={controls?.onFitAll}
        />
      </div>

      <ul
        aria-label="Legenda status"
        className="absolute bottom-5 left-5 z-[1000] hidden flex-wrap items-center gap-4 rounded-card border border-border bg-surface px-4 py-2.5 text-[13px] text-text-2 lg:flex"
      >
        {ENTITY_STATUSES.map((s) => (
          <li key={s} className="inline-flex items-center gap-2">
            <StatusMark status={s} />
            {ENTITY_STATUS_LABEL[s]}
          </li>
        ))}
      </ul>
    </main>
  );
}
