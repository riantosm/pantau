import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Navigation, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { buttonClass } from "@/components/atoms/Button/button-styles";
import { Eyebrow } from "@/components/atoms/Eyebrow";
import { IconButton } from "@/components/atoms/IconButton";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import type { EntityType } from "@/types/entity-type.types";
import type { Entity } from "@/types/entity.types";
import { cn } from "@/utils/cn";
import { formatCoords, formatDateTime } from "@/utils/format";
import { buildMapsLink, detectMapsPlatform } from "@/utils/maps-link";

interface EntityDetailProps {
  entity: Entity;
  type?: EntityType;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** Isi panel detail entitas. Dipakai di panel kanan (desktop) dan bottom sheet (mobile). */
export function EntityDetail({ entity, type, onClose, onEdit, onDelete }: EntityDetailProps) {
  const attributes = Object.entries(entity.attributes);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <Eyebrow>{type?.name ?? "Tanpa jenis"}</Eyebrow>
        <IconButton aria-label="Tutup detail" icon={<X strokeWidth={1.5} />} onClick={onClose} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto px-6 pb-6">
        <div className="flex flex-col gap-2.5">
          <h2 className="font-serif text-[34px] leading-[1.13] tracking-[0.01em] text-text-strong">
            {entity.name}
          </h2>
          <div className="flex items-center gap-2.5">
            <StatusBadge status={entity.status} />
            <span className="text-[13px] text-text-muted tabular-nums">
              {/* 8 karakter terakhir: awalan ObjectID berisi waktu, jadi sama untuk data yang dibuat bersamaan */}
              ID {entity.id.slice(-8)}
            </span>
          </div>
          <p className="font-light text-text-3">{entity.description || "Belum ada deskripsi."}</p>
        </div>

        <CoordinateCard
          name={entity.name}
          latitude={entity.latitude}
          longitude={entity.longitude}
        />

        <dl className="flex flex-col text-sm">
          <dt className="border-b border-border pb-2 text-[13px] text-text-muted">Atribut</dt>
          {attributes.length === 0 ? (
            <dd className="border-b border-border py-2.5 text-text-muted">
              Belum ada atribut tambahan
            </dd>
          ) : (
            attributes.map(([k, v]) => <Row key={k} label={k} value={v} />)
          )}
          <Row label="Dibuat" value={formatDateTime(entity.createdAt)} />
          <Row label="Diperbarui" value={formatDateTime(entity.updatedAt)} />
        </dl>
      </div>

      <div className="flex gap-2 border-t border-border px-6 py-4">
        <Button variant="outline" fullWidth onClick={onEdit} disabled={!onEdit}>
          Ubah
        </Button>
        <Button variant="danger" fullWidth onClick={onDelete} disabled={!onDelete}>
          Hapus
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border py-2.5">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-right break-words text-text">{value}</dd>
    </div>
  );
}

interface CoordinateCardProps {
  name: string;
  latitude: number;
  longitude: number;
}

function CoordinateCard({ name, latitude, longitude }: CoordinateCardProps) {
  const [copied, setCopied] = useState(false);
  const coords = formatCoords(latitude, longitude);
  // Desktop → Google Maps di tab baru; Android/iOS → langsung ke aplikasi peta di HP.
  const platform = useMemo(
    () => detectMapsPlatform(navigator.userAgent, navigator.maxTouchPoints),
    [],
  );
  const maps = buildMapsLink(latitude, longitude, name, platform);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coords);
      setCopied(true);
    } catch {
      // Clipboard ditolak browser: biarkan, koordinat tetap bisa diblok manual.
    }
  };

  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-border bg-surface-2 p-4">
      <span className="text-[13px] text-text-muted">Koordinat</span>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[19px] tracking-[-0.02em] text-text-strong tabular-nums select-all">
          {coords}
        </span>
        <IconButton
          aria-label={copied ? "Koordinat tersalin" : "Salin koordinat"}
          icon={copied ? <Check strokeWidth={2} /> : <Copy strokeWidth={1.5} />}
          onClick={copy}
        />
      </div>
      <span className="text-xs text-text-faint">Latitude, longitude · WGS84</span>
      <a
        href={maps.href}
        {...(maps.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={cn(buttonClass({ variant: "subtle", size: "sm" }), "mt-2 self-start")}
      >
        <Navigation strokeWidth={1.5} aria-hidden />
        {maps.label}
        {maps.newTab ? (
          <>
            <ExternalLink strokeWidth={1.5} className="text-text-muted" aria-hidden />
            <span className="sr-only">(tab baru)</span>
          </>
        ) : null}
      </a>
    </div>
  );
}
