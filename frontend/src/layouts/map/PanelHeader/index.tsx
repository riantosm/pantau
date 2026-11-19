import { X } from "lucide-react";
import { Eyebrow } from "@/components/atoms/Eyebrow";
import { IconButton } from "@/components/atoms/IconButton";

interface PanelHeaderProps {
  eyebrow: string;
  title?: string;
  closeLabel: string;
  onClose: () => void;
}

/** Kepala panel: eyebrow + tombol tutup, lalu judul serif. */
export function PanelHeader({ eyebrow, title, closeLabel, onClose }: PanelHeaderProps) {
  return (
    <div className="flex flex-col gap-1 px-5 pt-4 pb-2 lg:px-6">
      <div className="flex items-center justify-between">
        <Eyebrow>{eyebrow}</Eyebrow>
        <IconButton aria-label={closeLabel} icon={<X strokeWidth={1.5} />} onClick={onClose} />
      </div>
      {title ? (
        <h2 className="font-serif text-[30px] leading-[1.13] tracking-[0.01em] text-text-strong lg:text-[34px]">
          {title}
        </h2>
      ) : null}
    </div>
  );
}
