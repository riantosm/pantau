import { describe, expect, it } from "vitest";
import {
  EMPTY_ENTITY_FORM,
  entitySchema,
  toEntityInput,
  type EntityFormValues,
} from "@/schemas/entity.schema";

const valid: EntityFormValues = {
  ...EMPTY_ENTITY_FORM,
  latitude: "-6.9175",
  longitude: "107.6191",
  name: "Truk Logistik 01",
  typeId: "6740b0020000000000000000",
};

/** Pesan pertama per field, sama seperti yang ditampilkan react-hook-form. */
const errorsOf = (v: EntityFormValues) => {
  const r = entitySchema.safeParse(v);
  const out: Record<string, string> = {};
  if (!r.success) {
    for (const issue of r.error.issues) out[issue.path.join(".")] ??= issue.message;
  }
  return out;
};

describe("entitySchema", () => {
  it("menerima data valid, termasuk latitude 0 (khatulistiwa)", () => {
    expect(errorsOf(valid)).toEqual({});
    expect(errorsOf({ ...valid, latitude: "0", longitude: "0" })).toEqual({});
  });

  it("menerima koma sebagai pemisah desimal", () => {
    expect(errorsOf({ ...valid, latitude: "-6,9175" })).toEqual({});
    expect(toEntityInput({ ...valid, latitude: "-6,9175" }).latitude).toBe(-6.9175);
  });

  it("menolak koordinat di luar batas, kosong, atau bukan angka", () => {
    expect(errorsOf({ ...valid, latitude: "91" }).latitude).toBe("harus antara -90 dan 90");
    expect(errorsOf({ ...valid, longitude: "-181" }).longitude).toBe("harus antara -180 dan 180");
    expect(errorsOf({ ...valid, latitude: "" }).latitude).toBe("wajib diisi");
    expect(errorsOf({ ...valid, latitude: "abc" }).latitude).toBe("harus berupa angka");
  });

  it("memeriksa nama setelah di-trim", () => {
    expect(errorsOf({ ...valid, name: "  ab  " }).name).toBe("minimal 3 karakter");
    expect(errorsOf({ ...valid, name: "   " }).name).toBe("wajib diisi");
  });

  it("mewajibkan jenis dan membatasi deskripsi", () => {
    expect(errorsOf({ ...valid, typeId: "" }).typeId).toBe("pilih jenis entitas");
    expect(errorsOf({ ...valid, description: "x".repeat(501) }).description).toBe(
      "maksimal 500 karakter",
    );
  });

  it("atribut: baris kosong diabaikan, nama wajib & tidak boleh kembar", () => {
    expect(errorsOf({ ...valid, attributes: [{ key: "", value: "" }] })).toEqual({});
    expect(errorsOf({ ...valid, attributes: [{ key: "", value: "x" }] })["attributes.0.key"]).toBe(
      "nama atribut wajib diisi",
    );
    expect(
      errorsOf({
        ...valid,
        attributes: [
          { key: "Plat", value: "a" },
          { key: "plat", value: "b" },
        ],
      })["attributes.1.key"],
    ).toBe("nama atribut kembar");
  });

  it("toEntityInput membuang baris kosong dan merapikan spasi", () => {
    const input = toEntityInput({
      ...valid,
      name: "  Truk  ",
      attributes: [
        { key: " Plat ", value: " D 1 " },
        { key: "", value: "" },
      ],
    });
    expect(input.name).toBe("Truk");
    expect(input.attributes).toEqual({ Plat: "D 1" });
  });
});
