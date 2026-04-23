"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Star,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import AdminProductForm, {
  productFormSchema,
  defaultProductFormValues,
  mapProductoToForm,
  PRODUCT_FORM_SERVER_FIELDS,
} from "@/components/admin/AdminProductForm";
import { getCategorias } from "@/services/adminCategoriasService";
import {
  createProducto,
  updateProducto,
  toggleProductoEstado,
  ADMIN_PRODUCTO_CODES,
} from "@/services/adminProductosService";
import { useAdminProductosList } from "@/hooks/admin/useAdminProductosList";
import { ApiError } from "@/utils/api/apiError";
import { buildImageUrl } from "@/lib/imageUtils";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";
import { formatPrice } from "@/utils/format/price";

const LIST_STAGGER_MS = 48;
const PAGE_SIZE = 20;

const ORDENAR_OPTIONS = [
  { value: "orden_asc", label: "Orden (asc)" },
  { value: "orden_desc", label: "Orden (desc)" },
  { value: "nombre_asc", label: "Nombre A–Z" },
  { value: "nombre_desc", label: "Nombre Z–A" },
  { value: "precio_asc", label: "Precio menor" },
  { value: "precio_desc", label: "Precio mayor" },
  { value: "fecha_desc", label: "Más recientes" },
  { value: "fecha_asc", label: "Más antiguos" },
];

function errorMessage(err, fallback) {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message;
  return fallback;
}

function isNotFoundApi(err) {
  return (
    err instanceof ApiError &&
    (err.status === 404 || err.code === ADMIN_PRODUCTO_CODES.NO_ENCONTRADO)
  );
}

function isUnauthorizedApi(err) {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

function humanLoadError(err) {
  if (err instanceof ApiError) {
    if (isUnauthorizedApi(err)) {
      return "No tenés permiso para ver los productos. Volvé a iniciar sesión si hace falta.";
    }
    if (err.status === 404) {
      return "No encontramos el recurso. Si el problema sigue, contactá al administrador.";
    }
    if (err.status >= 500) {
      return "El servidor no respondió bien. Reintentá en unos segundos.";
    }
    return err.message || "No se pudieron cargar los productos.";
  }
  if (err instanceof Error && err.message) {
    return `No se pudieron cargar los productos. (${err.message})`;
  }
  return "No se pudieron cargar los productos. Comprobá tu conexión.";
}

function applyServerFieldErrors(form, apiError) {
  if (!(apiError instanceof ApiError) || !apiError.fieldErrors) return;
  for (const [key, message] of Object.entries(apiError.fieldErrors)) {
    if (PRODUCT_FORM_SERVER_FIELDS.includes(key)) {
      form.setError(key, { type: "server", message });
    }
  }
}

function hasMappedProductFieldError(apiError) {
  const fe = apiError.fieldErrors ?? {};
  return PRODUCT_FORM_SERVER_FIELDS.some((k) => Boolean(fe[k]));
}

function formatPrecioLista(precio) {
  const n = Number(precio);
  if (!Number.isFinite(n)) return formatPrice(0);
  if (n === 0) {
    return (
      <>
        {formatPrice(0)}
        <span className="ml-1 text-xs font-normal text-zinc-500">(gratis)</span>
      </>
    );
  }
  return formatPrice(n);
}

/** Categorías elegibles en alta/edición: activas + la actual del producto si está inactiva. */
function categoriasParaFormulario(all, editingRow) {
  const activas = all.filter((c) => c.activo);
  if (!editingRow?.categoria_id) return activas;
  const tiene = activas.some((c) => c.id === editingRow.categoria_id);
  if (tiene) return activas;
  const actual = all.find((c) => c.id === editingRow.categoria_id);
  if (actual) return [...activas, actual];
  return activas;
}

function filtrosEnDefecto(busqueda, filtroCategoria, filtroActivo, filtroDestacado, filtroDisponible, ordenar) {
  return (
    !busqueda &&
    !filtroCategoria &&
    filtroActivo === "all" &&
    filtroDestacado === "all" &&
    filtroDisponible === "all" &&
    ordenar === "orden_asc"
  );
}

export default function AdminProductosPage() {
  const [categorias, setCategorias] = useState([]);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const submitGuardRef = useRef(false);

  const [busquedaInput, setBusquedaInput] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("all");
  const [filtroDestacado, setFiltroDestacado] = useState("all");
  const [filtroDisponible, setFiltroDisponible] = useState("all");
  const [ordenar, setOrdenar] = useState("orden_asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setBusqueda(busquedaInput.trim()), 380);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  useEffect(() => {
    setPage(1);
  }, [busqueda, filtroCategoria, filtroActivo, filtroDestacado, filtroDisponible, ordenar]);

  const {
    items,
    pagination,
    loadError,
    load,
    loadingInitial,
    listRefreshing,
  } = useAdminProductosList({
    page,
    pageSize: PAGE_SIZE,
    busqueda,
    filtroCategoria,
    filtroActivo,
    filtroDestacado,
    filtroDisponible,
    ordenar,
  });

  const loadErrorMessage = loadError ? humanLoadError(loadError) : null;

  const filtrosPredeterminados = useMemo(
    () =>
      filtrosEnDefecto(
        busqueda,
        filtroCategoria,
        filtroActivo,
        filtroDestacado,
        filtroDisponible,
        ordenar,
      ),
    [busqueda, filtroCategoria, filtroActivo, filtroDestacado, filtroDisponible, ordenar],
  );

  const catalogoSinNingunProducto =
    !loadingInitial &&
    !loadError &&
    items.length === 0 &&
    pagination.total === 0 &&
    filtrosPredeterminados;

  const vacioPorFiltros =
    !loadingInitial && !loadError && items.length === 0 && !catalogoSinNingunProducto;

  const restablecerFiltros = () => {
    setBusquedaInput("");
    setBusqueda("");
    setFiltroCategoria("");
    setFiltroActivo("all");
    setFiltroDestacado("all");
    setFiltroDisponible("all");
    setOrdenar("orden_asc");
    setPage(1);
  };

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultProductFormValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const categoriasActivasCount = useMemo(
    () => categorias.filter((c) => c.activo).length,
    [categorias],
  );

  const categoriasOptionsForm = useMemo(
    () => categoriasParaFormulario(categorias, editing),
    [categorias, editing],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getCategorias();
        if (!cancelled) setCategorias(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) {
          toast.error(errorMessage(e, "No se pudieron cargar las categorías"));
          setCategorias([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    const firstActive = categorias.find((c) => c.activo);
    form.reset({
      ...defaultProductFormValues,
      categoria_id: firstActive ? firstActive.id : undefined,
    });
    form.clearErrors();
    setFormModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    form.reset(mapProductoToForm(row));
    form.clearErrors();
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    form.clearErrors();
    setFormModalOpen(false);
    setEditing(null);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (submitGuardRef.current) return;
    submitGuardRef.current = true;
    form.clearErrors();
    setSaving(true);
    const payload = {
      categoria_id: values.categoria_id,
      nombre: values.nombre.trim(),
      descripcion: values.descripcion,
      precio: values.precio,
      stock: values.stock,
      imagen_url: values.imagen_url,
      destacado: values.destacado,
      disponible: values.disponible,
      activo: values.activo,
      orden: values.orden,
    };
    try {
      if (editing) {
        await updateProducto(editing.id, payload);
        toast.success("Producto actualizado");
      } else {
        await createProducto(payload);
        toast.success("Producto creado");
      }
      closeFormModal();
      await load();
    } catch (e) {
      if (e instanceof ApiError) {
        applyServerFieldErrors(form, e);

        if (isNotFoundApi(e)) {
          toast.error("Este producto ya no existe", { description: "Actualizamos el listado." });
          closeFormModal();
          await load();
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

        if (e.code === ADMIN_PRODUCTO_CODES.SIN_CAMPOS_ACTUALIZACION) {
          toast.error(e.message || "No hay cambios para guardar", {
            description: "Modificá al menos un campo o tocá Cancelar.",
          });
          return;
        }

        if (
          e.code === ADMIN_PRODUCTO_CODES.CATEGORIA_INACTIVA ||
          e.code === ADMIN_PRODUCTO_CODES.CATEGORIA_NO_ENCONTRADA
        ) {
          toast.error(e.message || "Revisá la categoría", {
            description: "Elegí una categoría activa del listado.",
          });
          form.setError("categoria_id", {
            type: "server",
            message: e.message || "Categoría no válida",
          });
          return;
        }

        if (hasMappedProductFieldError(e)) {
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
      submitGuardRef.current = false;
    }
  });

  const handleToggleEstado = async (row) => {
    const next = !row.activo;
    setTogglingId(row.id);
    try {
      await toggleProductoEstado(row.id, next);
      toast.success(next ? "Producto activado" : "Producto desactivado");
      await load();
    } catch (e) {
      if (isNotFoundApi(e)) {
        toast.error("Ese producto ya no existe", {
          description: "Actualizamos el listado por vos.",
        });
      } else if (isUnauthorizedApi(e)) {
        toast.error("No tenés permiso para cambiar el estado", {
          description: e.message,
        });
      } else {
        toast.error(errorMessage(e, "No se pudo cambiar el estado"));
      }
      await load();
    } finally {
      setTogglingId(null);
    }
  };

  const limit = pagination.limit || PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(pagination.total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const rangoListado =
    items.length > 0 && pagination.total > 0
      ? `${(page - 1) * limit + 1}–${Math.min(page * limit, pagination.total)}`
      : null;

  return (
    <div className="flex flex-col gap-6 pb-4">
      <header className="admin-quick-card-enter flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition-transform duration-200 ease-out motion-safe:active:scale-95">
            <Package size={22} strokeWidth={2} className="shrink-0" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold tracking-tight text-zinc-900">Productos</h2>
            <p className="mt-0.5 text-xs font-medium text-zinc-500">
              Catálogo, precios, stock y visibilidad en tienda
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={categoriasActivasCount === 0}
          className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-semibold text-white shadow-sm transition-[transform,background-color,box-shadow] duration-200 ease-out will-change-transform enabled:hover:brightness-105 enabled:active:brightness-95 enabled:active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45 sm:w-auto sm:min-w-[200px]"
        >
          <Plus size={20} strokeWidth={2.25} aria-hidden />
          Nuevo producto
        </button>
      </header>

      {categorias.length > 0 && categoriasActivasCount === 0 && !loadError && (
        <div
          className="admin-quick-card-enter rounded-2xl border border-amber-200/90 bg-amber-50/95 p-4 text-sm text-amber-950 shadow-sm ring-1 ring-amber-200/50"
          role="status"
        >
          <p className="font-semibold text-amber-900">Necesitás al menos una categoría activa</p>
          <p className="mt-1 leading-relaxed text-amber-900/90">
            Creá o activá una categoría en «Categorías» para poder publicar productos. El backend solo
            acepta categorías activas al guardar.
          </p>
        </div>
      )}

      <div className="admin-quick-card-enter flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm ring-1 ring-zinc-200/50 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
        <div className="min-w-0 flex-1 sm:min-w-[12rem]">
          <label htmlFor="prod-busqueda" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Buscar por nombre
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              id="prod-busqueda"
              type="search"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              placeholder="Ej. gin, cola…"
              className="min-h-11 w-full rounded-xl border border-zinc-200 py-2.5 pl-9 pr-3 text-base outline-none ring-primary ring-offset-2 ring-offset-white focus:ring-2"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="w-full min-w-0 sm:w-44">
          <label htmlFor="prod-f-cat" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Categoría
          </label>
          <select
            id="prod-f-cat"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none ring-primary focus:ring-2"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nombre}
                {!c.activo ? " (inactiva)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-0 sm:flex-row sm:flex-wrap sm:gap-3">
          <div className="min-w-0 flex-1 sm:min-w-[9.5rem]">
            <label htmlFor="prod-f-act" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Catálogo
            </label>
            <select
              id="prod-f-act"
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-zinc-200 px-2 py-2.5 text-sm font-medium text-zinc-800 outline-none ring-primary focus:ring-2"
            >
              <option value="all">Activos e inactivos</option>
              <option value="true">Solo activos</option>
              <option value="false">Solo inactivos</option>
            </select>
          </div>
          <div className="min-w-0 flex-1 sm:min-w-[9.5rem]">
            <label htmlFor="prod-f-dest" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Destacado
            </label>
            <select
              id="prod-f-dest"
              value={filtroDestacado}
              onChange={(e) => setFiltroDestacado(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-zinc-200 px-2 py-2.5 text-sm font-medium text-zinc-800 outline-none ring-primary focus:ring-2"
            >
              <option value="all">Todos</option>
              <option value="true">Solo destacados</option>
              <option value="false">Sin destacar</option>
            </select>
          </div>
          <div className="min-w-0 flex-1 sm:min-w-[9.5rem]">
            <label htmlFor="prod-f-disp" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Venta
            </label>
            <select
              id="prod-f-disp"
              value={filtroDisponible}
              onChange={(e) => setFiltroDisponible(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-zinc-200 px-2 py-2.5 text-sm font-medium text-zinc-800 outline-none ring-primary focus:ring-2"
            >
              <option value="all">Todos</option>
              <option value="true">Disponibles para venta</option>
              <option value="false">No disponibles</option>
            </select>
          </div>
        </div>
        <div className="w-full min-w-0 sm:w-52">
          <label htmlFor="prod-ordenar" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Ordenar por
          </label>
          <select
            id="prod-ordenar"
            value={ordenar}
            onChange={(e) => setOrdenar(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none ring-primary focus:ring-2"
          >
            {ORDENAR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingInitial && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando productos">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[8.5rem] animate-pulse rounded-2xl bg-zinc-200/55 ring-1 ring-zinc-200/40 motion-reduce:animate-none"
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
          <p className="text-center text-sm text-zinc-500">Cargando productos…</p>
        </div>
      )}

      {!loadingInitial && loadError && (
        <div
          className="admin-quick-card-enter space-y-3 rounded-2xl border border-red-200/90 bg-red-50/95 p-5 text-sm text-red-950 shadow-sm ring-1 ring-red-200/50"
          role="alert"
        >
          <p className="text-base font-semibold text-red-900">No pudimos cargar el listado</p>
          <p className="leading-relaxed text-red-800/95">{loadErrorMessage}</p>
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

      {!loadingInitial && !loadError && listRefreshing && (
        <p
          className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-500"
          aria-live="polite"
        >
          <Loader2 className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
          Actualizando listado…
        </p>
      )}

      {!loadingInitial && !loadError && (
        <>
          {catalogoSinNingunProducto && (
            <div className="admin-quick-card-enter flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-zinc-200/60">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-400 ring-1 ring-violet-100">
                <Package size={28} strokeWidth={1.75} aria-hidden />
              </div>
              <p className="mt-5 text-base font-semibold text-zinc-900">Todavía no hay productos cargados</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                Cuando agregues el primero, vas a verlo acá con imagen, precio, stock y estado. Usá el botón
                «Nuevo producto» arriba a la derecha para empezar.
              </p>
            </div>
          )}

          {vacioPorFiltros && (
            <div className="admin-quick-card-enter flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-zinc-200/60">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                <Search size={26} strokeWidth={1.75} aria-hidden />
              </div>
              <p className="mt-5 text-base font-semibold text-zinc-900">No hay productos con estos filtros</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                Probá otra búsqueda o ajustá categoría, catálogo, destacado o venta. También podés restablecer
                todo y volver al listado completo.
              </p>
              <button
                type="button"
                onClick={restablecerFiltros}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
              >
                Restablecer filtros
              </button>
            </div>
          )}

          {items.length > 0 && (
            <ul
              className={`flex flex-col gap-3 transition-opacity duration-200 ${listRefreshing ? "pointer-events-none opacity-55" : ""}`}
              aria-busy={listRefreshing}
            >
            {items.map((row, index) => {
              const thumb =
                buildImageUrl(row.imagen_url, { preset: "adminThumb" }) || PLACEHOLDER_PRODUCT_CARD;
              const busy = togglingId === row.id;
              const catMissing = Boolean(row.categoria_id) && !row.categoria;
              const catNombre = catMissing
                ? "Categoría no encontrada"
                : (row.categoria?.nombre ?? "—");
              const stockLabel = String(row.stock ?? 0);
              const sinStock =
                Number(row.stock) === 0 && row.disponible !== false && row.disponible !== 0;
              return (
                <li
                  key={row.id}
                  className={`admin-quick-card-enter group rounded-2xl border p-4 shadow-sm ring-1 transition-[transform,box-shadow,background-color] duration-200 ease-out will-change-transform motion-safe:hover:shadow-md motion-safe:active:scale-[0.995] ${
                    row.activo
                      ? "border-zinc-200/90 bg-white ring-zinc-200/50 motion-safe:hover:ring-zinc-300/60"
                      : "border-zinc-300/80 bg-zinc-50/90 ring-zinc-300/40 motion-safe:hover:ring-zinc-400/50"
                  }`}
                  style={{ animationDelay: `${Math.min(index, 8) * LIST_STAGGER_MS}ms` }}
                >
                  <div className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt=""
                      className={`h-24 w-24 shrink-0 rounded-xl object-cover ring-1 ring-black/5 transition-opacity duration-200 group-hover:opacity-95 ${!row.activo ? "opacity-75" : ""}`}
                      onError={(ev) => {
                        ev.currentTarget.src = PLACEHOLDER_PRODUCT_CARD;
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p
                          className={`text-base font-semibold leading-snug ${row.activo ? "text-zinc-900" : "text-zinc-600"}`}
                        >
                          {row.nombre}
                          {!row.activo ? (
                            <span className="ml-2 align-middle text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              (inactivo)
                            </span>
                          ) : null}
                        </p>
                        <div className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-1.5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              row.activo
                                ? "bg-emerald-100 text-emerald-800"
                                : "border border-zinc-300/80 bg-zinc-200/90 text-zinc-800"
                            }`}
                          >
                            {row.activo ? "Activo" : "Inactivo"}
                          </span>
                          {row.destacado ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-300/60 bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-950">
                              <Star size={12} className="shrink-0 text-amber-900" fill="currentColor" aria-hidden />
                              Destacado
                            </span>
                          ) : null}
                          {row.disponible === false || row.disponible === 0 ? (
                            <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-900">
                              No disponible
                            </span>
                          ) : null}
                          {sinStock ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-900 ring-1 ring-rose-200/80">
                              <AlertTriangle size={12} className="shrink-0" aria-hidden />
                              Sin stock
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600">
                        <span className={catMissing ? "font-medium text-amber-800" : "font-medium text-zinc-700"}>
                          {catNombre}
                        </span>
                        <span className="mx-1.5 text-zinc-300" aria-hidden>
                          ·
                        </span>
                        <span className="font-semibold text-zinc-900">{formatPrecioLista(row.precio)}</span>
                        <span className="mx-1.5 text-zinc-300" aria-hidden>
                          ·
                        </span>
                        Stock:{" "}
                        <span
                          className={`font-medium ${Number(row.stock) === 0 ? "text-rose-800" : "text-zinc-800"}`}
                        >
                          {stockLabel}
                        </span>
                      </p>
                      {row.descripcion ? (
                        <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{row.descripcion}</p>
                      ) : (
                        <p className="mt-2 text-sm italic text-zinc-400">Sin descripción</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex min-w-0 flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      disabled={busy}
                      aria-label={`Editar ${row.nombre}`}
                      className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-2 text-sm font-semibold text-zinc-800 transition-[transform,background-color] duration-200 ease-out motion-safe:active:scale-[0.985] enabled:active:bg-zinc-50 disabled:opacity-50 sm:gap-2 sm:px-4"
                    >
                      <Pencil size={18} aria-hidden />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleEstado(row)}
                      disabled={busy}
                      aria-busy={busy}
                      aria-label={row.activo ? `Desactivar ${row.nombre}` : `Activar ${row.nombre}`}
                      className={
                        row.activo
                          ? "inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2 text-sm font-semibold text-red-800 transition-[transform,background-color] duration-200 ease-out motion-safe:active:scale-[0.985] enabled:active:bg-red-100/90 disabled:opacity-50 sm:gap-2 sm:px-4"
                          : "inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2 text-sm font-semibold text-emerald-900 transition-[transform,background-color] duration-200 ease-out motion-safe:active:scale-[0.985] enabled:active:bg-emerald-100/90 disabled:opacity-50 sm:gap-2 sm:px-4"
                      }
                    >
                      {busy ? (
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

          <div
            className={`flex flex-col items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm ring-1 ring-zinc-200/50 sm:flex-row ${listRefreshing ? "opacity-60" : ""}`}
          >
            <p className="text-center sm:text-left">
              Página <span className="font-semibold text-zinc-900">{page}</span> de{" "}
              <span className="font-semibold text-zinc-900">{totalPages}</span>
              <span className="text-zinc-500">
                {" "}
                · {pagination.total} {pagination.total === 1 ? "producto" : "productos"}
                {rangoListado ? (
                  <span className="text-zinc-400"> (mostrando {rangoListado})</span>
                ) : null}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!canPrev || listRefreshing}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft size={18} aria-hidden />
                Anterior
              </button>
              <button
                type="button"
                disabled={!canNext || listRefreshing}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 disabled:pointer-events-none disabled:opacity-40"
              >
                Siguiente
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={formModalOpen}
        onClose={closeFormModal}
        title={editing ? "Editar producto" : "Nuevo producto"}
        closeDisabled={saving || imageUploading}
      >
        <AdminProductForm
          form={form}
          categoriasOptions={categoriasOptionsForm}
          onSubmit={onSubmit}
          saving={saving}
          imageUploading={imageUploading}
          onImageUploadingChange={setImageUploading}
          onCancel={closeFormModal}
        />
      </Modal>
    </div>
  );
}
