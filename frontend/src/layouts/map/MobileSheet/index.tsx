import { useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface MobileSheetProps {
  children: ReactNode;
  className?: string;
}

/**
 * Bottom sheet mobile. Pegangan di atas mengganti tinggi: ringkas (±320px) ↔ luas (±75% layar).
 */
export function MobileSheet({ children, className }: MobileSheetProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      aria-label="Daftar entitas"
      className={cn(
        "absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-card border-t border-border bg-surface transition-[height] duration-300",
        expanded ? "h-[75dvh]" : "h-80",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? "Perkecil daftar" : "Perbesar daftar"}
        className="flex shrink-0 justify-center pt-2.5 pb-1"
      >
        <span aria-hidden className="h-1 w-9 rounded-control bg-border-strong" />
      </button>
      {children}
    </section>
  );
}
