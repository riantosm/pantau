import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import type { EntityType, EntityTypeInput } from "@/types/entity-type.types";
import { cn } from "@/utils/cn";
import { EntityTypeForm } from "@/layouts/map/EntityTypeForm";
import { EntityTypeIcon } from "@/layouts/map/EntityTypeIcon";
import { PanelHeader } from "@/layouts/map/PanelHeader";

interface EntityTypesPanelProps {
  types: EntityType[];
  onClose: () => void;
  onCreate: (input: EntityTypeInput) => Promise<void>;
  onSave: (id: string, input: EntityTypeInput) => Promise<void>;
  /** Mengembalikan true kalau berhasil (pesan sukses/gagal ditangani pemanggil). */
  onDelete: (type: EntityType) => Promise<boolean>;
}

type Editing = { kind: "create" } | { kind: "edit"; id: string } | null;

const usageLabel = (n: number) => (n === 0 ? "Belum dipakai" : `${n} entitas memakai jenis ini`);

/** Master data jenis entitas: daftar, tambah/ubah inline, hapus (hanya jika tidak dipakai). */
export function EntityTypesPanel({
  types,
  onClose,
  onCreate,
  onSave,
  onDelete,
}: EntityTypesPanelProps) {
  const [editing, setEditing] = useState<Editing>(null);
  const [toDelete, setToDelete] = useState<EntityType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const ok = await onDelete(toDelete);
    setDeleting(false);
    setToDelete(null);
    if (ok && editing?.kind === "edit" && editing.id === toDelete.id) setEditing(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader
        eyebrow="Master data"
        title="Jenis entitas"
        closeLabel="Tutup panel jenis"
        onClose={onClose}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-5 pb-6 lg:px-6">
        <p className="text-sm font-light text-text-3">
          Dipakai untuk filter, ikon daftar, dan form entitas. Jenis yang masih dipakai entitas
          tidak bisa dihapus.
        </p>

        {editing?.kind === "create" ? (
          <EntityTypeForm
            onCancel={() => setEditing(null)}
            onSave={async (input) => {
              await onCreate(input);
              setEditing(null);
            }}
          />
        ) : null}

        <ul className="flex flex-col border-t border-border">
          {types.map((t) => {
            const inUse = t.entityCount > 0;
            if (editing?.kind === "edit" && editing.id === t.id) {
              return (
                <li key={t.id} className="border-b border-border py-3">
                  <EntityTypeForm
                    type={t}
                    onCancel={() => setEditing(null)}
                    onSave={async (input) => {
                      await onSave(t.id, input);
                      setEditing(null);
                    }}
                  />
                </li>
              );
            }
            return (
              <li
                key={t.id}
                className={cn("flex items-center gap-3 border-b border-border px-2 py-3")}
              >
                <EntityTypeIcon icon={t.icon} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-text-strong">{t.name}</span>
                  <span className="text-xs text-text-muted">{usageLabel(t.entityCount)}</span>
                </span>
                <IconButton
                  aria-label={`Ubah jenis ${t.name}`}
                  icon={<Pencil strokeWidth={1.5} />}
                  className="text-text"
                  onClick={() => setEditing({ kind: "edit", id: t.id })}
                />
                <IconButton
                  aria-label={`Hapus jenis ${t.name}`}
                  title={
                    inUse
                      ? `Tidak bisa dihapus: masih dipakai ${t.entityCount} entitas`
                      : `Hapus ${t.name}`
                  }
                  variant="danger"
                  icon={<Trash2 strokeWidth={1.5} />}
                  disabled={inUse}
                  onClick={() => setToDelete(t)}
                />
              </li>
            );
          })}
        </ul>

        {editing === null ? (
          <Button
            variant="dashed"
            className="self-start"
            onClick={() => setEditing({ kind: "create" })}
          >
            + Tambah jenis
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Hapus jenis?"
        confirmLabel="Ya, hapus"
        isLoading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      >
        Jenis <strong className="font-medium text-text-strong">{toDelete?.name}</strong> tidak
        dipakai entitas mana pun dan akan dihapus permanen.
      </ConfirmDialog>
    </div>
  );
}
