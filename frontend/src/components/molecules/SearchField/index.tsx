import { useId, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/utils/cn";

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: string;
  size?: "md" | "lg";
}

/** Input pencarian pill dengan ikon kaca pembesar dan label tersembunyi untuk pembaca layar. */
export function SearchField({ label, size = "md", className, ...rest }: SearchFieldProps) {
  const id = useId();
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-text-faint",
          size === "md" ? "left-4 size-4" : "left-4 size-[18px]",
        )}
      />
      <input
        id={id}
        type="search"
        placeholder={label}
        className={cn(
          "w-full rounded-control border border-border-strong bg-surface-2 text-text",
          size === "md" ? "h-[38px] pr-4 pl-10 text-sm" : "h-11 pr-4 pl-11 text-[15px]",
        )}
        {...rest}
      />
    </div>
  );
}
