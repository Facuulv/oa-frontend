"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
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
import { toast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import AdminProductForm, {
  productFormSchema,
  defaultProductFormValues,
  mapProductoToForm,
  PRODUCT_FORM_SERVER_FIELDS,
} from "@/components/admin/AdminProductForm";
import AdminProductosListSortBar from "@/components/admin/AdminProductosListSortBar";
import AdminListPagination from "@/components/admin/AdminListPagination";
import FiltersPanel from "@/components/common/FiltersPanel";
import { getCategorias } from "@/services/adminCategoriasService";
import {
  createProducto,
  updateProducto,
  toggleProductoEstado,
  ADMIN_PRODUCTO_CODES,
} from "@/services/adminProductosService";
import { useAdminProductosList } from "@/hooks/admin/useAdminProductosList";
import { useScrollListTopOnPagination } from "@/hooks/admin/useScrollIntoViewOnPageChange";
import { TIPO_PRODUCTO } from "@/constants/tipoProducto";
import { ApiError } from "@/utils/api/apiError";
import { buildImageUrl } from "@/lib/imageUtils";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";
import { formatPrice } from "@/utils/format/price";

const LIST_STAGGER_MS = 48;
/** Listado admin mobile-first: 1 card por fila, 4 por página. */
const PAGE_SIZE = 4;

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
const FILTER_ALL = "__all__";

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
  const listTopRef = useRef(null);

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
    tipoProducto: TIPO_PRODUCTO.PRODUCTO,
  });

  useScrollListTopOnPagination({
    listRef: listTopRef,
    page,
    waitForRefresh: true,
    listRefreshing,
    loadingInitial,
    loadError,
  });

  const limit = Math.max(1, pagination.limit || PAGE_SIZE);
  const totalPages =
    pagination.total > 0 ? Math.max(1, Math.ceil(pagination.total / limit)) : 1;

  useEffect(() => {
    if (loadingInitial || loadError) return;
    if (pagination.total > 0 && page > totalPages) {
      setPage(totalPages);
      return;
    }
    if (pagination.total === 0 && page !== 1) {
      setPage(1);
    }
  }, [loadingInitial, loadError, page, pagination.total, totalPages]);

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

  const limpiarFiltros = () => {
    setBusquedaInput("");
    setBusqueda("");
    setFiltroCategoria("");
    setFiltroActivo("all");
    setFiltroDestacado("all");
    setFiltroDisponible("all");
    setOrdenar("orden_asc");
    setPage(1);
  };

  /** Vacío inmediato: evita esperar el debounce de `busqueda` (chips / borrado total). */
  const handleBusquedaInputChange = useCallback((value) => {
    setBusquedaInput(value);
    if (!value.trim()) setBusqueda("");
  }, []);

  const filtersValues = useMemo(
    () => ({
      busqueda: busquedaInput,
      categoria: filtroCategoria ? String(filtroCategoria) : FILTER_ALL,
      estado: filtroActivo,
      destacado: filtroDestacado,
      venta: filtroDisponible,
    }),
    [busquedaInput, filtroCategoria, filtroActivo, filtroDestacado, filtroDisponible],
  );

  const filtersConfig = useMemo(
    () => [
      {
        type: "search",
        name: "busqueda",
        label: "Buscar",
        placeholder: "Ej. gin, cola…",
        defaultValue: "",
      },
      {
        type: "select",
        name: "categoria",
        label: "Categoría",
        defaultValue: FILTER_ALL,
        options: [
          { value: FILTER_ALL, label: "Todas" },
          ...categorias.map((c) => ({
            value: String(c.id),
            label: `${c.nombre}${!c.activo ? " (inactiva)" : ""}`,
          })),
        ],
      },
      {
        type: "select",
        name: "estado",
        label: "Catálogo / estado",
        defaultValue: "all",
        options: [
          { value: "all", label: "Todos" },
          { value: "true", label: "Activos" },
          { value: "false", label: "Inactivos" },
        ],
      },
      {
        type: "select",
        name: "destacado",
        label: "Destacado",
        defaultValue: "all",
        advanced: true,
        options: [
          { value: "all", label: "Todos" },
          { value: "true", label: "Solo destacados" },
          { value: "false", label: "Sin destacar" },
        ],
      },
      {
        type: "select",
        name: "venta",
        label: "Venta",
        defaultValue: "all",
        advanced: true,
        options: [
          { value: "all", label: "Todos" },
          { value: "true", label: "Disponibles para venta" },
          { value: "false", label: "No disponibles" },
        ],
      },
    ],
    [categorias],
  );

  const handleFiltersChange = useCallback(
    (name, value) => {
      switch (name) {
        case "busqueda":
          handleBusquedaInputChange(String(value));
          break;
        case "categoria":
          setFiltroCategoria(value === FILTER_ALL ? "" : String(value));
          break;
        case "estado":
          setFiltroActivo(String(value));
          break;
        case "destacado":
          setFiltroDestacado(String(value));
          break;
        case "venta":
          setFiltroDisponible(String(value));
          break;
        default:
          break;
      }
    },
    [handleBusquedaInputChange],
  );

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
  }, () => {
    toast.error("Revisá los campos marcados.");
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

  const modalBusy = saving || imageUploading;
  const primarySubmitLabel =
    imageUploading && !saving ? "Esperá la imagen…" : editing ? "Guardar cambios" : "Crear producto";

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
            <h2 className="truncate text-lg font-bold tracking-tight text-zinc-900">Productos</h2>
            <p className="mt-0.5 text-xs font-medium text-zinc-500">
              Precios, stock y visibilidad en tienda
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={categoriasActivasCount === 0}
          className="admin-pressable inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-semibold text-white shadow-sm enabled:hover:brightness-105 enabled:active:brightness-95 active:shadow-[0_1px_4px_rgba(0,0,0,0.2)] disabled:pointer-events-none disabled:opacity-45 sm:min-w-[200px]"
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

      <div className="flex flex-col gap-3">
        <FiltersPanel
          filters={filtersConfig}
          values={filtersValues}
          onChange={handleFiltersChange}
          onClear={limpiarFiltros}
          disabled={listRefreshing}
          clearDisabled={filtrosPredeterminados || listRefreshing}
        />

        {!loadError && (
          <AdminProductosListSortBar
            value={ordenar}
            onChange={setOrdenar}
            options={ORDENAR_OPTIONS}
            disabled={listRefreshing}
          />
        )}
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
                Cuando agregues el primero, vas a verlo acá con imagen, precio, stock y estado. El listado se
                actualiza solo y la paginación se adapta al total del catálogo.
              </p>
              <button
                type="button"
                onClick={openCreate}
                disabled={categoriasActivasCount === 0}
                className="admin-pressable mt-6 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-semibold text-white shadow-sm enabled:hover:brightness-105 enabled:active:brightness-95 active:shadow-[0_1px_4px_rgba(0,0,0,0.2)] disabled:pointer-events-none disabled:opacity-45 sm:w-auto"
              >
                <Plus size={20} strokeWidth={2.25} aria-hidden />
                Nuevo producto
              </button>
              {categoriasActivasCount === 0 ? (
                <p className="mt-3 max-w-md text-xs text-zinc-500">
                  Activá una categoría en «Categorías» para habilitar el alta.
                </p>
              ) : null}
            </div>
          )}

          {vacioPorFiltros && (
            <div className="admin-quick-card-enter flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-zinc-200/60">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                <Search size={26} strokeWidth={1.75} aria-hidden />
              </div>
              <p className="mt-5 text-base font-semibold text-zinc-900">
                No se encontraron resultados con esos filtros.
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                Probá otra búsqueda o ajustá categoría, estado, destacado o venta. También podés usar «Limpiar
                filtros» y volver al listado completo.
              </p>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {items.length > 0 && (
            <ul
              ref={listTopRef}
              className={`scroll-mt-4 flex flex-col gap-3 transition-opacity duration-200 ${listRefreshing ? "pointer-events-none opacity-55" : ""}`}
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
              const descripcionTrim = (row.descripcion || "").trim();
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
                    <div className="min-w-0 flex-1 space-y-2">
                      <p
                        className={`text-base font-semibold leading-snug ${row.activo ? "text-zinc-900" : "text-zinc-600"}`}
                      >
                        {row.nombre}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
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
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <span className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
                          {formatPrecioLista(row.precio)}
                        </span>
                        <span className="text-sm text-zinc-600">
                          Stock{" "}
                          <span
                            className={`font-semibold tabular-nums ${Number(row.stock) === 0 ? "text-rose-800" : "text-zinc-800"}`}
                          >
                            {stockLabel}
                          </span>
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                        <span
                          className={`max-w-full shrink-0 font-medium ${catMissing ? "text-amber-800" : "text-zinc-700"}`}
                        >
                          {catNombre}
                        </span>
                        {descripcionTrim ? (
                          <>
                            <span className="shrink-0 text-zinc-300" aria-hidden>
                              ·
                            </span>
                            <p className="min-w-0 flex-1 basis-[12rem] text-zinc-500 line-clamp-1">{descripcionTrim}</p>
                          </>
                        ) : null}
                      </div>
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

          <AdminListPagination
            page={page}
            totalPages={totalPages}
            busy={listRefreshing}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            ariaLabel="Paginación del listado de productos"
          />
        </>
      )}

      <Modal
        isOpen={formModalOpen}
        onClose={closeFormModal}
        title={editing ? "Editar producto" : "Nuevo producto"}
        closeDisabled={modalBusy}
        keepMountedOnClose
        eagerMount
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
              form="admin-product-form"
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
        <AdminProductForm
          formId="admin-product-form"
          showFooter={false}
          form={form}
          categoriasOptions={categoriasOptionsForm}
          onSubmit={onSubmit}
          saving={saving}
          imageUploading={imageUploading}
          onImageUploadingChange={setImageUploading}
        />
      </Modal>
    </div>
  );
}
