import { BrandMark } from "@/components/atoms/BrandMark";
import { APP_NAME } from "@/constants/app";
import { cn } from "@/utils/cn";

interface LoadingScreenProps {
  variant?: "full" | "inline";
  label?: string;
}

/** full = layar muat aplikasi (logo + nama) · inline = indikator kecil di dalam halaman. */
export function LoadingScreen({ variant = "full", label }: LoadingScreenProps) {
  const full = variant === "full";
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        full ? "min-h-dvh" : "py-12",
      )}
    >
      <BrandMark size={full ? 64 : 40} spinning />
      {full ? (
        <span className="font-serif text-[28px] leading-none text-text-strong">{APP_NAME}</span>
      ) : null}
      <span className={cn("text-sm text-text-muted", full && "sr-only")}>{label ?? "Memuat…"}</span>
    </div>
  );
}
