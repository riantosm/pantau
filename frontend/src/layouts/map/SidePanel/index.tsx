import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/** Panel kanan desktop (detail, form, kelola jenis). */
export function SidePanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      aria-label="Panel entitas"
      className={cn(
        "flex w-[380px] shrink-0 flex-col border-l border-border bg-surface xl:w-[400px]",
        className,
      )}
    >
      {children}
    </section>
  );
}
