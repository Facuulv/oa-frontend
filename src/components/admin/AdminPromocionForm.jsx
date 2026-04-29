"use client";

import { z } from "zod";
import { useMemo, useState } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  productFormSchema,
  defaultProductFormValues,
  mapProductoToForm,
} from "@/components/admin/AdminProductForm";
import { normalizeComponentesFromProducto } from "@/services/adminPromocionesService";
import {
  computePrecioSeparadoFromComponentes,
  computeCombosDisponiblesFromComponentes,
} from "@/utils/admin/promocionesMetrics";
import { formatPrice } from "@/utils/format/price";
import AppSelect from "@/components/ui/AppSelect";

export const promocionFormSchema = productFormSchema
  .omit({ stock: true })
  .extend({
    componentes: z
      .array(
        z.object({
          producto_id: z.coerce.number().int().positive(),
          cantidad: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
          nombre: z.string().optional().nullable(),
          precio: z.number().finite().nullable().optional(),
          stock: z.number().finite().nullable().optional(),
        }),
      )
      .min(1, "Agregá al menos un componente al combo"),
  })
  .superRefine((data, ctx) => {
    const seen = new Map();
    for (let i = 0; i < data.componentes.length; i++) {
      const id = data.componentes[i].producto_id;
      if (seen.has(id)) {
        ctx.addIssue({
          code: "custom",
          message: "No podés duplicar el mismo producto en el combo",
          path: ["componentes", i, "producto_id"],
        });
      }
      seen.set(id, true);
    }
  });

const { stock: _omitStock, ...promoBaseDefaults } = defaultProductFormValues;
void _omitStock;

export const defaultPromocionFormValues = {
  ...promoBaseDefaults,
  componentes: [],
};

/** @param {object} row */
export function mapPromocionToForm(row) {
  const base = mapProductoToForm(row);
  const comps = normalizeComponentesFromProducto(row);
  return {
    categoria_id: base.categoria_id,
    nombre: base.nombre,
    descripcion: base.descripcion,
    precio: base.precio,
    imagen_url: base.imagen_url,
    destacado: base.destacado,
    disponible: base.disponible,
    activo: base.activo,
    orden: base.orden,
    componentes: comps.map((c) => ({
      producto_id: c.producto_id,
      cantidad: c.cantidad,
      nombre: c.nombre || "",
      precio: c.precio ?? undefined,
      stock: c.stock ?? undefined,
    })),
  };
}

export const PROMOCION_FORM_SERVER_FIELDS = [
  "categoria_id",
  "nombre",
  "descripcion",
  "precio",
  "imagen_url",
  "destacado",
  "disponible",
  "activo",
  "orden",
  "componentes",
];

const fieldBase =
  "min-h-12 w-full rounded-xl border px-3 py-3 text-base text-zinc-900 outline-none transition-shadow ring-primary ring-offset-2 ring-offset-white focus:ring-2";
const fieldOk = "border-zinc-200 bg-white";
const fieldErr = "border-red-300 bg-red-50/30 ring-red-200/60";

/**
 * @param {{
 *   form: import("react-hook-form").UseFormReturn<any>,
 *   onSubmit: (e?: import("react").BaseSyntheticEvent) => void,
 *   saving: boolean,
 *   imageUploading: boolean,
 *   onImageUploadingChange: (v: boolean) => void,
 *   formId?: string,
 *   pickerOptions: { id: number, nombre: string, precio?: unknown, stock?: unknown }[],
 *   pickerLoading: boolean,
 *   pickerError: string | null,
 *   pickerQuery: string,
 *   onPickerQueryChange: (q: string) => void,
 * }} props
 */
export default function AdminPromocionForm({
  form,
  onSubmit,
  saving,
  imageUploading,
  onImageUploadingChange,
  formId = "admin-promocion-form",
  pickerOptions,
  pickerLoading,
  pickerError,
  pickerQuery,
  onPickerQueryChange,
}) {
  const busy = saving || imageUploading;
  const rootMsg = form.formState.errors.root?.message;
  const errs = form.formState.errors;

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "componentes",
  });

  const [pickerProductId, setPickerProductId] = useState("");
  const [pickerCantidad, setPickerCantidad] = useState(1);

  const watchedPrecio = useWatch({ control: form.control, name: "precio" });
  const watchedComponentes = useWatch({ control: form.control, name: "componentes" }) ?? [];

  const precioPromoNum = useMemo(() => {
    const n = Number.parseFloat(String(watchedPrecio ?? "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }, [watchedPrecio]);

  const separado = useMemo(() => {
    const rows = (watchedComponentes || []).map((c) => ({
      precio: c.precio,
      cantidad: c.cantidad,
    }));
    return computePrecioSeparadoFromComponentes(rows);
  }, [watchedComponentes]);

  const ahorro =
    precioPromoNum != null && separado != null && separado > precioPromoNum
      ? separado - precioPromoNum
      : null;

  const combosDisp = useMemo(() => {
    const rows = (watchedComponentes || []).map((c) => ({
      stock: c.stock,
      cantidad: c.cantidad,
    }));
    return computeCombosDisponiblesFromComponentes(rows);
  }, [watchedComponentes]);

  const addComponente = () => {
    const id = Number(pickerProductId);
    if (!Number.isFinite(id) || id <= 0) {
      form.setError("root", { type: "manual", message: "Elegí un producto de la lista." });
      return;
    }
    const qty = Math.max(1, Math.floor(Number(pickerCantidad) || 1));
    const opt = pickerOptions.find((p) => Number(p.id) === id);
    const idx = fields.findIndex((f) => Number(f.producto_id) === id);
    if (idx >= 0) {
      const prev = form.getValues(`componentes.${idx}`);
      update(idx, {
        ...prev,
        cantidad: (Number(prev.cantidad) || 0) + qty,
      });
      form.clearErrors("root");
      toast.message("Cantidad actualizada", {
        description: "Ese producto ya estaba en el combo; sumamos las unidades.",
      });
      return;
    }
    append({
      producto_id: id,
      cantidad: qty,
      nombre: opt?.nombre ?? "",
      precio: opt != null && opt.precio != null ? Number(opt.precio) : undefined,
      stock: opt != null && opt.stock != null ? Number(opt.stock) : undefined,
    });
    form.clearErrors("root");
  };

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

        {errs.categoria_id && (
          <p className="text-xs font-medium text-red-600" role="alert">
            {errs.categoria_id.message}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="promo-nombre" className="block text-sm font-semibold text-zinc-800">
            Nombre de la promoción <span className="text-red-600">*</span>
          </label>
          <input
            id="promo-nombre"
            data-modal-initial-focus
            autoComplete="off"
            placeholder="Ej. Fernet Branca + Coca 2,5 L"
            className={`${fieldBase} ${errs.nombre ? fieldErr : fieldOk}`}
            {...form.register("nombre")}
          />
          {errs.nombre && <p className="text-xs font-medium text-red-600">{errs.nombre.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="promo-descripcion" className="block text-sm font-semibold text-zinc-800">
            Descripción
          </label>
          <textarea
            id="promo-descripcion"
            rows={3}
            placeholder="Opcional · se muestra en la ficha"
            className={`w-full resize-none rounded-xl border px-3 py-3 text-base text-zinc-900 outline-none transition-shadow ring-primary ring-offset-2 ring-offset-white focus:ring-2 ${errs.descripcion ? fieldErr : fieldOk} ${errs.descripcion ? "" : "border-zinc-200 bg-white"}`}
            {...form.register("descripcion")}
          />
          {errs.descripcion && (
            <p className="text-xs font-medium text-red-600">{errs.descripcion.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="promo-precio" className="block text-sm font-semibold text-zinc-800">
            Precio final de la promoción <span className="text-red-600">*</span>
          </label>
          <input
            id="promo-precio"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="18000"
            className={`${fieldBase} ${errs.precio ? fieldErr : fieldOk}`}
            {...form.register("precio")}
          />
          {errs.precio && <p className="text-xs font-medium text-red-600">{errs.precio.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="promo-orden" className="block text-sm font-semibold text-zinc-800">
            Orden en catálogo
          </label>
          <input
            id="promo-orden"
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
          {errs.orden && <p className="text-xs font-medium text-red-600">{errs.orden.message}</p>}
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
              Destacado
            </label>
          </div>
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
        {errs.imagen_url && (
          <p className="text-xs font-medium text-red-600">{errs.imagen_url.message}</p>
        )}

        <div className="rounded-xl border border-violet-200/80 bg-violet-50/40 px-3 py-3 sm:px-4 sm:py-4">
          <h3 className="text-sm font-semibold text-zinc-900">Componentes de la promoción</h3>

          <div className="mt-3 space-y-3">
            <label htmlFor="promo-picker-search" className="sr-only">
              Buscar producto
            </label>
            <input
              id="promo-picker-search"
              type="search"
              value={pickerQuery}
              onChange={(e) => onPickerQueryChange(e.target.value)}
              placeholder="Buscar por nombre…"
              className={`${fieldBase} ${fieldOk}`}
              autoComplete="off"
            />
            <div className="space-y-1">
              <label htmlFor="promo-picker-prod" className="block text-sm font-semibold text-zinc-700">
                Producto
              </label>
              <AppSelect
                id="promo-picker-prod"
                value={pickerProductId ? String(pickerProductId) : undefined}
                onValueChange={(v) => setPickerProductId(v)}
                disabled={busy || pickerLoading || pickerOptions.length === 0}
                placeholder={
                  pickerLoading ? "Cargando…" : pickerOptions.length === 0 ? "Sin resultados" : "Seleccioná…"
                }
                options={pickerOptions.map((p) => ({
                  value: String(p.id),
                  label: p.nombre ?? `Producto ${p.id}`,
                }))}
              />
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
              <div className="w-full space-y-1 sm:max-w-[9rem]">
                <label htmlFor="promo-picker-qty" className="block text-sm font-semibold text-zinc-700">
                  Cantidad
                </label>
                <input
                  id="promo-picker-qty"
                  type="number"
                  min={1}
                  value={pickerCantidad}
                  onChange={(e) => setPickerCantidad(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                  className={`${fieldBase} ${fieldOk}`}
                />
              </div>
              <button
                type="button"
                onClick={addComponente}
                disabled={busy || pickerLoading}
                className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50 sm:w-auto"
              >
                <Plus size={18} aria-hidden />
                Agregar componente
              </button>
            </div>
            {pickerError ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {pickerError}
              </p>
            ) : null}
          </div>

          {errs.componentes && typeof errs.componentes.message === "string" ? (
            <p className="mt-2 text-xs font-medium text-red-600">{errs.componentes.message}</p>
          ) : null}

          {fields.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {fields.map((field, index) => {
                const rowErrs = errs.componentes?.[index];
                return (
                  <li
                    key={field.id}
                    className="space-y-2 rounded-xl border border-zinc-200 bg-white p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {form.watch(`componentes.${index}.nombre`) ||
                          `Producto #${form.watch(`componentes.${index}.producto_id`)}`}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {form.watch(`componentes.${index}.precio`) != null &&
                        Number.isFinite(Number(form.watch(`componentes.${index}.precio`)))
                          ? `${formatPrice(Number(form.watch(`componentes.${index}.precio`)))} c/u`
                          : "Precio no disponible"}
                        {form.watch(`componentes.${index}.stock`) != null &&
                        Number.isFinite(Number(form.watch(`componentes.${index}.stock`)))
                          ? ` · stock ${form.watch(`componentes.${index}.stock`)}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label
                        className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
                        htmlFor={`promo-cant-${index}`}
                      >
                        Cantidad
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id={`promo-cant-${index}`}
                          type="number"
                          min={1}
                          className="h-11 w-20 rounded-lg border border-zinc-200 px-2 text-center text-sm font-semibold"
                          {...form.register(`componentes.${index}.cantidad`, {
                            setValueAs: (v) => {
                              const n = Math.floor(Number(v));
                              return Number.isFinite(n) && n > 0 ? n : 1;
                            },
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={busy}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-800 transition hover:bg-red-100 disabled:opacity-50"
                          aria-label="Quitar componente"
                        >
                          <Trash2 size={18} aria-hidden />
                        </button>
                      </div>
                    </div>
                    {rowErrs?.cantidad && (
                      <p className="w-full text-xs text-red-600">{rowErrs.cantidad.message}</p>
                    )}
                    {rowErrs?.producto_id && (
                      <p className="w-full text-xs text-red-600">{rowErrs.producto_id.message}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">Todavía no agregaste componentes.</p>
          )}
        </div>

        <div
          className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-3 py-3 text-sm text-zinc-800 sm:px-4"
          aria-live="polite"
        >
          <p className="font-semibold text-zinc-900">Resumen de precios</p>
          <ul className="mt-2 space-y-1 text-zinc-700">
            <li>
              Total por separado:{" "}
              <span className="font-semibold text-zinc-900">
                {separado != null ? formatPrice(separado) : "—"}
              </span>
            </li>
            <li>
              Precio promo:{" "}
              <span className="font-semibold text-zinc-900">
                {precioPromoNum != null ? formatPrice(precioPromoNum) : "—"}
              </span>
            </li>
            <li>
              Ahorro:{" "}
              <span className="font-semibold text-emerald-800">
                {ahorro != null && ahorro > 0 ? formatPrice(ahorro) : "—"}
              </span>
            </li>
          </ul>
          <p className="mt-3 font-semibold text-zinc-900">Disponibilidad estimada</p>
          <p className="mt-1 text-zinc-700">
            {combosDisp != null ? (
              combosDisp > 0 ? (
                <>
                  Disponible para <span className="font-semibold text-zinc-900">{combosDisp}</span>{" "}
                  {combosDisp === 1 ? "combo" : "combos"}
                </>
              ) : (
                <span className="font-medium text-amber-900">Sin stock suficiente</span>
              )
            ) : (
              <span className="text-zinc-500">Sin datos de stock en los componentes</span>
            )}
          </p>
        </div>
      </div>
    </form>
  );
}
