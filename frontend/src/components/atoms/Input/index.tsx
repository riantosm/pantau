import type { InputHTMLAttributes, Ref } from "react";
import { cn } from "@/utils/cn";

export type InputSize = "sm" | "md";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  ref?: Ref<HTMLInputElement>;
  size?: InputSize;
  invalid?: boolean;
}

const SIZE_CLASS: Record<InputSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-10 px-4 text-[15px]",
};

/** Input pill. `invalid` mewarnai garis merah dan memasang aria-invalid. */
export function Input({ size = "md", invalid = false, className, ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full min-w-0 rounded-control border bg-surface-2 text-text-strong",
        SIZE_CLASS[size],
        invalid ? "border-danger-input" : "border-border-strong",
        className,
      )}
      {...rest}
    />
  );
}
