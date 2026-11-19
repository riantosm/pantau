import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** tailwind-merge yang mengenal token custom di `src/css/index.css`. */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["card", "control", "area"],
      font: ["serif"],
    },
  },
});

/** Gabung class name; class Tailwind yang belakangan menang atas yang bentrok (`className` override). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}
