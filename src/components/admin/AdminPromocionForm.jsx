"use client";

import { z } from "zod";
import { useCallback, useMemo, useState } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import ImageUploader from "@/components/admin/ImageUploader";
import AdminQuantityStepper from "@/components/admin/AdminQuantityStepper";
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

function formatProductMeta(precio, stock) {
  const parts = [];
  if (precio != null && Number.isFinite(Number(precio))) {
    parts.push(`${formatPrice(Number(precio))} c/u`);
  } else {
    parts.push("Precio no disponible");
  }
  if (stock != null && Number.isFinite(Number(stock))) {
    parts.push(`stock ${Number(stock)}`);
  }
  return parts.join(" · ");
}

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
 *   pickerDebounced: string,
 *   pickerSearchMinLen?: number,
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
  pickerDebounced,
  pickerSearchMinLen = 2,
  onPickerQueryChange,
}) {
  const busy = saving || imageUploading;
  const rootMsg = form.formState.errors.root?.message;
  const errs = form.formState.errors;

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "componentes",
  });

  const [pickerQtyByProductId, setPickerQtyByProductId] = useState({});

  const watchedPrecio = useWatch({ control: form.control, name: "precio" });
  const watchedComponentes = useWatch({ control: form.control, name: "componentes" }) ?? [];

  const addedProductIds = useMemo(() => {
    const set = new Set();
    for (const c of watchedComponentes) {
      if (c?.producto_id != null) set.add(Number(c.producto_id));
    }
    return set;
  }, [watchedComponentes]);

  const pickerHasSearch = pickerDebounced.trim().length >= pickerSearchMinLen;

  const getPickerQty = useCallback(
    (productId) => {
      const stored = pickerQtyByProductId[productId];
      const n = Math.floor(Number(stored));
      return Number.isFinite(n) && n > 0 ? n : 1;
    },
    [pickerQtyByProductId],
  );

  const setPickerQty = useCallback((productId, qty) => {
    const next = Math.max(1, Math.floor(Number(qty) || 1));
    setPickerQtyByProductId((prev) => ({ ...prev, [productId]: next }));
  }, []);

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

  const addComponente = (productId, qtyOverride) => {
    const id = Number(productId);
    if (!Number.isFinite(id) || id <= 0) return;
    const qty = Math.max(1, Math.floor(Number(qtyOverride ?? getPickerQty(id)) || 1));
    const opt = pickerOptions.find((p) => Number(p.id) === id);
    const idx = fields.findIndex((f) => Number(f.producto_id) === id);
    if (idx >= 0) {
      const prev = form.getValues(`componentes.${idx}`);
      update(idx, {
        ...prev,
        cantidad: (Number(prev.cantidad) || 0) + qty,
      });
      form.clearErrors("root");
      form.clearErrors("componentes");
      toast.message("Cantidad actualizada", {
        description: "Ese producto ya estaba en el combo; sumamos las unidades.",
      });
    } else {
      append({
        producto_id: id,
        cantidad: qty,
        nombre: opt?.nombre ?? "",
        precio: opt != null && opt.precio != null ? Number(opt.precio) : undefined,
        stock: opt != null && opt.stock != null ? Number(opt.stock) : undefined,
      });
      form.clearErrors("root");
      form.clearErrors("componentes");
    }
    setPickerQty(id, 1);
  };

  const updateAddedCantidad = (index, nextQty) => {
    const qty = Math.max(1, Math.floor(Number(nextQty) || 1));
    form.setValue(`componentes.${index}.cantidad`, qty, { shouldDirty: true, shouldValidate: true });
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
            Nombre del combo <span className="text-red-600">*</span>
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
            Precio final del combo <span className="text-red-600">*</span>
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
          <h3 className="text-sm font-semibold text-zinc-900">Componentes del combo</h3>

          <div className="mt-3 space-y-3">
            <label htmlFor="promo-picker-search" className="block text-sm font-semibold text-zinc-700">
              Buscar producto
            </label>
            <input
              id="promo-picker-search"
              type="search"
              value={pickerQuery}
              onChange={(e) => onPickerQueryChange(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className={`${fieldBase} ${fieldOk}`}
              autoComplete="off"
            />

            <div className="space-y-2" aria-live="polite">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Resultados</p>

              {!pickerHasSearch ? (
                <p className="rounded-xl border border-dashed border-violet-200/80 bg-white/60 px-3 py-3 text-sm text-zinc-600">
                  Buscá productos para agregarlos al combo.
                </p>
              ) : pickerLoading ? (
                <p className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-3 py-3 text-sm text-zinc-600">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
                  Buscando productos…
                </p>
              ) : pickerError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">
                  {pickerError}
                </p>
              ) : pickerOptions.length === 0 ? (
                <p className="rounded-xl border border-dashed border-zinc-200 bg-white/60 px-3 py-3 text-sm text-zinc-600">
                  No encontramos productos para &lsquo;{pickerDebounced}&rsquo;. Probá con otro nombre o revisá si el
                  producto está activo.
                </p>
              ) : (
                <ul className="space-y-2">
                  {pickerOptions.map((p) => {
                    const pid = Number(p.id);
                    const qty = getPickerQty(pid);
                    const yaAgregado = addedProductIds.has(pid);
                    const precioNum = p.precio != null ? Number(p.precio) : null;
                    return (
                      <li
                        key={pid}
                        className="w-full space-y-2.5 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900">{p.nombre ?? `Producto ${pid}`}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">{formatProductMeta(precioNum, p.stock)}</p>
                          {yaAgregado ? (
                            <p className="mt-1 text-xs font-medium text-violet-700">Ya agregado al combo</p>
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Cantidad
                            </span>
                            <AdminQuantityStepper
                              quantity={qty}
                              disabled={busy}
                              decrementDisabled={qty <= 1}
                              onDecrement={() => setPickerQty(pid, qty - 1)}
                              onIncrement={() => setPickerQty(pid, qty + 1)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => addComponente(pid, qty)}
                            disabled={busy}
                            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50 sm:min-w-[8.5rem] sm:w-auto"
                          >
                            {yaAgregado ? "Sumar" : "Agregar"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {errs.componentes && typeof errs.componentes.message === "string" ? (
            <p className="mt-2 text-xs font-medium text-red-600">{errs.componentes.message}</p>
          ) : null}

          <div className="mt-5 border-t border-violet-200/70 pt-4">
            <h4 className="text-sm font-semibold text-zinc-900">Componentes agregados</h4>

            {fields.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {fields.map((field, index) => {
                  const rowErrs = errs.componentes?.[index];
                  const nombre = form.watch(`componentes.${index}.nombre`);
                  const productoId = form.watch(`componentes.${index}.producto_id`);
                  const precio = form.watch(`componentes.${index}.precio`);
                  const stock = form.watch(`componentes.${index}.stock`);
                  const cantidad = Number(form.watch(`componentes.${index}.cantidad`)) || 1;
                  const precioNum = precio != null && Number.isFinite(Number(precio)) ? Number(precio) : null;
                  const subtotal =
                    precioNum != null && cantidad > 0 ? precioNum * cantidad : null;

                  return (
                    <li
                      key={field.id}
                      className="w-full space-y-2.5 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {nombre || `Producto #${productoId}`}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">{formatProductMeta(precioNum, stock)}</p>
                        {subtotal != null ? (
                          <p className="mt-1.5 text-sm text-zinc-700">
                            Subtotal: <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Cantidad
                          </span>
                          <AdminQuantityStepper
                            quantity={cantidad}
                            disabled={busy}
                            decrementDisabled={cantidad <= 1}
                            onDecrement={() => updateAddedCantidad(index, cantidad - 1)}
                            onIncrement={() => updateAddedCantidad(index, cantidad + 1)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={busy}
                          className="inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-50 sm:min-w-[8.5rem] sm:w-auto"
                        >
                          <Trash2 size={18} aria-hidden />
                          Eliminar
                        </button>
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
              <p className="mt-3 rounded-xl border border-dashed border-zinc-200/90 bg-white/50 px-3 py-3 text-sm text-zinc-500">
                Todavía no agregaste componentes.
              </p>
            )}
          </div>
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
              Precio del combo:{" "}
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
