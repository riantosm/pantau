import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Chip filter/pilihan yang sedang aktif. */
  pressed?: boolean;
  leading?: ReactNode;
}

/** Tombol pill untuk filter dan pilihan tunggal. Status aktif = garis & teks putih. */
export function Chip({ pressed = false, leading, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex items-center gap-2 rounded-control border px-3 py-[5px] text-[13px] transition",
        "[&_svg]:size-[15px]",
        pressed
          ? "border-text-strong text-text-strong"
          : "border-border-strong text-text-3 hover:text-text",
        className,
      )}
      {...rest}
    >
      {leading}
      {children}
    </button>
  );
}
