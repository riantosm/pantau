import { useEffect, useMemo, useState, type ReactNode } from "react";
import type L from "leaflet";
import { BrandMark } from "@/components/atoms/BrandMark";
import { Button } from "@/components/atoms/Button";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { SearchField } from "@/components/molecules/SearchField";
import { ToastView } from "@/components/molecules/ToastView";
import { APP_NAME } from "@/constants/app";
import { useElapsedSeconds } from "@/hooks/use-elapsed-seconds";
import { useEntities } from "@/hooks/use-entities";
import { useEntityTypes } from "@/hooks/use-entity-types";
import { useMapFilters } from "@/hooks/use-map-filters";
import { useMapMode } from "@/hooks/use-map-mode";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useSelectedEntity } from "@/hooks/use-selected-entity";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorCode } from "@/services/http-client";
import type { EntityType, EntityTypeInput } from "@/types/entity-type.types";
import type { EntityInput } from "@/types/entity.types";
import { ConnectionStatus } from "@/layouts/map/ConnectionStatus";
import { EntityDetail } from "@/layouts/map/EntityDetail";
import { EntityFilters, TypeChips } from "@/layouts/map/EntityFilters";
import { EntityForm } from "@/layouts/map/EntityForm";
import { EntityList } from "@/layouts/map/EntityList";
import { EntityTypesPanel } from "@/layouts/map/EntityTypesPanel";
import { MapNotice } from "@/layouts/map/MapNotice";
import { MapStage, type MapControlHandlers } from "@/layouts/map/MapStage";
import { MapView } from "@/layouts/map/MapView";
import { MobileSheet, type MobileSheetSize } from "@/layouts/map/MobileSheet";
import { PickLocationPanel } from "@/layouts/map/PickLocationPanel";
import { ServerWakeBanner } from "@/layouts/map/ServerWakeBanner";
import { SidePanel } from "@/layouts/map/SidePanel";
import { StatusSummary } from "@/layouts/map/StatusSummary";
import { TopBar } from "@/layouts/map/TopBar";
import { fitToEntities } from "@/utils/map";

/** Banner "Menyiapkan server…" baru muncul kalau data belum datang setelah sekian detik. */
const WAKE_BANNER_AFTER_S = 3;

/** Error dari service membawa error axios di `cause`; ambil kode backend-nya. */
const codeOf = (error: unknown) => getApiErrorCode(error instanceof Error ? error.cause : error);
const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

/**
 * Halaman tunggal: peta + daftar entitas + tambah/ubah/hapus + kelola jenis.
 * Desktop (≥ lg): top bar · sidebar · peta · panel kanan.
 * Mobile: peta penuh, header + pencarian di atas peta, daftar & form di bottom sheet.
 */
export function MapPage() {
  const isDesktop = useIsDesktop();
  const entityApi = useEntities();
  const typeApi = useEntityTypes();
  const { entities, status, error } = entityApi;
  const { types, typeById } = typeApi;
  const filters = useMapFilters(entities);
  const { selected, selectedId, select } = useSelectedEntity(entities);
  const mapMode = useMapMode();
  const toast = useToast();
  const [map, setMap] = useState<L.Map | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { loadEntities } = entityApi;
  const { loadEntityTypes } = typeApi;
  useEffect(() => {
    loadEntities();
    loadEntityTypes();
  }, [loadEntities, loadEntityTypes]);

  const isLoading = status === "idle" || status === "loading";
  const waitedSeconds = useElapsedSeconds(isLoading);
  const showWakeBanner = isLoading && waitedSeconds >= WAKE_BANNER_AFTER_S;
  const { filtered } = filters;
  const { mode, editingId, draft } = mapMode;
  const editingEntity = editingId ? (entities.find((e) => e.id === editingId) ?? null) : null;
  const canAdd = mode === "browse" && status === "loaded";

  const retry = () => {
    void entityApi.reloadEntities();
    void typeApi.reloadEntityTypes();
  };

  const controls = useMemo<MapControlHandlers | null>(
    () =>
      map && {
        onZoomIn: () => map.zoomIn(),
        onZoomOut: () => map.zoomOut(),
        onFitAll: () => fitToEntities(map, filtered),
      },
    [map, filtered],
  );

  // ---------- Entitas: simpan & hapus ----------

  const saveEntity = async (input: EntityInput) => {
    try {
      if (editingEntity) {
        const saved = await entityApi.saveEntity(editingEntity, input);
        mapMode.exitMode();
        select(saved.id);
        toast.success("Perubahan disimpan");
      } else {
        const created = await entityApi.createEntity(input);
        mapMode.exitMode();
        if (filters.isFiltering) filters.resetFilters(); // supaya entitas baru pasti terlihat
        select(created.id);
        toast.success(`Entitas "${created.name}" ditambahkan`);
      }
    } catch (err) {
      if (editingEntity && codeOf(err) === "NOT_FOUND") {
        // Entitas sudah dihapus dari tempat lain: tutup form, buang dari daftar.
        entityApi.forgetEntity(editingEntity.id);
        mapMode.exitMode();
        select(null);
        toast.error("Entitas sudah tidak ada");
        return;
      }
      throw err; // form memetakan error validasi ke field
    }
  };

  const deleteSelected = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await entityApi.deleteEntity(selected);
      toast.success(`Entitas "${selected.name}" dihapus`);
      select(null);
    } catch (err) {
      if (codeOf(err) === "NOT_FOUND") {
        entityApi.forgetEntity(selected.id);
        select(null);
        toast.error("Gagal menghapus. Entitas sudah tidak ada.");
      } else {
        toast.error(messageOf(err, "Gagal menghapus entitas"));
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // ---------- Jenis: tambah, ubah, hapus ----------

  const createType = async (input: EntityTypeInput) => {
    const created = await typeApi.createEntityType(input);
    toast.success(`Jenis "${created.name}" ditambahkan`);
  };

  const saveType = async (id: string, input: EntityTypeInput) => {
    await typeApi.saveEntityType(id, input);
    toast.success("Jenis diperbarui");
  };

  const deleteType = async (type: EntityType): Promise<boolean> => {
    try {
      await typeApi.deleteEntityType(type);
      toast.success(`Jenis "${type.name}" dihapus`);
      return true;
    } catch (err) {
      const code = codeOf(err);
      toast.error(
        code === "NOT_FOUND" ? "Jenis sudah tidak ada" : messageOf(err, "Gagal menghapus jenis"),
      );
      // 409 TYPE_IN_USE (ada entitas baru dari tempat lain) / 404: muat ulang angka pemakaian.
      if (code === "TYPE_IN_USE" || code === "NOT_FOUND") void typeApi.reloadEntityTypes();
      return false;
    }
  };

  // ---------- Isi panel (satu instance: panel kanan di desktop, bottom sheet di mobile) ----------

  let panel: ReactNode = null;
  let sheetSize: MobileSheetSize = "list";
  if (mode === "pick") {
    panel = <PickLocationPanel onManual={mapMode.startManualCreate} onCancel={mapMode.exitMode} />;
    sheetSize = "fit";
  } else if (mode === "form") {
    panel = (
      <EntityForm
        key={editingId ?? "new"}
        entity={editingEntity}
        types={types}
        draft={draft}
        onDraftChange={mapMode.setDraft}
        onCancel={mapMode.exitMode}
        onSave={saveEntity}
      />
    );
    sheetSize = "tall";
  } else if (mode === "types") {
    panel = (
      <EntityTypesPanel
        types={types}
        onClose={mapMode.exitMode}
        onCreate={createType}
        onSave={saveType}
        onDelete={deleteType}
      />
    );
    sheetSize = "tall";
  } else if (selected) {
    panel = (
      <EntityDetail
        entity={selected}
        type={typeById.get(selected.typeId)}
        onClose={() => select(null)}
        onEdit={() => mapMode.startEdit(selected)}
        onDelete={() => setConfirmDelete(true)}
      />
    );
  }

  const list = (compact: boolean) => (
    <EntityList
      entities={filtered}
      total={entities.length}
      typeById={typeById}
      selectedId={selectedId}
      onSelect={select}
      status={status}
      error={error}
      onRetry={retry}
      isFiltering={filters.isFiltering}
      onResetFilters={filters.resetFilters}
      compact={compact}
      showHeader={!compact}
      className="flex-1"
    />
  );

  // Kartu di tengah peta untuk keadaan gagal / database kosong.
  const notice =
    status === "error" ? (
      <MapNotice
        tone="danger"
        title="Data tidak bisa dimuat"
        // Pesan dari service sudah berisi saran (mis. "Server tidak bisa dihubungi. Periksa koneksi…").
        message={error ?? "Periksa koneksi internet, lalu coba lagi."}
        action={
          <Button variant="outline" onClick={retry}>
            Coba lagi
          </Button>
        }
      />
    ) : status === "loaded" && entities.length === 0 && mode === "browse" ? (
      <MapNotice
        title="Belum ada entitas"
        message="Tambahkan kendaraan, perangkat IoT, atau fasilitas pertama dengan memilih titiknya di peta."
        action={
          <Button variant="outline" onClick={mapMode.startCreate}>
            Tambah entitas pertama
          </Button>
        }
      />
    ) : null;

  return (
    <div className="flex h-dvh flex-col">
      {isDesktop ? (
        <TopBar apiStatus={status} onAdd={canAdd ? mapMode.startCreate : undefined} />
      ) : null}

      <div className="relative flex min-h-0 flex-1">
        {isDesktop ? (
          <aside className="flex w-[340px] shrink-0 flex-col border-r border-border">
            <StatusSummary
              counts={filters.counts}
              isLoading={isLoading}
              className="border-b border-border px-6 pt-[22px] pb-[18px]"
            />
            <div className="flex flex-col gap-2.5 px-6 py-4">
              <SearchField
                label="Cari entitas"
                value={filters.query}
                onChange={(e) => filters.setQuery(e.target.value)}
              />
              <EntityFilters
                types={types}
                typeFilter={filters.typeFilter}
                statusFilter={filters.statusFilter}
                onTypeChange={filters.setTypeFilter}
                onStatusChange={filters.setStatusFilter}
                onManageTypes={
                  mode === "browse" || mode === "types" ? mapMode.openTypes : undefined
                }
              />
            </div>
            {list(false)}
          </aside>
        ) : null}

        <MapStage
          controls={controls}
          map={
            <MapView
              entities={filtered}
              selectedId={selectedId}
              mode={mode}
              editingId={editingId}
              draft={draft}
              onSelect={select}
              onPlace={mapMode.setDraft}
              onReady={setMap}
            />
          }
          overlay={
            // Lapisan di atas peta. pointer-events-none supaya peta tetap bisa digeser di sela-selanya.
            <div className="pointer-events-none absolute inset-0 z-[1000] [&>*]:pointer-events-auto">
              {!isDesktop && (mode === "browse" || mode === "pick") ? (
                <div className="absolute inset-x-4 top-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-serif text-[28px] leading-none text-text-strong">
                      <BrandMark size={30} />
                      {APP_NAME}
                    </span>
                    <ConnectionStatus status={status} variant="pill" />
                  </div>
                  {mode === "browse" ? (
                    <SearchField
                      label="Cari entitas"
                      size="lg"
                      value={filters.query}
                      onChange={(e) => filters.setQuery(e.target.value)}
                    />
                  ) : null}
                </div>
              ) : null}

              {mode === "pick" ? (
                <div className="absolute inset-x-4 top-[72px] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-control border border-border-strong bg-surface-2 py-1.5 pr-1.5 pl-[18px] lg:top-5">
                  <span className="text-sm text-text-strong">
                    Klik di peta untuk menaruh lokasi entitas
                  </span>
                  <Button variant="subtle" size="sm" onClick={mapMode.exitMode}>
                    Batal
                  </Button>
                </div>
              ) : null}

              {showWakeBanner ? (
                <ServerWakeBanner
                  seconds={waitedSeconds}
                  className="absolute inset-x-4 top-[132px] mx-auto lg:top-5"
                />
              ) : null}

              {notice ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 pb-[340px] lg:pb-6 [&>*]:pointer-events-auto">
                  {notice}
                </div>
              ) : null}

              <ToastView
                toast={toast.toast}
                onDismiss={toast.dismiss}
                className="absolute inset-x-4 bottom-[340px] lg:bottom-[76px]"
              />
            </div>
          }
        />

        {isDesktop ? (
          panel ? (
            <SidePanel>{panel}</SidePanel>
          ) : null
        ) : (
          <MobileSheet
            size={panel ? sheetSize : "list"}
            label={panel ? "Panel entitas" : "Daftar entitas"}
            className="z-[1100]"
            collapseKey={selectedId}
            floating={
              canAdd && !panel ? (
                <Button size="lg" onClick={mapMode.startCreate}>
                  Tambah entitas
                </Button>
              ) : null
            }
          >
            {panel ?? (
              <>
                {/* Area ringkasan ikut jadi pegangan tarik (selain garis pegangan di atasnya). */}
                <div data-sheet-drag className="touch-none px-5 pt-1 pb-3.5 select-none">
                  <StatusSummary counts={filters.counts} variant="boxed" isLoading={isLoading} />
                </div>
                <div className="flex items-center gap-1.5 px-5 pb-3">
                  <TypeChips
                    types={types}
                    value={filters.typeFilter}
                    onChange={filters.setTypeFilter}
                    layout="scroll"
                    className="min-w-0 flex-1"
                  />
                  <Button variant="subtle" size="sm" onClick={mapMode.openTypes}>
                    Kelola
                  </Button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col border-t border-border">
                  {list(true)}
                </div>
              </>
            )}
          </MobileSheet>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete && selected !== null}
        title="Hapus entitas?"
        confirmLabel="Ya, hapus"
        isLoading={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={deleteSelected}
      >
        <strong className="font-medium text-text-strong">{selected?.name}</strong> akan dihapus dari
        peta dan database. Tindakan ini tidak bisa dibatalkan.
      </ConfirmDialog>
    </div>
  );
}
