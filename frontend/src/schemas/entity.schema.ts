import { z } from "zod";
import { ENTITY_STATUSES } from "@/constants/entity-status";
import type { Entity, EntityInput, EntityStatus } from "@/types/entity.types";

/**
 * Validasi form entitas. Aturannya sama dengan backend Go (internal/entity/dto.go),
 * supaya pesan muncul di browser dulu; backend tetap memeriksa ulang.
 *
 * Latitude/longitude disimpan sebagai teks di form (bisa diketik "-6,9" dengan koma),
 * lalu diubah ke angka di `toEntityInput`.
 */

/** "−6,91" / " -6.91 " → -6.91; teks kosong atau bukan angka → NaN. */
export function parseCoordinate(raw: string): number {
  const s = raw.trim().replace(",", ".");
  return s === "" ? Number.NaN : Number(s);
}

const coordinate = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, "wajib diisi")
    .refine((v) => Number.isFinite(parseCoordinate(v)), "harus berupa angka")
    .refine((v) => {
      const n = parseCoordinate(v);
      return !Number.isFinite(n) || (n >= min && n <= max);
    }, `harus antara ${min} dan ${max}`);

export const MAX_ATTRIBUTES = 10;

const attributeRow = z.object({
  key: z.string().trim().max(30, "nama maksimal 30 karakter"),
  value: z.string().trim().max(100, "nilai maksimal 100 karakter"),
});

export const entitySchema = z.object({
  latitude: coordinate(-90, 90),
  longitude: coordinate(-180, 180),
  name: z
    .string()
    .trim()
    .min(1, "wajib diisi")
    .min(3, "minimal 3 karakter")
    .max(100, "maksimal 100 karakter"),
  typeId: z.string().min(1, "pilih jenis entitas"),
  status: z.enum(ENTITY_STATUSES as [EntityStatus, ...EntityStatus[]], {
    error: "pilih status",
  }),
  description: z.string().trim().max(500, "maksimal 500 karakter"),
  attributes: z
    .array(attributeRow)
    .max(MAX_ATTRIBUTES, `maksimal ${MAX_ATTRIBUTES} atribut`)
    .superRefine((rows, ctx) => {
      const seen = new Set<string>();
      rows.forEach((row, i) => {
        if (row.key === "" && row.value === "") return; // baris kosong diabaikan
        if (row.key === "") {
          ctx.addIssue({ code: "custom", path: [i, "key"], message: "nama atribut wajib diisi" });
          return;
        }
        const k = row.key.toLocaleLowerCase("id");
        if (seen.has(k)) {
          ctx.addIssue({ code: "custom", path: [i, "key"], message: "nama atribut kembar" });
        }
        seen.add(k);
      });
    }),
});

export type EntityFormValues = z.infer<typeof entitySchema>;

export const EMPTY_ENTITY_FORM: EntityFormValues = {
  latitude: "",
  longitude: "",
  name: "",
  typeId: "",
  status: "active",
  description: "",
  attributes: [],
};

/** Koordinat untuk ditampilkan di input: 5 desimal (±1 meter). */
export const formatCoordinate = (n: number) => n.toFixed(5);

/** Entitas yang sudah ada → nilai awal form ubah. */
export function toEntityFormValues(e: Entity): EntityFormValues {
  return {
    latitude: formatCoordinate(e.latitude),
    longitude: formatCoordinate(e.longitude),
    name: e.name,
    typeId: e.typeId,
    status: e.status,
    description: e.description,
    attributes: Object.entries(e.attributes).map(([key, value]) => ({ key, value })),
  };
}

/** Nilai form yang sudah valid → body POST/PUT /entities. */
export function toEntityInput(v: EntityFormValues): EntityInput {
  const attributes: Record<string, string> = {};
  v.attributes.forEach(({ key, value }) => {
    if (key.trim()) attributes[key.trim()] = value.trim();
  });
  return {
    name: v.name.trim(),
    typeId: v.typeId,
    status: v.status,
    description: v.description.trim(),
    latitude: parseCoordinate(v.latitude),
    longitude: parseCoordinate(v.longitude),
    attributes,
  };
}
