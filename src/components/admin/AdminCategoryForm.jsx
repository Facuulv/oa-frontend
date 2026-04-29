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

const fieldBase =
  "min-h-12 w-full rounded-xl border px-3 py-3 text-base text-zinc-900 outline-none transition-shadow ring-primary ring-offset-2 ring-offset-white focus:ring-2";
const fieldOk = "border-zinc-200 bg-white";
const fieldErr = "border-red-300 bg-red-50/30 ring-red-200/60";

/**
 * Campos create/edit categoría (react-hook-form).
 * El estado activo/inactivo se gestiona solo desde la card (toggle), no desde este formulario.
 * @param {{
 *   form: import("react-hook-form").UseFormReturn<any>,
 *   onSubmit: (e?: import("react").BaseSyntheticEvent) => void,
 *   saving: boolean,
 *   imageUploading: boolean,
 *   onImageUploadingChange: (v: boolean) => void,
 *   onCancel?: () => void,
 *   formId?: string,
 *   showFooter?: boolean,
 * }} props
 */
export default function AdminCategoryForm({
  form,
  onSubmit,
  saving,
  imageUploading,
  onImageUploadingChange,
  onCancel,
  formId = "admin-category-form",
  showFooter = true,
}) {
  const busy = saving || imageUploading;
  const rootMsg = form.formState.errors.root?.message;
  const errs = form.formState.errors;

  return (
    <form id={formId} onSubmit={onSubmit} className="flex flex-col" noValidate>
      <div className="space-y-4 sm:space-y-5">
        {rootMsg && (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-snug text-red-800"
            role="alert"
          >
            {rootMsg}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="cat-nombre" className="block text-sm font-semibold text-zinc-800">
            Nombre <span className="text-red-600">*</span>
          </label>
          <input
            id="cat-nombre"
            data-modal-initial-focus
            autoComplete="off"
            placeholder="Ej. Bebidas, Promos…"
            className={`${fieldBase} ${errs.nombre ? fieldErr : fieldOk}`}
            {...form.register("nombre")}
          />
          {errs.nombre && <p className="text-xs font-medium text-red-600">{errs.nombre.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cat-desc" className="block text-sm font-semibold text-zinc-800">
            Descripción
          </label>
          <textarea
            id="cat-desc"
            rows={3}
            placeholder="Opcional · ayuda interna o en vitrinas"
            className={`w-full resize-none rounded-xl border px-3 py-3 text-base text-zinc-900 outline-none transition-shadow ring-primary ring-offset-2 ring-offset-white focus:ring-2 ${errs.descripcion ? fieldErr : fieldOk} ${errs.descripcion ? "" : "border-zinc-200 bg-white"}`}
            {...form.register("descripcion")}
          />
          {errs.descripcion && (
            <p className="text-xs font-medium text-red-600">{errs.descripcion.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cat-orden" className="block text-sm font-semibold text-zinc-800">
            Orden en listados
          </label>
          <input
            id="cat-orden"
            type="number"
            inputMode="numeric"
            min={0}
            className={`${fieldBase} ${errs.orden ? fieldErr : fieldOk}`}
            {...form.register("orden")}
          />
          <p className="text-[11px] leading-snug text-zinc-500">Menor número = más arriba cuando se ordena por orden.</p>
          {errs.orden && <p className="text-xs font-medium text-red-600">{errs.orden.message}</p>}
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
              disabled={busy}
              onUploadingChange={onImageUploadingChange}
            />
          )}
        />
        {errs.imagen_url && (
          <p className="text-xs font-medium text-red-600">{errs.imagen_url.message}</p>
        )}
      </div>

      {showFooter ? (
        <div className="mt-5 flex shrink-0 flex-row gap-2 border-t border-zinc-200/90 pt-4 sm:mt-6 sm:pt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white py-2.5 text-sm font-semibold text-zinc-800 outline-none ring-primary transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            aria-busy={saving}
            className="admin-pressable inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm outline-none ring-primary hover:brightness-105 focus-visible:ring-2 focus-visible:ring-offset-2 active:shadow-[0_1px_4px_rgba(0,0,0,0.18)] disabled:pointer-events-none disabled:opacity-60 sm:py-3"
          >
            {(saving || imageUploading) && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
            )}
            {imageUploading && !saving ? "Esperá la imagen…" : "Guardar"}
          </button>
        </div>
      ) : null}
    </form>
  );
}

export { FORM_FIELDS as CATEGORY_FORM_SERVER_FIELDS };
