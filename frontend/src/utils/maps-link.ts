/** Platform pembuka peta: menentukan link yang dipakai tombol "Buka di Maps". */
export type MapsPlatform = "ios" | "android" | "desktop";

/**
 * Tebak platform dari user agent. iPadOS 13+ mengaku "Macintosh", jadi dibedakan lewat layar sentuh.
 * Parameter dibuat eksplisit supaya mudah diuji.
 */
export function detectMapsPlatform(userAgent: string, maxTouchPoints = 0): MapsPlatform {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "desktop";
}

export interface MapsLink {
  href: string;
  label: string;
  /** true = buka di tab baru (web). Link aplikasi (geo:) dibuka di tab yang sama. */
  newTab: boolean;
}

/**
 * Link untuk membuka koordinat di aplikasi peta.
 * - desktop: Google Maps di tab baru
 * - Android: URI `geo:`, langsung membuka aplikasi peta (Google Maps atau pilihan pengguna)
 * - iOS: maps.apple.com, yang dibuka sistem langsung di aplikasi Maps bawaan
 */
export function buildMapsLink(
  latitude: number,
  longitude: number,
  name: string,
  platform: MapsPlatform,
): MapsLink {
  const ll = `${latitude},${longitude}`;
  const label = encodeURIComponent(name);
  switch (platform) {
    case "android":
      return { href: `geo:${ll}?q=${ll}(${label})`, label: "Buka di aplikasi Maps", newTab: false };
    case "ios":
      return {
        href: `https://maps.apple.com/?ll=${ll}&q=${label}`,
        label: "Buka di aplikasi Maps",
        newTab: true,
      };
    default:
      return {
        href: `https://www.google.com/maps/search/?api=1&query=${ll}`,
        label: "Buka di Google Maps",
        newTab: true,
      };
  }
}
