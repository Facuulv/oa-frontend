"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Grid3X3,
  Loader2,
  Pencil,
  Plus,
  Power,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import AdminCategoryForm, {
  categoryFormSchema,
  defaultCategoryFormValues,
  mapCategoriaToForm,
  CATEGORY_FORM_SERVER_FIELDS,
} from "@/components/admin/AdminCategoryForm";
import AdminListPagination from "@/components/admin/AdminListPagination";
import FiltersPanel from "@/components/common/FiltersPanel";
import { useScrollListTopOnPagination } from "@/hooks/admin/useScrollIntoViewOnPageChange";
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
/** Listado admin mobile-first: 1 card por fila, 4 por página (sin paginación en API). */
const PAGE_SIZE = 4;

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

function filterCategoriasClient(list, { busqueda, filtroActivo, filtroDescripcion }) {
  const q = busqueda.trim().toLowerCase();
  return list.filter((row) => {
    if (q) {
      const nombre = (row.nombre ?? "").toLowerCase();
      if (!nombre.includes(q)) return false;
    }
    if (filtroActivo === "true" && !row.activo) return false;
    if (filtroActivo === "false" && row.activo) return false;
    const hasDesc = Boolean(String(row.descripcion ?? "").trim());
    if (filtroDescripcion === "with" && !hasDesc) return false;
    if (filtroDescripcion === "without" && hasDesc) return false;
    return true;
  });
}

function sortCategoriasClient(list, ordenar) {
  const copy = [...list];
  const cmpOrden = (a, b) => (a.orden ?? 0) - (b.orden ?? 0);
  switch (ordenar) {
    case "orden_desc":
      copy.sort((a, b) => (b.orden ?? 0) - (a.orden ?? 0));
      break;
    case "nombre_asc":
      copy.sort((a, b) =>
        (a.nombre ?? "").localeCompare(b.nombre ?? "", "es", { sensitivity: "base" }),
      );
      break;
    case "nombre_desc":
      copy.sort((a, b) =>
        (b.nombre ?? "").localeCompare(a.nombre ?? "", "es", { sensitivity: "base" }),
      );
      break;
    case "orden_asc":
    default:
      copy.sort(cmpOrden);
      break;
  }
  return copy;
}

function filtrosCategoriasEnDefecto(busqueda, filtroActivo, filtroDescripcion, ordenar) {
  return (
    !busqueda &&
    filtroActivo === "all" &&
    filtroDescripcion === "all" &&
    ordenar === "orden_asc"
  );
}

export default function AdminCategoriasPage() {
  const [items, setItems] = useState([]);
  const [busquedaInput, setBusquedaInput] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("all");
  const [filtroDescripcion, setFiltroDescripcion] = useState("all");
  const [ordenar, setOrdenar] = useState("orden_asc");
  const [page, setPage] = useState(1);
  const listTopRef = useRef(null);
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

  useEffect(() => {
    const t = setTimeout(() => setBusqueda(busquedaInput.trim()), 380);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  useEffect(() => {
    setPage(1);
  }, [busqueda, filtroActivo, filtroDescripcion, ordenar]);

  const filtrosPredeterminados = useMemo(
    () => filtrosCategoriasEnDefecto(busqueda, filtroActivo, filtroDescripcion, ordenar),
    [busqueda, filtroActivo, filtroDescripcion, ordenar],
  );

  const itemsFiltrados = useMemo(() => {
    const filtered = filterCategoriasClient(items, {
      busqueda,
      filtroActivo,
      filtroDescripcion,
    });
    return sortCategoriasClient(filtered, ordenar);
  }, [items, busqueda, filtroActivo, filtroDescripcion, ordenar]);

  const totalListPages = useMemo(() => {
    if (itemsFiltrados.length === 0) return 1;
    return Math.max(1, Math.ceil(itemsFiltrados.length / PAGE_SIZE));
  }, [itemsFiltrados.length]);

  const itemsPaginados = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return itemsFiltrados.slice(start, start + PAGE_SIZE);
  }, [itemsFiltrados, page]);

  useScrollListTopOnPagination({
    listRef: listTopRef,
    page,
    waitForRefresh: false,
    loadingInitial: loading,
    loadError,
  });

  useEffect(() => {
    if (loading || loadError) return;
    if (itemsFiltrados.length > 0 && page > totalListPages) {
      setPage(totalListPages);
      return;
    }
    if (itemsFiltrados.length === 0 && page !== 1) {
      setPage(1);
    }
  }, [loading, loadError, page, itemsFiltrados.length, totalListPages]);

  const vacioPorFiltros =
    !loading && !loadError && items.length > 0 && itemsFiltrados.length === 0;

  const limpiarFiltros = useCallback(() => {
    setBusquedaInput("");
    setBusqueda("");
    setFiltroActivo("all");
    setFiltroDescripcion("all");
    setOrdenar("orden_asc");
    setPage(1);
  }, []);

  const handleBusquedaInputChange = useCallback((value) => {
    setBusquedaInput(value);
    if (!value.trim()) setBusqueda("");
  }, []);

  const filtersValues = useMemo(
    () => ({
      busqueda: busquedaInput,
      estado: filtroActivo,
      descripcion: filtroDescripcion,
      ordenar,
    }),
    [busquedaInput, filtroActivo, filtroDescripcion, ordenar],
  );

  const filtersConfig = useMemo(
    () => [
      {
        type: "search",
        name: "busqueda",
        label: "Buscar",
        placeholder: "Ej. bebidas, snacks…",
        defaultValue: "",
      },
      {
        type: "select",
        name: "estado",
        label: "Estado",
        defaultValue: "all",
        options: [
          { value: "all", label: "Todas" },
          { value: "true", label: "Activas" },
          { value: "false", label: "Inactivas" },
        ],
      },
      {
        type: "select",
        name: "descripcion",
        label: "Descripción",
        defaultValue: "all",
        options: [
          { value: "all", label: "Todas" },
          { value: "with", label: "Con descripción" },
          { value: "without", label: "Sin descripción" },
        ],
      },
      {
        type: "select",
        name: "ordenar",
        label: "Ordenar",
        defaultValue: "orden_asc",
        options: [
          { value: "orden_asc", label: "Orden ↑" },
          { value: "orden_desc", label: "Orden ↓" },
          { value: "nombre_asc", label: "Nombre A–Z" },
          { value: "nombre_desc", label: "Nombre Z–A" },
        ],
      },
    ],
    [],
  );

  const handleFiltersChange = useCallback(
    (name, value) => {
      switch (name) {
        case "busqueda":
          handleBusquedaInputChange(String(value));
          break;
        case "estado":
          setFiltroActivo(String(value));
          break;
        case "descripcion":
          setFiltroDescripcion(String(value));
          break;
        case "ordenar":
          setOrdenar(String(value));
          break;
        default:
          break;
      }
    },
    [handleBusquedaInputChange],
  );

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
  }, () => {
    toast.error("Revisá los campos marcados.");
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
      <header className="admin-quick-card-enter flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin"
            className="admin-pressable inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 active:bg-zinc-100"
            aria-label="Volver al panel"
            title="Volver al panel"
          >
            <ArrowLeft size={18} strokeWidth={2.25} aria-hidden />
          </Link>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold tracking-tight text-zinc-900">Categorías</h2>
            <p className="mt-0.5 text-xs font-medium text-zinc-500">Gestioná las categorías </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={Boolean(loading || loadError)}
          className="admin-pressable inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-semibold text-white shadow-sm enabled:hover:brightness-105 enabled:active:brightness-95 active:shadow-[0_1px_4px_rgba(0,0,0,0.2)] disabled:pointer-events-none disabled:opacity-45 sm:min-w-[200px]"
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

      {!loading && !loadError ? (
        <FiltersPanel
          filters={filtersConfig}
          values={filtersValues}
          onChange={handleFiltersChange}
          onClear={limpiarFiltros}
          clearDisabled={filtrosPredeterminados}
        />
      ) : null}

      {vacioPorFiltros && (
        <div
          className="admin-quick-card-enter rounded-2xl border border-amber-200/90 bg-amber-50/90 p-5 text-sm text-amber-950 shadow-sm ring-1 ring-amber-200/50"
          role="status"
        >
          <p className="text-base font-semibold text-amber-900">
            No se encontraron resultados con esos filtros.
          </p>
          <p className="mt-1.5 leading-relaxed text-amber-900/85">
            Probá otra búsqueda o cambiá estado, descripción u orden del listado.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-amber-300/90 bg-white px-4 text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-100/50 sm:w-auto"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {!loading && !loadError && items.length > 0 && itemsFiltrados.length > 0 && (
        <>
        <ul ref={listTopRef} className="scroll-mt-4 flex flex-col gap-3">
          {itemsPaginados.map((row, index) => {
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
        <AdminListPagination
          page={page}
          totalPages={totalListPages}
          busy={false}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalListPages, p + 1))}
          ariaLabel="Paginación del listado de categorías"
        />
        </>
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
