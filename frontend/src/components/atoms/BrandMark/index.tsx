import { cn } from "@/utils/cn";

interface BrandMarkProps {
  /** Lebar & tinggi dalam px. */
  size?: number;
  /** Cincin copper berputar, dipakai sebagai indikator memuat. */
  spinning?: boolean;
  className?: string;
}

/**
 * Logo Pantau: radar dengan titik lokasi, marker Aktif (hijau) dan Perawatan (wajik kuning).
 * Sumber bentuk: docs/brand/icon.svg. Di sini warnanya memakai token tema, bukan hex.
 * Dekoratif (aria-hidden): selalu dampingi dengan teks "Pantau" atau label lain.
 */
export function BrandMark({ size = 32, spinning = false, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <rect width="96" height="96" rx="22" fill="var(--bg)" />
      <rect
        x="0.75"
        y="0.75"
        width="94.5"
        height="94.5"
        rx="21.25"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="1.5"
      />
      <circle cx="48" cy="48" r="29" fill="none" stroke="var(--border-strong)" strokeWidth="2" />
      <path
        d="M48 12v10M48 74v10M12 48h10M74 48h10"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Saat memuat, cincin copper menjadi busur yang berputar. */}
      <circle
        cx="48"
        cy="48"
        r="17"
        fill="none"
        stroke="var(--copper)"
        strokeWidth={spinning ? 3 : 2}
        strokeLinecap="round"
        strokeDasharray={spinning ? "70 37" : undefined}
        className={cn(spinning && "origin-center animate-spin [transform-box:fill-box]")}
      />
      <circle cx="48" cy="48" r="7" fill="var(--text-strong)" />
      <circle cx="69" cy="29" r="4.5" fill="var(--success)" />
      <rect
        x="25"
        y="62"
        width="7"
        height="7"
        rx="1"
        transform="rotate(45 28.5 65.5)"
        fill="var(--warning)"
      />
    </svg>
  );
}
