import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./button-styles";

export type { ButtonSize, ButtonVariant } from "./button-styles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
}

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
      className={cn(buttonClass({ variant, size, fullWidth }), className)}
      {...rest}
    >
      {isLoading ? <Loader2 className="animate-spin" aria-hidden /> : leftIcon}
      {children}
    </button>
  );
}
