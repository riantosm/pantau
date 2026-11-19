const dateTime = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** "2026-11-18T08:12:00Z" → "18 Nov 2026, 15.12" (zona waktu browser). */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : dateTime.format(d);
}

/** Koordinat 5 desimal (±1 meter): "-6.90320, 107.59200". */
export function formatCoords(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
