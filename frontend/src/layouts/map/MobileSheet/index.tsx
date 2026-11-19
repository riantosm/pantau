import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * list = daftar yang bisa digeser naik/turun · fit = setinggi isi (mis. langkah pilih lokasi) ·
 * tall = hampir penuh, peta tetap terlihat sedikit di atas (form tambah/ubah, kelola jenis).
 */
export type MobileSheetSize = "list" | "fit" | "tall";

interface MobileSheetProps {
  size?: MobileSheetSize;
  label: string;
  /** Elemen yang menempel di atas sheet dan ikut bergerak (mis. tombol Tambah entitas). */
  floating?: ReactNode;
  /**
   * Setiap kali nilai ini berubah ke nilai baru (bukan null), sheet kembali ringkas.
   * Dipakai dengan id entitas terpilih: setelah memilih dari daftar, peta & marker langsung terlihat.
   */
  collapseKey?: string | null;
  children: ReactNode;
  className?: string;
}

/** Tinggi ringkas (h-80). */
const COLLAPSED_PX = 320;
/** Saat diperbesar, header + pencarian di atas peta tetap terlihat. */
const TOP_GAP_PX = 140;
/** Geser kurang dari ini dianggap ketukan, bukan tarikan. */
const DRAG_THRESHOLD_PX = 6;

const expandedPx = () => Math.max(COLLAPSED_PX, window.innerHeight - TOP_GAP_PX);

/**
 * Bottom sheet mobile. Pada ukuran `list`, sheet bisa ditarik dari pegangan atau area ringkasan
 * (elemen ber-atribut `data-sheet-drag`) lalu menempel ke posisi ringkas atau luas.
 * Pegangan juga bisa diketuk / ditekan Enter untuk berganti posisi.
 */
export function MobileSheet({
  size = "list",
  label,
  floating,
  collapseKey = null,
  children,
  className,
}: MobileSheetProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const suppressClick = useRef(false);
  const [expanded, setExpanded] = useState(false);
  // Menyesuaikan state saat prop berubah, tanpa useEffect (pola yang dianjurkan React).
  const [prevCollapseKey, setPrevCollapseKey] = useState(collapseKey);
  if (collapseKey !== prevCollapseKey) {
    setPrevCollapseKey(collapseKey);
    if (collapseKey !== null) setExpanded(false);
  }
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const draggable = size === "list";

  /**
   * Gerak & lepas didengar di window (bukan di sheet), karena jari/kursor biasanya keluar dari
   * area sheet saat menarik ke atas.
   */
  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (!draggable || !(e.target as Element).closest("[data-sheet-drag]")) return;
    e.preventDefault(); // cegah teks terblok saat menarik
    const startH = sectionRef.current?.getBoundingClientRect().height ?? COLLAPSED_PX;
    const d = {
      startY: e.clientY,
      startH,
      lastY: e.clientY,
      lastT: e.timeStamp,
      v: 0,
      height: null as number | null,
    };

    const onMove = (ev: globalThis.PointerEvent) => {
      const dy = d.startY - ev.clientY; // positif = ke atas
      if (d.height === null && Math.abs(dy) < DRAG_THRESHOLD_PX) return;
      const dt = Math.max(1, ev.timeStamp - d.lastT);
      d.v = (d.lastY - ev.clientY) / dt; // px/ms, positif = ke atas
      d.lastY = ev.clientY;
      d.lastT = ev.timeStamp;
      d.height = Math.min(expandedPx(), Math.max(COLLAPSED_PX * 0.6, d.startH + dy));
      setDragHeight(d.height);
    };

    const onEnd = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      if (d.height === null) return; // cuma ketukan: biarkan onClick pegangan yang menangani
      // Lempar cepat menentukan arah; kalau pelan, menempel ke posisi terdekat.
      const middle = (COLLAPSED_PX + expandedPx()) / 2;
      setExpanded(Math.abs(d.v) > 0.5 ? d.v > 0 : d.height > middle);
      setDragHeight(null);
      // Klik yang menyusul tarikan jangan dianggap ketukan pegangan.
      suppressClick.current = true;
      setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  };

  const onHandleClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setExpanded((v) => !v);
  };

  const isDragging = dragHeight !== null;
  const showFloating = floating && draggable && !expanded;

  return (
    <section
      ref={sectionRef}
      aria-label={label}
      onPointerDown={onPointerDown}
      style={isDragging ? { height: dragHeight } : undefined}
      className={cn(
        "absolute inset-x-0 bottom-0 flex flex-col rounded-t-card border-t border-border bg-surface",
        !isDragging && "transition-[height] duration-300 ease-out",
        draggable && !isDragging && (expanded ? "h-[calc(100dvh-140px)]" : "h-80"),
        size === "fit" && "max-h-[60dvh]",
        size === "tall" && "h-[calc(100dvh-108px)]",
        className,
      )}
    >
      {showFloating ? (
        <div className="pointer-events-none absolute right-4 bottom-full mb-4 [&>*]:pointer-events-auto">
          {floating}
        </div>
      ) : null}

      {draggable ? (
        <button
          type="button"
          data-sheet-drag
          onClick={onHandleClick}
          aria-expanded={expanded}
          aria-label={expanded ? "Perkecil daftar" : "Perbesar daftar"}
          className="flex shrink-0 touch-none justify-center pt-3 pb-2 select-none"
        >
          <span aria-hidden className="h-1 w-9 rounded-control bg-border-strong" />
        </button>
      ) : null}
      {children}
    </section>
  );
}
