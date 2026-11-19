import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { SearchField } from "@/components/molecules/SearchField";
import { APP_NAME } from "@/constants/app";
import { useEntities } from "@/hooks/use-entities";
import { useEntityTypes } from "@/hooks/use-entity-types";
import { useMapFilters } from "@/hooks/use-map-filters";
import { useSelectedEntity } from "@/hooks/use-selected-entity";
import { ConnectionStatus } from "@/layouts/map/ConnectionStatus";
import { EntityDetail } from "@/layouts/map/EntityDetail";
import { EntityFilters, TypeChips } from "@/layouts/map/EntityFilters";
import { EntityList } from "@/layouts/map/EntityList";
import { MapStage } from "@/layouts/map/MapStage";
import { MobileSheet } from "@/layouts/map/MobileSheet";
import { SidePanel } from "@/layouts/map/SidePanel";
import { StatusSummary } from "@/layouts/map/StatusSummary";
import { TopBar } from "@/layouts/map/TopBar";

/**
 * Halaman tunggal: peta + daftar entitas.
 * Desktop (≥ lg): top bar · sidebar · peta · panel kanan.
 * Mobile: peta penuh, header + pencarian di atas peta, daftar di bottom sheet.
 */
export function MapPage() {
  const { entities, status, error, loadEntities, reloadEntities } = useEntities();
  const { types, typeById, loadEntityTypes, reloadEntityTypes } = useEntityTypes();
  const filters = useMapFilters(entities);
  const { selected, selectedId, select } = useSelectedEntity(entities);

  useEffect(() => {
    loadEntities();
    loadEntityTypes();
  }, [loadEntities, loadEntityTypes]);

  const retry = () => {
    void reloadEntities();
    void reloadEntityTypes();
  };
  const isLoading = status === "idle" || status === "loading";
  const selectedType = selected ? typeById.get(selected.typeId) : undefined;

  const list = (compact: boolean) => (
    <EntityList
      entities={filters.filtered}
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

  return (
    <div className="flex h-dvh flex-col">
      <TopBar apiStatus={status} className="hidden lg:flex" />

      <div className="relative flex min-h-0 flex-1">
        {/* Sidebar desktop */}
        <aside className="hidden w-[340px] shrink-0 flex-col border-r border-border lg:flex">
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
            />
          </div>
          {list(false)}
        </aside>

        <MapStage
          overlay={
            <div className="absolute inset-x-4 top-4 z-10 flex flex-col gap-3 lg:hidden">
              <div className="flex items-center justify-between">
                <span className="font-serif text-[28px] leading-none text-text-strong">
                  {APP_NAME}
                </span>
                <ConnectionStatus status={status} variant="pill" />
              </div>
              <SearchField
                label="Cari entitas"
                size="lg"
                value={filters.query}
                onChange={(e) => filters.setQuery(e.target.value)}
              />
            </div>
          }
        />

        {/* Panel kanan desktop: muncul saat ada entitas yang dipilih */}
        {selected ? (
          <SidePanel className="hidden lg:flex">
            <EntityDetail entity={selected} type={selectedType} onClose={() => select(null)} />
          </SidePanel>
        ) : null}

        {/* Mobile: tombol tambah mengambang + bottom sheet */}
        <Button size="lg" disabled className="absolute right-4 bottom-[336px] z-20 lg:hidden">
          Tambah entitas
        </Button>
        <MobileSheet className="lg:hidden">
          {selected ? (
            <EntityDetail entity={selected} type={selectedType} onClose={() => select(null)} />
          ) : (
            <>
              <StatusSummary
                counts={filters.counts}
                variant="boxed"
                isLoading={isLoading}
                className="mx-5 mt-2 mb-3.5"
              />
              <TypeChips
                types={types}
                value={filters.typeFilter}
                onChange={filters.setTypeFilter}
                layout="scroll"
                className="px-5 pb-3"
              />
              <div className="flex min-h-0 flex-1 flex-col border-t border-border">
                {list(true)}
              </div>
            </>
          )}
        </MobileSheet>
      </div>
    </div>
  );
}
