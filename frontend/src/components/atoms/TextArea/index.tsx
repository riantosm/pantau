import type { Ref, TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
  invalid?: boolean;
}

export function TextArea({ invalid = false, className, rows = 3, ...rest }: TextAreaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full resize-y rounded-area border bg-surface-2 px-4 py-2.5 text-[15px] text-text-strong",
        invalid ? "border-danger-input" : "border-border-strong",
        className,
      )}
      {...rest}
    />
  );
}
