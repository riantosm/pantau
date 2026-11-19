import { cn } from "@/utils/cn";

interface ServerWakeBannerProps {
  seconds: number;
  className?: string;
}

/**
 * Muncul kalau data belum datang setelah beberapa detik: server Render free sedang bangun
 * dari tidur (±30–60 detik). Bentuknya mengikuti state "Server bangun" di artboard States.
 */
export function ServerWakeBanner({ seconds, className }: ServerWakeBannerProps) {
  return (
    <div role="status" className={cn("flex max-w-sm flex-col gap-2", className)}>
      <div className="flex items-center gap-3 rounded-control border border-border-strong bg-surface-2 px-4 py-2.5">
        <span
          aria-hidden
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-border-strong border-t-text-strong"
        />
        <span className="text-sm text-text-strong">Menyiapkan server…</span>
        <span className="ml-auto text-[13px] text-text-muted tabular-nums">{seconds} dtk</span>
      </div>
      <p className="rounded-card bg-surface/90 px-4 py-2 text-[13px] font-light text-text-3">
        Server gratis sedang dibangunkan, biasanya 30–60 detik. Data akan muncul otomatis.
      </p>
    </div>
  );
}
