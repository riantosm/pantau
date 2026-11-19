import type { LoadStatus } from "@/types/api.types";

/** Nama ikon yang dikenal backend; dipetakan ke ikon lucide di `constants/entity-icons.ts`. */
export type EntityTypeIcon = "truck" | "cpu" | "building" | "pin" | "box" | "radio";

export interface EntityType {
  id: string;
  name: string;
  icon: EntityTypeIcon;
  entityCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Body POST/PUT /entity-types. */
export type EntityTypeInput = Pick<EntityType, "name" | "icon">;

export interface IEntityTypeReduxState {
  items: EntityType[];
  status: LoadStatus;
  error: string | null;
}
