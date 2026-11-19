import { Crosshair } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { PanelHeader } from "@/layouts/map/PanelHeader";

interface PickLocationPanelProps {
  onManual: () => void;
  onCancel: () => void;
}

/** Langkah 1 tambah entitas: klik peta, atau isi koordinat manual. */
export function PickLocationPanel({ onManual, onCancel }: PickLocationPanelProps) {
  return (
    <div className="flex flex-col">
      <PanelHeader
        eyebrow="Langkah 1 dari 2"
        title="Pilih lokasi"
        closeLabel="Batal tambah entitas"
        onClose={onCancel}
      />
      <div className="flex flex-col gap-5 px-5 pb-6 lg:px-6">
        <p className="font-light text-text-3">
          Klik titik mana pun di peta. Koordinat terisi otomatis dan masih bisa diubah di langkah
          berikutnya.
        </p>
        <div
          aria-hidden
          className="hidden h-[140px] items-center justify-center rounded-card border border-dashed border-border-strong text-text-faint lg:flex"
        >
          <Crosshair className="size-10" strokeWidth={1} />
        </div>
        <Button variant="outline" onClick={onManual}>
          Isi koordinat manual
        </Button>
      </div>
    </div>
  );
}
