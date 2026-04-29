"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Grid3X3,
  Loader2,
  Pencil,
  Plus,
  Power,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import AdminCategoryForm, {
  categoryFormSchema,
  defaultCategoryFormValues,
  mapCategoriaToForm,
  CATEGORY_FORM_SERVER_FIELDS,
} from "@/components/admin/AdminCategoryForm";
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  toggleCategoriaEstado,
  ADMIN_CATEGORIA_CODES,
} from "@/services/adminCategoriasService";
import { ApiError } from "@/utils/api/apiError";
import { buildImageUrl } from "@/lib/imageUtils";
import { PLACEHOLDER_CATEGORY } from "@/constants/images";

/** Misma cascada que `src/app/admin/page.jsx` (accesos rápidos). */
const LIST_STAGGER_MS = 48;

function errorMessage(err, fallback) {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message;
  return fallback;
}

function isNotFoundApi(err) {
  return (
    err instanceof ApiError &&
    (err.status === 404 || err.code === ADMIN_CATEGORIA_CODES.NO_ENCONTRADA)
  );
}

function isConflictApi(err) {
  return (
    err instanceof ApiError &&
    (err.status === 409 || err.code === ADMIN_CATEGORIA_CODES.DUPLICADA)
  );
}

function isUnauthorizedApi(err) {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

function humanLoadError(err) {
  if (err instanceof ApiError) {
    if (isUnauthorizedApi(err)) {
      return "No tenés permiso para ver las categorías. Volvé a iniciar sesión si hace falta.";
    }
    if (err.status === 404) {
      return "No encontramos el recurso. Si el problema sigue, contactá al administrador.";
    }
    if (err.status >= 500) {
      return "El servidor no respondió bien. Reintentá en unos segundos.";
    }
    return err.message || "No se pudieron cargar las categorías.";
  }
  if (err instanceof Error && err.message) {
    return `No se pudieron cargar las categorías. (${err.message})`;
  }
  return "No se pudieron cargar las categorías. Comprobá tu conexión.";
}

function applyServerFieldErrors(form, apiError) {
  if (!(apiError instanceof ApiError) || !apiError.fieldErrors) return;
  for (const [key, message] of Object.entries(apiError.fieldErrors)) {
    if (CATEGORY_FORM_SERVER_FIELDS.includes(key)) {
      form.setError(key, { type: "server", message });
    }
  }
}

function hasMappedCategoryFieldError(apiError) {
  const fe = apiError.fieldErrors ?? {};
  return CATEGORY_FORM_SERVER_FIELDS.some((k) => Boolean(fe[k]));
}

export default function AdminCategoriasPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const form = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaultCategoryFormValues,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await getCategorias();
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setLoadError(humanLoadError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    form.reset(defaultCategoryFormValues);
    form.clearErrors();
    setFormModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    form.reset(mapCategoriaToForm(row));
    form.clearErrors();
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    form.clearErrors();
    setFormModalOpen(false);
    setEditing(null);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors();
    setSaving(true);
    try {
      const base = {
        nombre: values.nombre.trim(),
        descripcion: values.descripcion,
        imagen_url: values.imagen_url,
        orden: values.orden,
      };
      if (editing) {
        await updateCategoria(editing.id, base);
        toast.success("Categoría actualizada");
      } else {
        await createCategoria({ ...base, activo: true });
        toast.success("Categoría creada");
      }
      closeFormModal();
      await load();
    } catch (e) {
      if (e instanceof ApiError) {
        applyServerFieldErrors(form, e);

        if (isNotFoundApi(e)) {
          const msg = editing
            ? "Esta categoría ya no existe. Actualizamos el listado."
            : "No encontramos la categoría.";
          toast.error(msg);
          closeFormModal();
          await load();
          return;
        }

        if (isConflictApi(e)) {
          const dupMsg = "Ya existe categoría con ese nombre";
          toast.error(dupMsg, { description: "Elegí otro nombre para continuar." });
          form.setError("nombre", { type: "server", message: dupMsg });
          return;
        }

        if (isUnauthorizedApi(e)) {
          toast.error("No tenés permiso para guardar", {
            description: e.message || "Volvé a iniciar sesión con una cuenta autorizada.",
          });
          form.setError("root", {
            type: "server",
            message: e.message || "Sin permiso para esta acción.",
          });
          return;
        }

        if (hasMappedCategoryFieldError(e)) {
          toast.error("Revisá los campos marcados", {
            description:
              e.message && e.message.length > 0 && e.message.length < 160 ? e.message : undefined,
          });
        } else {
          toast.error(errorMessage(e, "No se pudo guardar"));
          if (e.message) {
            form.setError("root", { type: "server", message: e.message });
          }
        }
      } else {
        toast.error(errorMessage(e, "No se pudo guardar"));
      }
    } finally {
      setSaving(false);
    }
  });

  const handleToggleEstado = async (row) => {
    const next = !row.activo;
    const snapshot = items;
    setItems((list) =>
      list.map((r) => (r.id === row.id ? { ...r, activo: next } : r)),
    );
    setTogglingId(row.id);
    try {
      await toggleCategoriaEstado(row.id, next);
      toast.success(next ? "Categoría activada" : "Categoría desactivada");
      await load();
    } catch (e) {
      setItems(snapshot);
      if (isNotFoundApi(e)) {
        toast.error("Esa categoría ya no existe", {
          description: "Actualizamos el listado por vos.",
        });
        await load();
      } else if (isUnauthorizedApi(e)) {
        toast.error("No tenés permiso para cambiar el estado", {
          description: e.message,
        });
      } else {
        toast.error(errorMessage(e, "No se pudo cambiar el estado"));
      }
    } finally {
      setTogglingId(null);
    }
  };

  const modalBusy = saving || imageUploading;
  const primarySubmitLabel =
    imageUploading && !saving ? "Esperá la imagen…" : editing ? "Guardar cambios" : "Crear categoría";

  return (
    <div className="flex flex-col gap-6 pb-4">
      <header className="admin-quick-card-enter flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition-transform duration-200 ease-out motion-safe:active:scale-95">
            <Grid3X3 size={22} strokeWidth={2} className="shrink-0" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold tracking-tight text-zinc-900">Categorías</h2>
            <p className="mt-0.5 text-xs font-medium text-zinc-500">Gestioná el catálogo del panel</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={Boolean(loading || loadError)}
          className="admin-pressable inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-semibold text-white shadow-sm enabled:hover:brightness-105 enabled:active:brightness-95 active:shadow-[0_1px_4px_rgba(0,0,0,0.2)] disabled:pointer-events-none disabled:opacity-45 sm:w-auto sm:min-w-[200px]"
        >
          <Plus size={20} strokeWidth={2.25} aria-hidden />
          Nueva categoría
        </button>
      </header>

      {loading && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando categorías">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[7.25rem] animate-pulse rounded-2xl bg-zinc-200/55 ring-1 ring-zinc-200/40 motion-reduce:animate-none"
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
          <p className="text-center text-sm text-zinc-500">Cargando categorías…</p>
        </div>
      )}

      {!loading && loadError && (
        <div
          className="admin-quick-card-enter space-y-3 rounded-2xl border border-red-200/90 bg-red-50/95 p-5 text-sm text-red-950 shadow-sm ring-1 ring-red-200/50"
          role="alert"
        >
          <p className="text-base font-semibold text-red-900">No pudimos cargar el listado</p>
          <p className="leading-relaxed text-red-800/95">{loadError}</p>
          <button
            type="button"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition-[transform,background-color] duration-200 ease-out motion-safe:active:scale-[0.985] active:bg-red-700 sm:w-auto"
            onClick={() => load()}
          >
            <RefreshCw size={18} aria-hidden />
            Reintentar
          </button>
        </div>
      )}

      {!loading && !loadError && items.length === 0 && (
        <div className="admin-quick-card-enter flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-zinc-200/60">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
            <Grid3X3 size={28} strokeWidth={1.75} aria-hidden />
          </div>
          <p className="mt-5 text-base font-semibold text-zinc-900">Todavía no hay categorías</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">
            Creá la primera con el botón de arriba para organizar productos en el catálogo público.
          </p>
        </div>
      )}

      {!loading && !loadError && items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((row, index) => {
            const thumb =
              buildImageUrl(row.imagen_url, { preset: "adminThumb" }) || PLACEHOLDER_CATEGORY;
            const busy = togglingId === row.id;
            return (
              <li
                key={row.id}
                className="admin-quick-card-enter group rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm ring-1 ring-zinc-200/50 transition-[transform,box-shadow,background-color] duration-200 ease-out will-change-transform motion-safe:hover:shadow-md motion-safe:hover:ring-zinc-300/60 motion-safe:active:scale-[0.995]"
                style={{ animationDelay: `${Math.min(index, 8) * LIST_STAGGER_MS}ms` }}
              >
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-xl object-cover ring-1 ring-black/5 transition-opacity duration-200 group-hover:opacity-95"
                    onError={(ev) => {
                      ev.currentTarget.src = PLACEHOLDER_CATEGORY;
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-base font-semibold leading-snug text-zinc-900">{row.nombre}</p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-200 ${
                          row.activo
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {row.activo ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    {row.descripcion ? (
                      <p className="mt-1 line-clamp-3 text-sm text-zinc-600">{row.descripcion}</p>
                    ) : (
                      <p className="mt-1 text-sm italic text-zinc-400">Sin descripción</p>
                    )}
                    <p className="mt-2 text-xs font-medium text-zinc-500">
                      Orden: <span className="text-zinc-800">{row.orden ?? 0}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex min-w-0 flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    disabled={busy}
                    className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-2 text-sm font-semibold text-zinc-800 transition-[transform,background-color] duration-200 ease-out motion-safe:active:scale-[0.985] enabled:active:bg-zinc-50 disabled:opacity-50 sm:gap-2 sm:px-4"
                  >
                    <Pencil size={18} aria-hidden />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleEstado(row)}
                    disabled={busy}
                    aria-busy={togglingId === row.id}
                    className={
                      row.activo
                        ? "inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2 text-sm font-semibold text-red-800 transition-[transform,background-color] duration-200 ease-out motion-safe:active:scale-[0.985] enabled:active:bg-red-100/90 disabled:opacity-50 sm:gap-2 sm:px-4"
                        : "inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2 text-sm font-semibold text-emerald-900 transition-[transform,background-color] duration-200 ease-out motion-safe:active:scale-[0.985] enabled:active:bg-emerald-100/90 disabled:opacity-50 sm:gap-2 sm:px-4"
                    }
                  >
                    {togglingId === row.id ? (
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                    ) : (
                      <Power size={18} className="shrink-0" aria-hidden />
                    )}
                    {row.activo ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        isOpen={formModalOpen}
        onClose={closeFormModal}
        title={editing ? "Editar categoría" : "Nueva categoría"}
        closeDisabled={modalBusy}
        maxWidthClass="w-full max-w-lg sm:max-w-xl"
        closeOnBackdrop={false}
        animatePanelPop
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={closeFormModal}
              disabled={modalBusy}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 outline-none ring-primary transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:min-w-[7.5rem] sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="admin-category-form"
              disabled={modalBusy}
              aria-busy={saving}
              className="admin-pressable inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm outline-none ring-primary hover:brightness-105 focus-visible:ring-2 focus-visible:ring-offset-2 active:shadow-[0_1px_4px_rgba(0,0,0,0.18)] disabled:pointer-events-none disabled:opacity-60 sm:min-w-[11rem] sm:w-auto"
            >
              {modalBusy ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
              ) : null}
              {primarySubmitLabel}
            </button>
          </div>
        }
      >
        <AdminCategoryForm
          formId="admin-category-form"
          showFooter={false}
          form={form}
          onSubmit={onSubmit}
          saving={saving}
          imageUploading={imageUploading}
          onImageUploadingChange={setImageUploading}
        />
      </Modal>
    </div>
  );
}
