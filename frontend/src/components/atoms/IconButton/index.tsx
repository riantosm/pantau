import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export type IconButtonVariant = "subtle" | "raised" | "danger";
export type IconButtonSize = "sm" | "md";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Wajib: tombol ikon tidak punya teks, jadi butuh label untuk pembaca layar. */
  "aria-label": string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  subtle: "border-border-strong text-text-3 hover:text-text-strong",
  raised: "border-border-strong bg-surface-2 text-text hover:text-text-strong",
  danger: "border-danger-line text-danger",
};

const SIZE_CLASS: Record<IconButtonSize, string> = {
  sm: "size-8 [&_svg]:size-3.5",
  md: "size-[38px] [&_svg]:size-4",
};

export function IconButton({
  icon,
  variant = "subtle",
  size = "sm",
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-control border transition",
        "disabled:cursor-not-allowed disabled:opacity-40",
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
