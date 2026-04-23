"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

export const emptyToNull = (v) => (v === "" || v === undefined ? null : v);

export const categoryFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(100),
  descripcion: z
    .union([z.string().max(255), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v == null ? null : v)),
  imagen_url: z.preprocess(
    emptyToNull,
    z.union([z.null(), z.string().url("URL de imagen inválida")]),
  ),
  orden: z.coerce.number().int().min(0),
});

export const defaultCategoryFormValues = {
  nombre: "",
  descripcion: "",
  imagen_url: "",
  orden: 0,
};

export function mapCategoriaToForm(row) {
  return {
    nombre: row.nombre ?? "",
    descripcion: row.descripcion ?? "",
    imagen_url: row.imagen_url ?? "",
    orden: row.orden ?? 0,
  };
}

const FORM_FIELDS = ["nombre", "descripcion", "imagen_url", "orden"];

/**
 * Campos create/edit categoría (react-hook-form).
 * El estado activo/inactivo se gestiona solo desde la card (toggle), no desde este formulario.
 * @param {{
 *   form: import("react-hook-form").UseFormReturn<any>,
 *   onSubmit: (e?: import("react").BaseSyntheticEvent) => void,
 *   saving: boolean,
 *   imageUploading: boolean,
 *   onImageUploadingChange: (v: boolean) => void,
 *   onCancel: () => void,
 * }} props
 */
export default function AdminCategoryForm({
  form,
  onSubmit,
  saving,
  imageUploading,
  onImageUploadingChange,
  onCancel,
}) {
  const busy = saving || imageUploading;
  const rootMsg = form.formState.errors.root?.message;

  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <div className="space-y-3 px-1 pb-2 sm:space-y-4 sm:px-0.5">
        {rootMsg && (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {rootMsg}
          </p>
        )}

        <div>
          <label htmlFor="cat-nombre" className="mb-1 block text-sm font-medium text-zinc-800">
            Nombre <span className="text-red-600">*</span>
          </label>
          <input
            id="cat-nombre"
            autoComplete="off"
            className="min-h-12 w-full rounded-xl border border-zinc-200 px-3 py-3 text-base outline-none ring-primary ring-offset-2 ring-offset-white focus:ring-2"
            {...form.register("nombre")}
          />
          {form.formState.errors.nombre && (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.nombre.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="cat-desc" className="mb-1 block text-sm font-medium text-zinc-800">
            Descripción
          </label>
          <textarea
            id="cat-desc"
            rows={3}
            className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-3 text-base outline-none ring-primary ring-offset-2 ring-offset-white focus:ring-2"
            {...form.register("descripcion")}
          />
          {form.formState.errors.descripcion && (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.descripcion.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="cat-orden" className="mb-1 block text-sm font-medium text-zinc-800">
            Orden
          </label>
          <input
            id="cat-orden"
            type="number"
            inputMode="numeric"
            min={0}
            className="min-h-12 w-full rounded-xl border border-zinc-200 px-3 py-3 text-base outline-none ring-primary ring-offset-2 ring-offset-white focus:ring-2"
            {...form.register("orden")}
          />
          {form.formState.errors.orden && (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.orden.message}</p>
          )}
        </div>

        <Controller
          name="imagen_url"
          control={form.control}
          render={({ field }) => (
            <ImageUploader
              label="Imagen"
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={saving}
              onUploadingChange={onImageUploadingChange}
              helperText="Subida a Cloudinary; al guardar se persiste imagen_url."
            />
          )}
        />
        {form.formState.errors.imagen_url && (
          <p className="text-xs text-red-600">{form.formState.errors.imagen_url.message}</p>
        )}
      </div>

      <div className="mt-3 flex shrink-0 flex-row gap-2 border-t border-zinc-100 pt-3 sm:mt-4 sm:pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white py-2.5 text-sm font-semibold text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12 sm:py-3"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:min-h-12 sm:py-3"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Guardar
        </button>
      </div>
    </form>
  );
}

export { FORM_FIELDS as CATEGORY_FORM_SERVER_FIELDS };
