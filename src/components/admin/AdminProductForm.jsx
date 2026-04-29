"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import AppSelect from "@/components/ui/AppSelect";
import {
  normalizeDecimal,
  validateDescription,
  validatePrice,
  validateProductLikeName,
  validateStock,
} from "@/lib/validations";

export const emptyToNull = (v) => (v === "" || v === undefined ? null : v);

const PRECIO_MAX = 99_999_999.99;

const precioField = z
  .string({ required_error: "Ingresá el precio" })
  .min(1, "Ingresá el precio")
  .superRefine((s, ctx) => {
    const r = validatePrice(s);
    if (!r.valid) ctx.addIssue(r.message);
  })
  .transform((s) => Number.parseFloat(normalizeDecimal(s)))
  .refine((n) => n >= 0, "El precio no puede ser negativo")
  .refine((n) => n <= PRECIO_MAX, "El precio es demasiado alto");

export const productFormSchema = z.object({
  categoria_id: z.coerce.number().int().positive("Elegí una categoría"),
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(150)
    .superRefine((value, ctx) => {
      const r = validateProductLikeName(value);
      if (!r.valid) ctx.addIssue(r.message);
    }),
  descripcion: z
    .union([z.string().max(500), z.literal("")])
    .optional()
    .superRefine((value, ctx) => {
      const r = validateDescription(value ?? "");
      if (!r.valid) ctx.addIssue(r.message);
    })
    .transform((v) => (v === "" || v == null ? null : v)),
  precio: precioField,
  stock: z.preprocess(
    (v) => {
      if (v === "" || v === null || v === undefined) return 0;
      if (typeof v === "number" && Number.isNaN(v)) return 0;
      if (typeof v === "string") return normalizeDecimal(v);
      return v;
    },
    z
      .union([z.string(), z.number()])
      .superRefine((value, ctx) => {
        const r = validateStock(String(value ?? ""), { allowDecimal: false });
        if (!r.valid) ctx.addIssue(r.message);
      })
      .transform((value) => Number.parseInt(String(value), 10))
      .refine((n) => Number.isFinite(n) && n >= 0, "El stock no puede ser negativo"),
  ),
  imagen_url: z.preprocess(
    emptyToNull,
    z.union([z.null(), z.string().max(500).url("URL de imagen inválida")]),
  ),
  destacado: z.boolean(),
  disponible: z.boolean(),
  activo: z.boolean(),
  orden: z.preprocess(
    (v) => {
      if (v === "" || v === null || v === undefined) return 0;
      if (typeof v === "number" && Number.isNaN(v)) return 0;
      return v;
    },
    z.coerce.number().int().min(0),
  ),
});

export const defaultProductFormValues = {
  categoria_id: undefined,
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  imagen_url: "",
  destacado: false,
  disponible: true,
  activo: true,
  orden: 0,
};

/** @param {object} row respuesta admin `/admin/productos` */
export function mapProductoToForm(row) {
  const precio = row.precio;
  return {
    categoria_id: row.categoria_id,
    nombre: row.nombre ?? "",
    descripcion: row.descripcion ?? "",
    precio: precio != null && precio !== "" ? String(precio) : "",
    stock: row.stock != null ? String(row.stock) : "",
    imagen_url: row.imagen_url ?? "",
    destacado: Boolean(row.destacado),
    disponible: row.disponible !== false && row.disponible !== 0,
    activo: row.activo !== false && row.activo !== 0,
    orden: row.orden ?? 0,
  };
}

export const PRODUCT_FORM_SERVER_FIELDS = [
  "categoria_id",
  "nombre",
  "descripcion",
  "precio",
  "stock",
  "imagen_url",
  "destacado",
  "disponible",
  "activo",
  "orden",
];

/**
 * @param {{
 *   form: import("react-hook-form").UseFormReturn<any>,
 *   categoriasOptions: { id: number, nombre: string, activo?: boolean }[],
 *   onSubmit: (e?: import("react").BaseSyntheticEvent) => void,
 *   saving: boolean,
 *   imageUploading: boolean,
 *   onImageUploadingChange: (v: boolean) => void,
 *   onCancel?: () => void,
 *   formId?: string,
 *   showFooter?: boolean,
 * }} props
 */
const fieldBase =
  "min-h-12 w-full rounded-xl border px-3 py-3 text-base text-zinc-900 outline-none transition-shadow ring-primary ring-offset-2 ring-offset-white focus:ring-2";
const fieldOk = "border-zinc-200 bg-white";
const fieldErr = "border-red-300 bg-red-50/30 ring-red-200/60";

export default function AdminProductForm({
  form,
  categoriasOptions,
  onSubmit,
  saving,
  imageUploading,
  onImageUploadingChange,
  onCancel,
  formId = "admin-product-form",
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
          <label htmlFor="prod-categoria" className="block text-sm font-semibold text-zinc-800">
            Categoría <span className="text-red-600">*</span>
          </label>
          <Controller
            name="categoria_id"
            control={form.control}
            render={({ field }) => (
              <AppSelect
                id="prod-categoria"
                modalInitialFocus
                value={field.value != null ? String(field.value) : undefined}
                onValueChange={(v) => {
                  const n = Number(v);
                  field.onChange(Number.isFinite(n) ? n : undefined);
                }}
                onBlur={field.onBlur}
                disabled={busy}
                error={Boolean(errs.categoria_id)}
                placeholder="Seleccioná…"
                options={categoriasOptions.map((c) => ({
                  value: String(c.id),
                  label: `${c.nombre}${c.activo === false ? " (inactiva)" : ""}`,
                }))}
              />
            )}
          />
          {form.formState.errors.categoria_id && (
            <p className="text-xs font-medium text-red-600">{form.formState.errors.categoria_id.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="prod-nombre" className="block text-sm font-semibold text-zinc-800">
            Nombre <span className="text-red-600">*</span>
          </label>
          <input
            id="prod-nombre"
            autoComplete="off"
            placeholder="Ej. Gin tonic clásico"
            className={`${fieldBase} ${errs.nombre ? fieldErr : fieldOk}`}
            {...form.register("nombre")}
          />
          {form.formState.errors.nombre && (
            <p className="text-xs font-medium text-red-600">{form.formState.errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="prod-descripcion" className="block text-sm font-semibold text-zinc-800">
            Descripción
          </label>
          <textarea
            id="prod-descripcion"
            rows={3}
            placeholder="Opcional · se muestra en la ficha"
            className={`w-full resize-none rounded-xl border px-3 py-3 text-base text-zinc-900 outline-none transition-shadow ring-primary ring-offset-2 ring-offset-white focus:ring-2 ${errs.descripcion ? fieldErr : fieldOk} ${errs.descripcion ? "" : "border-zinc-200 bg-white"}`}
            {...form.register("descripcion")}
          />
          {form.formState.errors.descripcion && (
            <p className="text-xs font-medium text-red-600">{form.formState.errors.descripcion.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-4">
          <div className="space-y-1.5">
            <label htmlFor="prod-precio" className="block text-sm font-semibold text-zinc-800">
              Precio <span className="text-red-600">*</span>
            </label>
            <input
              id="prod-precio"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="1500 o 1500,50"
              className={`${fieldBase} ${errs.precio ? fieldErr : fieldOk}`}
              {...form.register("precio")}
            />
            {form.formState.errors.precio && (
              <p className="text-xs font-medium text-red-600">{form.formState.errors.precio.message}</p>
            )}
            <p className="text-[11px] leading-snug text-zinc-500">Coma o punto decimal. $0 = gratis o promo.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="prod-stock" className="block text-sm font-semibold text-zinc-800">
              Stock
            </label>
            <input
              id="prod-stock"
              type="number"
              inputMode="numeric"
              min={0}
              aria-describedby="prod-stock-hint"
              className={`${fieldBase} ${errs.stock ? fieldErr : fieldOk}`}
              {...form.register("stock", {
                setValueAs: (v) => {
                  if (v === "" || v == null) return "";
                  return String(v);
                },
              })}
            />
            <p className="text-[11px] leading-snug text-zinc-500" id="prod-stock-hint">
              Unidades. Con stock 0 podés marcar «No disponible» abajo.
            </p>
            {form.formState.errors.stock && (
              <p className="text-xs font-medium text-red-600">{form.formState.errors.stock.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="prod-orden" className="block text-sm font-semibold text-zinc-800">
            Orden en catálogo
          </label>
          <input
            id="prod-orden"
            type="number"
            inputMode="numeric"
            min={0}
            className={`${fieldBase} ${errs.orden ? fieldErr : fieldOk}`}
            {...form.register("orden", {
              setValueAs: (v) => {
                if (v === "" || v == null) return 0;
                const n = Number(v);
                return Number.isFinite(n) ? Math.trunc(n) : 0;
              },
            })}
          />
          <p className="text-[11px] leading-snug text-zinc-500">Menor número = más arriba cuando el listado ordena por «orden».</p>
          {form.formState.errors.orden && (
            <p className="text-xs font-medium text-red-600">{form.formState.errors.orden.message}</p>
          )}
        </div>

        <fieldset className="space-y-2 rounded-xl border border-zinc-200/90 bg-zinc-50/90 px-3 py-3 sm:px-4 sm:py-3.5">
          <legend className="sr-only">Visibilidad y venta</legend>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-white/70 focus-within:rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-zinc-50">
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 accent-primary"
                {...form.register("activo")}
              />
              Activo en catálogo
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-white/70 focus-within:rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-zinc-50">
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 accent-primary"
                {...form.register("disponible")}
              />
              Disponible para venta
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-800 sm:col-span-2 focus-within:rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-zinc-50">
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 accent-primary"
                {...form.register("destacado")}
              />
              Destacado (vitrinas / promos)
            </label>
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-600">
            <span className="font-semibold text-zinc-700">Activo</span>: figura en el catálogo admin.{" "}
            <span className="font-semibold text-zinc-700">Disponible</span>: apto para venta en carta y pedidos.
          </p>
        </fieldset>

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
        {form.formState.errors.imagen_url && (
          <p className="text-xs font-medium text-red-600">{form.formState.errors.imagen_url.message}</p>
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
            {(saving || imageUploading) && <Loader2 className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />}
            {imageUploading && !saving ? "Esperá la imagen…" : "Guardar"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
