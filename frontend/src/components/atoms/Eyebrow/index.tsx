import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/** Label kategori kecil berwarna copper. Satu-satunya tempat copper dipakai. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("text-[13px] font-semibold tracking-[-0.02em] text-copper", className)}>
      {children}
    </span>
  );
}
