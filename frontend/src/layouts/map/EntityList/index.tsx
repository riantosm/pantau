import { Button } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import type { LoadStatus } from "@/types/api.types";
import type { EntityType } from "@/types/entity-type.types";
import type { Entity } from "@/types/entity.types";
import { cn } from "@/utils/cn";
import { EntityListItem } from "@/layouts/map/EntityListItem";

interface EntityListProps {
  entities: Entity[];
  total: number;
  typeById: Map<string, EntityType>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  status: LoadStatus;
  error: string | null;
  onRetry: () => void;
  isFiltering: boolean;
  onResetFilters: () => void;
  compact?: boolean;
  showHeader?: boolean;
  className?: string;
}

export function EntityList({
  entities,
  total,
  typeById,
  selectedId,
  onSelect,
  status,
  error,
  onRetry,
  isFiltering,
  onResetFilters,
  compact = false,
  showHeader = true,
  className,
}: EntityListProps) {
  const isLoading = status === "idle" || status === "loading";

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      {showHeader ? (
        <div className="flex justify-between border-y border-border px-6 py-2 text-[13px] text-text-muted">
          <span>Entitas · {isLoading ? "…" : `${entities.length} dari ${total}`}</span>
          <span>Status</span>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <ListSkeleton compact={compact} />
        ) : status === "error" ? (
          <EmptyState
            tone="danger"
            eyebrow="Gagal memuat"
            message={error ?? "Data entitas tidak bisa dimuat."}
            action={
              <Button variant="outline" size="sm" onClick={onRetry}>
                Coba lagi
              </Button>
            }
          />
        ) : entities.length === 0 ? (
          isFiltering ? (
            <EmptyState
              eyebrow="Tidak ada hasil"
              message="Tidak ada entitas yang cocok dengan pencarian atau filter."
              action={
                <Button variant="outline" size="sm" onClick={onResetFilters}>
                  Reset filter
                </Button>
              }
            />
          ) : (
            <EmptyState
              eyebrow="Belum ada entitas"
              message="Tambahkan entitas pertama dengan memilih lokasinya di peta."
            />
          )
        ) : (
          <ul aria-label="Daftar entitas">
            {entities.map((e) => (
              <EntityListItem
                key={e.id}
                entity={e}
                type={typeById.get(e.typeId)}
                selected={e.id === selectedId}
                onSelect={onSelect}
                compact={compact}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ListSkeleton({ compact }: { compact: boolean }) {
  return (
    <ul aria-hidden className="animate-pulse">
      {Array.from({ length: 6 }, (_, i) => (
        <li
          key={i}
          className={cn(
            "flex items-center gap-3 border-b border-border py-3",
            compact ? "px-5" : "px-6",
          )}
        >
          {compact ? null : <span className="size-[34px] rounded-full bg-surface-2" />}
          <span className="flex flex-1 flex-col gap-1.5">
            <span className="h-2.5 w-16 rounded-control bg-surface-2" />
            <span className="h-3.5 w-40 rounded-control bg-surface-2" />
          </span>
          <span className="h-5 w-14 rounded-control bg-surface-2" />
        </li>
      ))}
    </ul>
  );
}
