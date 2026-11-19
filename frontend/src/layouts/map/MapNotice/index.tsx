import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface MapNoticeProps {
  title: string;
  message: ReactNode;
  action?: ReactNode;
  tone?: "default" | "danger";
  className?: string;
}

/** Kartu pesan di tengah peta untuk keadaan kosong atau gagal memuat. */
export function MapNotice({ title, message, action, tone = "default", className }: MapNoticeProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex w-full max-w-sm flex-col items-start gap-3 rounded-card border bg-surface p-6",
        tone === "danger" ? "border-danger-line" : "border-border",
        className,
      )}
    >
      <span className="font-serif text-[30px] leading-[1.1] tracking-[0.01em] text-text-strong">
        {title}
      </span>
      <p className="font-light text-text-3">{message}</p>
      {action}
    </div>
  );
}
