import { useEffect, useId, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Chip } from "@/components/atoms/Chip";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { StatusMark } from "@/components/atoms/StatusMark";
import { TextArea } from "@/components/atoms/TextArea";
import { FormField } from "@/components/molecules/FormField";
import { errorId } from "@/utils/form";
import { ENTITY_TYPE_ICONS } from "@/constants/entity-icons";
import { ENTITY_STATUSES, ENTITY_STATUS_LABEL } from "@/constants/entity-status";
import {
  EMPTY_ENTITY_FORM,
  entitySchema,
  formatCoordinate,
  MAX_ATTRIBUTES,
  parseCoordinate,
  toEntityFormValues,
  toEntityInput,
  type EntityFormValues,
} from "@/schemas/entity.schema";
import { getApiFieldErrors } from "@/services/http-client";
import type { EntityType } from "@/types/entity-type.types";
import type { Entity, EntityInput } from "@/types/entity.types";
import type { LatLng } from "@/types/map-ui.types";
import { PanelHeader } from "@/layouts/map/PanelHeader";

interface EntityFormProps {
  /** null = tambah entitas baru. */
  entity: Entity | null;
  types: EntityType[];
  /** Posisi pin di peta. Berubah saat peta diklik atau pin digeser. */
  draft: LatLng | null;
  onDraftChange: (point: LatLng) => void;
  onCancel: () => void;
  /** Simpan ke API. Melempar Error (dengan error axios di `cause`) kalau gagal. */
  onSave: (input: EntityInput) => Promise<void>;
}

type FieldName = Exclude<keyof EntityFormValues, "attributes">;
const FIELD_NAMES: readonly FieldName[] = [
  "latitude",
  "longitude",
  "name",
  "typeId",
  "status",
  "description",
];

const inRange = (n: number, limit: number) => Number.isFinite(n) && Math.abs(n) <= limit;

/** Form tambah/ubah entitas. Validasi zod di browser, lalu error backend dipetakan ke field yang sama. */
export function EntityForm({
  entity,
  types,
  draft,
  onDraftChange,
  onCancel,
  onSave,
}: EntityFormProps) {
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const isEdit = entity !== null;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<EntityFormValues>({
    resolver: zodResolver(entitySchema),
    defaultValues: entity
      ? toEntityFormValues(entity)
      : {
          ...EMPTY_ENTITY_FORM,
          latitude: draft ? formatCoordinate(draft.latitude) : "",
          longitude: draft ? formatCoordinate(draft.longitude) : "",
        },
  });
  const attributes = useFieldArray({ control, name: "attributes" });
  const [latitude, longitude, name, description] = useWatch({
    control,
    name: ["latitude", "longitude", "name", "description"],
  });

  // Peta → form: pin dipindah (klik/geser) → isi ulang input koordinat.
  useEffect(() => {
    if (!draft) return;
    const lat = parseCoordinate(getValues("latitude"));
    const lng = parseCoordinate(getValues("longitude"));
    if (lat === draft.latitude && lng === draft.longitude) return;
    const opts = { shouldDirty: true, shouldValidate: submitCount > 0 };
    setValue("latitude", formatCoordinate(draft.latitude), opts);
    setValue("longitude", formatCoordinate(draft.longitude), opts);
  }, [draft, getValues, setValue, submitCount]);

  // Form → peta: koordinat diketik dan valid → pin ikut pindah.
  useEffect(() => {
    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);
    if (inRange(lat, 90) && inRange(lng, 180)) onDraftChange({ latitude: lat, longitude: lng });
  }, [latitude, longitude, onDraftChange]);

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSave(toEntityInput(values));
    } catch (error) {
      // 400 VALIDATION_ERROR: pesan backend ditaruh di field yang sama dengan validasi browser.
      const fields = getApiFieldErrors(error instanceof Error ? error.cause : error);
      let mapped = 0;
      for (const [field, message] of Object.entries(fields)) {
        if ((FIELD_NAMES as readonly string[]).includes(field)) {
          setError(field as FieldName, { type: "server", message }, { shouldFocus: mapped === 0 });
          mapped++;
        } else if (field === "attributes") {
          setError("root.attributes", { type: "server", message });
          mapped++;
        }
      }
      if (mapped === 0) {
        setServerError(error instanceof Error ? error.message : "Gagal menyimpan entitas");
      }
    }
  });

  const attrErrors = errors.attributes;
  const attrRootMessage =
    attrErrors?.root?.message ?? attrErrors?.message ?? errors.root?.attributes?.message;
  const errorCount =
    FIELD_NAMES.filter((f) => errors[f]).length + (attrErrors || errors.root?.attributes ? 1 : 0);

  const describe = (field: FieldName) => (errors[field] ? errorId(fid(field)) : undefined);

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <PanelHeader
        eyebrow={isEdit ? "Ubah data" : "Langkah 2 dari 2"}
        title={isEdit ? "Ubah entitas" : "Entitas baru"}
        closeLabel="Tutup form"
        onClose={onCancel}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-5 pt-2 pb-5 lg:px-6">
        {submitCount > 0 && errorCount > 0 ? (
          <p
            role="alert"
            className="rounded-card border border-danger-line px-3.5 py-2.5 text-sm text-danger"
          >
            Periksa {errorCount} isian yang ditandai. Server memeriksa aturan yang sama.
          </p>
        ) : null}
        {serverError ? (
          <p
            role="alert"
            className="rounded-card border border-danger-line px-3.5 py-2.5 text-sm text-danger"
          >
            {serverError}
          </p>
        ) : null}

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-[13px] text-text-muted">Lokasi</legend>
          <div className="grid grid-cols-2 gap-2.5">
            <FormField
              id={fid("latitude")}
              label="Latitude"
              size="sm"
              error={errors.latitude?.message}
            >
              <Input
                id={fid("latitude")}
                inputMode="decimal"
                autoComplete="off"
                placeholder="-6.91470"
                className="tabular-nums"
                invalid={!!errors.latitude}
                aria-describedby={describe("latitude")}
                {...register("latitude")}
              />
            </FormField>
            <FormField
              id={fid("longitude")}
              label="Longitude"
              size="sm"
              error={errors.longitude?.message}
            >
              <Input
                id={fid("longitude")}
                inputMode="decimal"
                autoComplete="off"
                placeholder="107.60980"
                className="tabular-nums"
                invalid={!!errors.longitude}
                aria-describedby={describe("longitude")}
                {...register("longitude")}
              />
            </FormField>
          </div>
          <span className="text-xs text-text-muted">
            Klik peta (atau geser pin) untuk memindahkan lokasi.
          </span>
        </fieldset>

        <FormField
          id={fid("name")}
          label="Nama"
          counter={`${name.trim().length}/100`}
          error={errors.name?.message}
        >
          <Input
            id={fid("name")}
            placeholder="mis. Truk Logistik 03"
            autoComplete="off"
            invalid={!!errors.name}
            aria-describedby={describe("name")}
            {...register("name")}
          />
        </FormField>

        <Controller
          control={control}
          name="typeId"
          render={({ field, fieldState }) => (
            <fieldset
              className="flex flex-col gap-1.5"
              aria-describedby={fieldState.error ? errorId(fid("typeId")) : undefined}
            >
              <legend className="mb-1.5 text-[13px] text-text-muted">Jenis</legend>
              <div className="flex flex-wrap gap-1.5">
                {types.map((t) => {
                  const Icon = ENTITY_TYPE_ICONS[t.icon];
                  return (
                    <Chip
                      key={t.id}
                      pressed={field.value === t.id}
                      onClick={() => field.onChange(t.id)}
                      onBlur={field.onBlur}
                      leading={<Icon strokeWidth={1.5} aria-hidden />}
                      className="py-[7px] pr-3.5 pl-2.5 text-sm"
                    >
                      {t.name}
                    </Chip>
                  );
                })}
              </div>
              {fieldState.error ? (
                <span id={errorId(fid("typeId"))} className="text-xs text-danger">
                  {fieldState.error.message}
                </span>
              ) : types.length === 0 ? (
                <span className="text-xs text-text-muted">
                  Belum ada jenis. Tambahkan dulu lewat "Kelola jenis".
                </span>
              ) : null}
            </fieldset>
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field, fieldState }) => (
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-[13px] text-text-muted">Status</legend>
              <div className="flex flex-wrap gap-1.5">
                {ENTITY_STATUSES.map((s) => (
                  <Chip
                    key={s}
                    pressed={field.value === s}
                    onClick={() => field.onChange(s)}
                    leading={<StatusMark status={s} />}
                    className="px-3.5 py-[7px] text-sm"
                  >
                    {ENTITY_STATUS_LABEL[s]}
                  </Chip>
                ))}
              </div>
              {fieldState.error ? (
                <span className="text-xs text-danger">{fieldState.error.message}</span>
              ) : null}
            </fieldset>
          )}
        />

        <FormField
          id={fid("description")}
          label="Deskripsi (opsional)"
          counter={`${description.trim().length}/500`}
          error={errors.description?.message}
        >
          <TextArea
            id={fid("description")}
            placeholder="Catatan singkat tentang entitas ini"
            invalid={!!errors.description}
            aria-describedby={describe("description")}
            {...register("description")}
          />
        </FormField>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-[13px] text-text-muted">Atribut tambahan (opsional)</span>
            <span className="text-xs text-text-faint tabular-nums">
              {attributes.fields.length}/{MAX_ATTRIBUTES}
            </span>
          </div>
          {attributes.fields.map((row, i) => {
            const rowError = attrErrors?.[i]?.key?.message ?? attrErrors?.[i]?.value?.message;
            return (
              <div key={row.id} className="flex flex-col gap-1">
                <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_36px] gap-1.5">
                  <Input
                    size="sm"
                    aria-label={`Nama atribut ${i + 1}`}
                    placeholder="Nama, mis. Plat"
                    autoComplete="off"
                    invalid={!!attrErrors?.[i]?.key}
                    {...register(`attributes.${i}.key`)}
                  />
                  <Input
                    size="sm"
                    aria-label={`Nilai atribut ${i + 1}`}
                    placeholder="Nilai"
                    autoComplete="off"
                    invalid={!!attrErrors?.[i]?.value}
                    {...register(`attributes.${i}.value`)}
                  />
                  <IconButton
                    aria-label={`Hapus atribut ${i + 1}`}
                    icon={<X strokeWidth={1.5} />}
                    className="size-9"
                    onClick={() => attributes.remove(i)}
                  />
                </div>
                {rowError ? <span className="text-xs text-danger">{rowError}</span> : null}
              </div>
            );
          })}
          {attrRootMessage ? <span className="text-xs text-danger">{attrRootMessage}</span> : null}
          <Button
            variant="dashed"
            size="sm"
            className="self-start"
            disabled={attributes.fields.length >= MAX_ATTRIBUTES}
            onClick={() => attributes.append({ key: "", value: "" })}
          >
            + Tambah atribut
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-t border-border px-5 py-4 lg:px-6">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" className="flex-[2]" isLoading={isSubmitting}>
          {isEdit ? "Simpan perubahan" : "Simpan entitas"}
        </Button>
      </div>
    </form>
  );
}
