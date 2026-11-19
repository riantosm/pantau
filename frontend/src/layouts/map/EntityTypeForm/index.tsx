import { useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/atoms/Button";
import { Eyebrow } from "@/components/atoms/Eyebrow";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { errorId } from "@/utils/form";
import { ENTITY_TYPE_ICON_LABEL, ENTITY_TYPE_ICONS } from "@/constants/entity-icons";
import {
  ENTITY_TYPE_ICON_NAMES,
  entityTypeSchema,
  toEntityTypeFormValues,
  type EntityTypeFormValues,
} from "@/schemas/entity-type.schema";
import { getApiFieldErrors } from "@/services/http-client";
import type { EntityType, EntityTypeInput } from "@/types/entity-type.types";
import { cn } from "@/utils/cn";

interface EntityTypeFormProps {
  /** undefined = jenis baru. */
  type?: EntityType;
  onCancel: () => void;
  /** Melempar Error (error axios di `cause`) kalau gagal, mis. 409 NAME_TAKEN. */
  onSave: (input: EntityTypeInput) => Promise<void>;
}

/** Form kecil di dalam panel Kelola jenis: nama + pilihan 6 ikon. */
export function EntityTypeForm({ type, onCancel, onSave }: EntityTypeFormProps) {
  const uid = useId();
  const nameId = `${uid}-name`;
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EntityTypeFormValues>({
    resolver: zodResolver(entityTypeSchema),
    defaultValues: toEntityTypeFormValues(type),
  });
  const name = useWatch({ control, name: "name" }) ?? "";

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSave({ name: values.name.trim(), icon: values.icon });
    } catch (error) {
      const fields = getApiFieldErrors(error instanceof Error ? error.cause : error);
      if (fields.name || fields.icon) {
        if (fields.name)
          setError("name", { type: "server", message: fields.name }, { shouldFocus: true });
        if (fields.icon) setError("icon", { type: "server", message: fields.icon });
      } else {
        setServerError(error instanceof Error ? error.message : "Gagal menyimpan jenis");
      }
    }
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-3.5 rounded-card border border-border-strong bg-surface-2 p-4"
    >
      <Eyebrow>{type ? "Ubah jenis" : "Jenis baru"}</Eyebrow>
      {serverError ? (
        <p role="alert" className="text-sm text-danger">
          {serverError}
        </p>
      ) : null}

      <FormField
        id={nameId}
        label="Nama jenis"
        counter={`${name.trim().length}/50`}
        error={errors.name?.message}
      >
        <Input
          id={nameId}
          placeholder="mis. Drone"
          autoComplete="off"
          className="bg-surface"
          invalid={!!errors.name}
          aria-describedby={errors.name ? errorId(nameId) : undefined}
          {...register("name")}
        />
      </FormField>

      <Controller
        control={control}
        name="icon"
        render={({ field, fieldState }) => (
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-[13px] text-text-muted">Ikon</legend>
            <div className="grid grid-cols-6 gap-1.5">
              {ENTITY_TYPE_ICON_NAMES.map((icon) => {
                const Icon = ENTITY_TYPE_ICONS[icon];
                const pressed = field.value === icon;
                return (
                  <button
                    key={icon}
                    type="button"
                    aria-pressed={pressed}
                    aria-label={ENTITY_TYPE_ICON_LABEL[icon]}
                    title={ENTITY_TYPE_ICON_LABEL[icon]}
                    onClick={() => field.onChange(icon)}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-control border transition",
                      pressed
                        ? "border-text-strong text-text-strong"
                        : "border-border-strong text-text-3 hover:text-text",
                    )}
                  >
                    <Icon className="size-[17px]" strokeWidth={1.5} aria-hidden />
                  </button>
                );
              })}
            </div>
            {fieldState.error ? (
              <span className="text-xs text-danger">{fieldState.error.message}</span>
            ) : null}
          </fieldset>
        )}
      />

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" className="flex-[2]" isLoading={isSubmitting}>
          {type ? "Simpan jenis" : "Tambah jenis"}
        </Button>
      </div>
    </form>
  );
}
