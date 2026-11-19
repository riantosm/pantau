import { z } from "zod";
import type { EntityType, EntityTypeIcon } from "@/types/entity-type.types";

export const ENTITY_TYPE_ICON_NAMES: readonly EntityTypeIcon[] = [
  "truck",
  "cpu",
  "building",
  "pin",
  "box",
  "radio",
];

/** Sama dengan backend (internal/entitytype/dto.go). Nama kembar dicek backend → 409 NAME_TAKEN. */
export const entityTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "wajib diisi")
    .min(2, "minimal 2 karakter")
    .max(50, "maksimal 50 karakter"),
  icon: z.enum(ENTITY_TYPE_ICON_NAMES as [EntityTypeIcon, ...EntityTypeIcon[]], {
    error: "pilih ikon",
  }),
});

export type EntityTypeFormValues = z.input<typeof entityTypeSchema>;

export const toEntityTypeFormValues = (t?: EntityType): EntityTypeFormValues =>
  t ? { name: t.name, icon: t.icon } : { name: "", icon: undefined as unknown as EntityTypeIcon };
