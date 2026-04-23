"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

export const emptyToNull = (v) => (v === "" || v === undefined ? null : v);

const PRECIO_MAX = 99_999_999.99;

const precioField = z
  .string({ required_error: "Ingresá el precio" })
  .min(1, "Ingresá el precio")
  .transform((s) => Number.parseFloat(String(s).replace(",", ".")))
  .refine((n) => !Number.isNaN(n) && Number.isFinite(n), "El precio no es válido")
  .refine((n) => n >= 0, "El precio no puede ser negativo")
  .refine((n) => n <= PRECIO_MAX, "El precio es demasiado alto");

export const productFormSchema = z.object({
  categoria_id: z.coerce.number().int().positive("Elegí una categoría"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(150),
  descripcion: z
    .union([z.string().max(500), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v == null ? null : v)),
  precio: precioField,
  stock: z.preprocess(
    (v) => {
      if (v === "" || v === null || v === undefined) return 0;
      if (typeof v === "number" && Number.isNaN(v)) return 0;
      return v;
    },
    z.coerce.number().int().min(0, "El stock no puede ser negativo"),
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
  stock: 0,
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
    stock: row.stock ?? 0,
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
 *   onCancel: () => void,
 * }} props
 */
const fieldBase =
  "min-h-12 w-full rounded-xl border px-3 py-3 text-base outline-none ring-primary ring-offset-2 ring-offset-white focus:ring-2";
const fieldOk = "border-zinc-200";
const fieldErr = "border-red-300 ring-red-200/60";

export default function AdminProductForm({
  form,
  categoriasOptions,
  onSubmit,
  saving,
  imageUploading,
  onImageUploadingChange,
  onCancel,
}) {
  const busy = saving || imageUploading;
  const rootMsg = form.formState.errors.root?.message;
  const errs = form.formState.errors;

  return (
    <form onSubmit={onSubmit} className="flex flex-col" noValidate>
      <div className="max-h-[min(70dvh,32rem)] space-y-3 overflow-y-auto px-1 pb-2 sm:space-y-4 sm:px-0.5">
        {rootMsg && (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {rootMsg}
          </p>
        )}

        <div>
          <label htmlFor="prod-categoria" className="mb-1 block text-sm font-medium text-zinc-800">
            Categoría <span className="text-red-600">*</span>
          </label>
          <select
            id="prod-categoria"
            className={`${fieldBase} ${errs.categoria_id ? fieldErr : fieldOk}`}
            {...form.register("categoria_id", {
              setValueAs: (v) => {
                if (v === "" || v == null) return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          >
            <option value="" disabled>
              Seleccioná…
            </option>
            {categoriasOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
                {c.activo === false ? " (inactiva)" : ""}
              </option>
            ))}
          </select>
          {form.formState.errors.categoria_id && (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.categoria_id.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="prod-nombre" className="mb-1 block text-sm font-medium text-zinc-800">
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
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.nombre.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="prod-descripcion" className="mb-1 block text-sm font-medium text-zinc-800">
            Descripción
          </label>
          <textarea
            id="prod-descripcion"
            rows={3}
            placeholder="Opcional. Se muestra en la ficha del producto."
            className={`w-full resize-none rounded-xl border px-3 py-3 text-base outline-none ring-primary ring-offset-2 ring-offset-white focus:ring-2 ${errs.descripcion ? fieldErr : fieldOk}`}
            {...form.register("descripcion")}
          />
          {form.formState.errors.descripcion && (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.descripcion.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="prod-precio" className="mb-1 block text-sm font-medium text-zinc-800">
              Precio <span className="text-red-600">*</span>
            </label>
            <input
              id="prod-precio"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0 o con decimales (ej. 1500 o 1500,50)"
              className={`${fieldBase} ${errs.precio ? fieldErr : fieldOk}`}
              {...form.register("precio")}
            />
            {form.formState.errors.precio && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.precio.message}</p>
            )}
            <p className="mt-1 text-xs text-zinc-500">Usá coma o punto decimal. Podés dejar $0 para promos o cortesías.</p>
          </div>
          <div>
            <label htmlFor="prod-stock" className="mb-1 block text-sm font-medium text-zinc-800">
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
                  if (v === "" || v == null) return 0;
                  const n = Number(v);
                  return Number.isFinite(n) ? Math.trunc(n) : 0;
                },
              })}
            />
            <p className="mt-1 text-xs text-zinc-500" id="prod-stock-hint">
              Unidades disponibles; en 0 podés marcar «No disponible» si no querés venderlo.
            </p>
            {form.formState.errors.stock && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.stock.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="prod-orden" className="mb-1 block text-sm font-medium text-zinc-800">
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
          <p className="mt-1 text-xs text-zinc-500">Menor número = más arriba en listados ordenados por «orden».</p>
          {form.formState.errors.orden && (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.orden.message}</p>
          )}
        </div>

        <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-800">
              <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" {...form.register("activo")} />
              Activo en catálogo
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-800">
              <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" {...form.register("disponible")} />
              Disponible para venta
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-800">
              <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" {...form.register("destacado")} />
              Destacado
            </label>
          </div>
          <p className="text-xs leading-relaxed text-zinc-600">
            <span className="font-semibold text-zinc-700">Activo</span> define si el producto existe en el catálogo
            interno. <span className="font-semibold text-zinc-700">Disponible para venta</span> es lo que más adelante
            usarán pedidos y la carta pública. <span className="font-semibold text-zinc-700">Destacado</span> sirve
            para destacarlo en vitrinas o promos.
          </p>
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
          aria-busy={saving}
          className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:min-h-12 sm:py-3"
        >
          {(saving || imageUploading) && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {imageUploading && !saving ? "Esperá la imagen…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
