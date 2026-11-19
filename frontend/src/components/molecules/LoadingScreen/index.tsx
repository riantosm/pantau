import { APP_NAME } from "@/constants/app";
import { cn } from "@/utils/cn";

interface LoadingScreenProps {
  variant?: "full" | "inline";
  label?: string;
}

export function LoadingScreen({ variant = "full", label }: LoadingScreenProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        variant === "full" ? "min-h-dvh" : "py-12",
      )}
    >
      <svg className="size-9 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="var(--border-strong)" strokeWidth="2" />
        <path
          d="M22 12a10 10 0 0 0-10-10"
          stroke="var(--text-strong)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {variant === "full" ? (
        <span className="font-serif text-[28px] leading-none text-text-strong">{APP_NAME}</span>
      ) : null}
      <span className={cn("text-sm text-text-muted", variant === "full" && "sr-only")}>
        {label ?? "Memuat…"}
      </span>
    </div>
  );
}
