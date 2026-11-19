import { cn } from "@/utils/cn";

/**
 * primary = putih terisi (maks. satu per layar) · outline = garis putih ·
 * subtle = garis abu · dashed = aksi tambah sekunder · danger = garis merah · danger-solid = konfirmasi hapus
 */
export type ButtonVariant = "primary" | "outline" | "subtle" | "dashed" | "danger" | "danger-solid";
export type ButtonSize = "sm" | "md" | "lg";

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

interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

/**
 * Kelas tampilan tombol. Dipakai komponen `Button`, dan juga untuk `<a>` yang harus tampil
 * seperti tombol (mis. "Buka di Google Maps"), supaya tautan tetap tautan secara semantik.
 */
export function buttonClass({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: ButtonClassOptions = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-control bg-transparent font-medium whitespace-nowrap transition",
    "disabled:cursor-not-allowed disabled:opacity-40",
    SIZE_CLASS[size],
    VARIANT_CLASS[variant],
    // Di dalam baris flex, tombol fullWidth berbagi lebar (bukan masing-masing 100%).
    fullWidth && "w-full flex-1 shrink",
  );
}
