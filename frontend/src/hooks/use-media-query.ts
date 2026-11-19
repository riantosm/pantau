import { useCallback, useSyncExternalStore } from "react";

/** true kalau media query cocok; ikut berubah saat jendela diubah ukurannya. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Breakpoint layout desktop (Tailwind `lg`). */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
