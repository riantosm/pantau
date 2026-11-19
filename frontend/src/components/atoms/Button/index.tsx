import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * primary = putih terisi (maks. satu per layar) · outline = garis putih ·
 * subtle = garis abu · dashed = aksi tambah sekunder · danger = garis merah · danger-solid = konfirmasi hapus
 */
export type ButtonVariant = "primary" | "outline" | "subtle" | "dashed" | "danger" | "danger-solid";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-fg hover:brightness-90",
  outline: "border border-text-strong text-text-strong hover:bg-surface-2",
  subtle: "border border-border-strong text-text hover:bg-surface-2",
  dashed: "border border-dashed border-text-faint text-text hover:bg-surface-2",
  danger: "border border-danger-line text-danger hover:bg-surface-2",
  "danger-solid": "bg-danger font-semibold text-bg hover:brightness-95",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3.5 text-[13px] [&_svg]:size-3.5",
  md: "h-10 gap-2 px-5 text-sm [&_svg]:size-4",
  lg: "h-12 gap-2 px-6 text-[15px] [&_svg]:size-[18px]",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  fullWidth = false,
  disabled,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-control bg-transparent font-medium whitespace-nowrap transition",
        "disabled:cursor-not-allowed disabled:opacity-40",
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        // Di dalam baris flex, tombol fullWidth berbagi lebar (bukan masing-masing 100%).
        fullWidth && "w-full flex-1 shrink",
        className,
      )}
      {...rest}
    >
      {isLoading ? <Loader2 className="animate-spin" aria-hidden /> : leftIcon}
      {children}
    </button>
  );
}
