import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { errorId } from "@/utils/form";

interface FormFieldProps {
  /** id input; dipakai untuk <label htmlFor> dan id pesan error (`<id>-error`). */
  id: string;
  label: string;
  error?: string;
  /** mis. "12/100". */
  counter?: string;
  hint?: ReactNode;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}

/** Label + input + pesan error/hint. Pasang `aria-describedby={errorId(id)}` di input. */
export function FormField({
  id,
  label,
  error,
  counter,
  hint,
  size = "md",
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <div className="flex justify-between gap-2">
        <label
          htmlFor={id}
          className={cn("text-text-muted", size === "md" ? "text-[13px]" : "text-xs")}
        >
          {label}
        </label>
        {counter ? <span className="text-xs text-text-faint tabular-nums">{counter}</span> : null}
      </div>
      {children}
      {error ? (
        <span id={errorId(id)} className="text-xs text-danger">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-text-muted">{hint}</span>
      ) : null}
    </div>
  );
}
