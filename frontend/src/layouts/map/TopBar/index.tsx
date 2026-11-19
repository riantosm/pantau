import { BrandMark } from "@/components/atoms/BrandMark";
import { Button } from "@/components/atoms/Button";
import { APP_NAME, APP_TAGLINE } from "@/constants/app";
import type { LoadStatus } from "@/types/api.types";
import { cn } from "@/utils/cn";
import { ConnectionStatus } from "@/layouts/map/ConnectionStatus";

interface TopBarProps {
  apiStatus: LoadStatus;
  /** undefined = tombol disembunyikan (mis. saat form terbuka: satu tombol putih per layar). */
  onAdd?: () => void;
  className?: string;
}

export function TopBar({ apiStatus, onAdd, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-3.5",
        className,
      )}
    >
      <div className="flex items-center gap-5">
        <h1 className="flex items-center gap-2.5 font-serif text-[28px] leading-none tracking-[0.01em] text-text-strong">
          <BrandMark size={32} />
          {APP_NAME}
        </h1>
        <span className="text-[13px] font-semibold tracking-[-0.02em] text-text-muted">
          {APP_TAGLINE}
        </span>
      </div>
      <div className="flex min-h-[38px] items-center gap-3.5">
        <ConnectionStatus status={apiStatus} />
        {onAdd ? (
          <Button size="sm" className="h-[38px] px-5 text-sm" onClick={onAdd}>
            Tambah entitas
          </Button>
        ) : null}
      </div>
    </header>
  );
}
