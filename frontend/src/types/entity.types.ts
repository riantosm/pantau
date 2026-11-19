import type { LoadStatus } from "@/types/api.types";

export type EntityStatus = "active" | "maintenance" | "inactive";

export interface Entity {
  id: string;
  name: string;
  typeId: string;
  status: EntityStatus;
  description: string;
  latitude: number;
  longitude: number;
  attributes: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/** Body POST/PUT /entities. */
export type EntityInput = Omit<Entity, "id" | "createdAt" | "updatedAt">;

export interface IEntityReduxState {
  items: Entity[];
  status: LoadStatus;
  error: string | null;
}
