import { describe, expect, it } from "vitest";
import type { Entity } from "@/types/entity.types";
import { countByStatus, filterEntities } from "@/utils/entity-filter";

const make = (name: string, typeId: string, status: Entity["status"]): Entity => ({
  id: name,
  name,
  typeId,
  status,
  description: "",
  latitude: 0,
  longitude: 0,
  attributes: {},
  createdAt: "",
  updatedAt: "",
});

const list = [
  make("Truk Logistik 01", "t1", "active"),
  make("Motor Kurir 07", "t1", "maintenance"),
  make("Sensor Banjir", "t2", "inactive"),
];

describe("filterEntities", () => {
  it("tanpa filter mengembalikan semua", () => {
    expect(filterEntities(list, { query: "", typeId: null, status: null })).toHaveLength(3);
  });

  it("mencari nama tanpa beda huruf besar/kecil dan mengabaikan spasi tepi", () => {
    expect(filterEntities(list, { query: "  TRUK ", typeId: null, status: null })).toHaveLength(1);
  });

  it("menggabungkan filter jenis dan status", () => {
    expect(filterEntities(list, { query: "", typeId: "t1", status: "maintenance" })).toEqual([
      list[1],
    ]);
  });
});

describe("countByStatus", () => {
  it("menghitung per status dan total", () => {
    expect(countByStatus(list)).toEqual({ active: 1, maintenance: 1, inactive: 1, total: 3 });
  });
});
