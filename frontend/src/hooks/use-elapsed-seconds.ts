import { useEffect, useState } from "react";

/** Detik yang sudah berlalu sejak `active` menjadi true. Kembali ke 0 saat `active` false. */
export function useElapsedSeconds(active: boolean): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) return;
    const startedAt = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => {
      clearInterval(id);
      setSeconds(0);
    };
  }, [active]);

  return seconds;
}
