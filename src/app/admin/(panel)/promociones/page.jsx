"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Star,
  Tag,
} from "lucide-react";
import { toast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import AdminProductosListSortBar from "@/components/admin/AdminProductosListSortBar";
import AdminListPagination from "@/components/admin/AdminListPagination";
import FiltersPanel from "@/components/common/FiltersPanel";
import AdminPromocionForm, {
  promocionFormSchema,
  defaultPromocionFormValues,
  mapPromocionToForm,
  PROMOCION_FORM_SERVER_FIELDS,
} from "@/components/admin/AdminPromocionForm";
import { getCategorias } from "@/services/adminCategoriasService";
import {
  buildPromocionPayload,
  createPromocion,
  getPromocion,
  listProductosParaComponentes,
  listPromocionesAdmin,
  togglePromocionEstado,
  updatePromocion,
  normalizeComponentesFromProducto,
} from "@/services/adminPromocionesService";
import { ADMIN_PRODUCTO_CODES } from "@/services/adminProductosService";

/** Códigos de error del backend para combos (`/admin/promociones-producto`). */
const ADMIN_PROMO_CODES = {
  NO_ENCONTRADA: "PROMO_PRODUCTO_NO_ENCONTRADA",
};
import { useAdminProductosList } from "@/hooks/admin/useAdminProductosList";
import { useScrollListTopOnPagination } from "@/hooks/admin/useScrollIntoViewOnPageChange";
import { TIPO_PRODUCTO } from "@/constants/tipoProducto";
import { ApiError } from "@/utils/api/apiError";
import { buildImageUrl } from "@/lib/imageUtils";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";
import { formatPrice } from "@/utils/format/price";
import { resolveCombosDisponibles } from "@/utils/admin/promocionesMetrics";
import { findCategoriaPromocionesId } from "@/utils/admin/findCategoriaPromocionesId";

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

function errorMessage(err, fallback) {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message;
  return fallback;
}

function isNotFoundApi(err) {
  return (
    err instanceof ApiError &&
    (err.status === 404 ||
      err.code === ADMIN_PRODUCTO_CODES.NO_ENCONTRADO ||
      err.code === ADMIN_PROMO_CODES.NO_ENCONTRADA)
  );
}

function isUnauthorizedApi(err) {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

function humanLoadError(err) {
  if (err instanceof ApiError) {
    if (isUnauthorizedApi(err)) {
      return "No tenés permiso para ver los combos. Volvé a iniciar sesión si hace falta.";
    }
    if (err.status === 404) {
      return "No encontramos el recurso. Si el problema sigue, contactá al administrador.";
    }
    if (err.status >= 500) {
      return "El servidor no respondió bien. Reintentá en unos segundos.";
    }
    return err.message || "No se pudieron cargar los combos.";
  }
  if (err instanceof Error && err.message) {
    return `No se pudieron cargar los combos. (${err.message})`;
  }
  return "No se pudieron cargar los combos. Comprobá tu conexión.";
}

function applyServerFieldErrors(form, apiError) {
  if (!(apiError instanceof ApiError) || !apiError.fieldErrors) return;
  for (const [key, message] of Object.entries(apiError.fieldErrors)) {
    if (PROMOCION_FORM_SERVER_FIELDS.includes(key)) {
      form.setError(key, { type: "server", message });
    }
  }
}

function hasMappedPromoFieldError(apiError) {
  const fe = apiError.fieldErrors ?? {};
  return PROMOCION_FORM_SERVER_FIELDS.some((k) => Boolean(fe[k]));
}

function filtrosEnDefecto(busqueda, filtroActivo, filtroDestacado, filtroDisponible, ordenar) {
  return (
    !busqueda &&
    filtroActivo === "all" &&
    filtroDestacado === "all" &&
    filtroDisponible === "all" &&
    ordenar === "orden_asc"
  );
}

export default function AdminPromocionesPage() {
  const [categorias, setCategorias] = useState([]);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const submitGuardRef = useRef(false);

  const [busquedaInput, setBusquedaInput] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("all");
  const [filtroDestacado, setFiltroDestacado] = useState("all");
  const [filtroDisponible, setFiltroDisponible] = useState("all");
  const [ordenar, setOrdenar] = useState("orden_asc");
  const [page, setPage] = useState(1);
  const listTopRef = useRef(null);

  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerDebounced, setPickerDebounced] = useState("");
  const [pickerOptions, setPickerOptions] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setBusqueda(busquedaInput.trim()), 380);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  useEffect(() => {
    const t = setTimeout(() => setPickerDebounced(pickerQuery.trim()), 320);
    return () => clearTimeout(t);
  }, [pickerQuery]);

  useEffect(() => {
    setPage(1);
  }, [busqueda, filtroActivo, filtroDestacado, filtroDisponible, ordenar]);

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
    filtroCategoria: "",
    filtroActivo,
    filtroDestacado,
    filtroDisponible,
    ordenar,
    tipoProducto: TIPO_PRODUCTO.PROMOCION,
    listFn: listPromocionesAdmin,
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
    () => filtrosEnDefecto(busqueda, filtroActivo, filtroDestacado, filtroDisponible, ordenar),
    [busqueda, filtroActivo, filtroDestacado, filtroDisponible, ordenar],
  );

  const catalogoVacio =
    !loadingInitial &&
    !loadError &&
    items.length === 0 &&
    pagination.total === 0 &&
    filtrosPredeterminados;

  const vacioPorFiltros =
    !loadingInitial && !loadError && items.length === 0 && !catalogoVacio;

  const limpiarFiltros = () => {
    setBusquedaInput("");
    setBusqueda("");
    setFiltroActivo("all");
    setFiltroDestacado("all");
    setFiltroDisponible("all");
    setOrdenar("orden_asc");
    setPage(1);
  };

  const handleBusquedaInputChange = useCallback((value) => {
    setBusquedaInput(value);
    if (!value.trim()) setBusqueda("");
  }, []);

  const filtersValues = useMemo(
    () => ({
      busqueda: busquedaInput,
      estado: filtroActivo,
      destacado: filtroDestacado,
      venta: filtroDisponible,
    }),
    [busquedaInput, filtroActivo, filtroDestacado, filtroDisponible],
  );

  const filtersConfig = useMemo(
    () => [
      {
        type: "search",
        name: "busqueda",
        label: "Buscar",
        placeholder: "Nombre del combo…",
        defaultValue: "",
      },
      {
        type: "select",
        name: "estado",
        label: "Estado",
        defaultValue: "all",
        options: [
          { value: "all", label: "Activos e inactivos" },
          { value: "true", label: "Solo activos" },
          { value: "false", label: "Solo inactivos" },
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
          { value: "true", label: "Destacados" },
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
          { value: "true", label: "Disponibles" },
          { value: "false", label: "No disponibles" },
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
    resolver: zodResolver(promocionFormSchema),
    defaultValues: defaultPromocionFormValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const promocionesCategoria = useMemo(() => {
    const id = findCategoriaPromocionesId(categorias);
    if (id == null) return { id: null, activa: false };
    const row = categorias.find((c) => Number(c.id) === Number(id));
    return { id, activa: Boolean(row?.activo) };
  }, [categorias]);

  const puedeCrearPromocion = promocionesCategoria.id != null && promocionesCategoria.activa;

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

  useEffect(() => {
    if (!formModalOpen) return;
    let cancelled = false;
    (async () => {
      setPickerLoading(true);
      setPickerError(null);
      try {
        const { productos } = await listProductosParaComponentes({
          busqueda: pickerDebounced || undefined,
          page: 1,
          limit: 120,
        });
        if (cancelled) return;
        const rows = Array.isArray(productos) ? productos : [];
        const onlyProduct = rows.filter(
          (p) => (p?.tipo_producto ?? TIPO_PRODUCTO.PRODUCTO) === TIPO_PRODUCTO.PRODUCTO,
        );
        setPickerOptions(
          onlyProduct.map((p) => ({
            id: p.id,
            nombre: p.nombre ?? `Producto ${p.id}`,
            precio: p.precio,
            stock: p.stock,
          })),
        );
      } catch (e) {
        if (!cancelled) {
          setPickerError(errorMessage(e, "No se pudieron cargar los productos"));
          setPickerOptions([]);
        }
      } finally {
        if (!cancelled) setPickerLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [formModalOpen, pickerDebounced]);

  useEffect(() => {
    if (!formModalOpen || editing) return;
    if (puedeCrearPromocion && promocionesCategoria.id != null) {
      form.setValue("categoria_id", promocionesCategoria.id);
    }
  }, [formModalOpen, editing, puedeCrearPromocion, promocionesCategoria.id, form.setValue]);

  const openCreate = () => {
    setEditing(null);
    setPickerQuery("");
    setPickerDebounced("");
    form.reset({
      ...defaultPromocionFormValues,
      categoria_id: puedeCrearPromocion ? promocionesCategoria.id : undefined,
    });
    form.clearErrors();
    setFormModalOpen(true);
  };

  const openEdit = async (row) => {
    setEditing(row);
    setPickerQuery("");
    setPickerDebounced("");
    form.reset(mapPromocionToForm(row));
    if (puedeCrearPromocion && promocionesCategoria.id != null) {
      form.setValue("categoria_id", promocionesCategoria.id);
    }
    form.clearErrors();
    setFormModalOpen(true);
    setDetailLoading(true);
    try {
      const full = await getPromocion(row.id);
      form.reset(mapPromocionToForm(full));
      if (puedeCrearPromocion && promocionesCategoria.id != null) {
        form.setValue("categoria_id", promocionesCategoria.id);
      }
    } catch (e) {
      if (!isNotFoundApi(e)) {
        toast.error(errorMessage(e, "No se pudo cargar el detalle del combo"), {
          description: "Mostramos los datos del listado.",
        });
      }
      form.reset(mapPromocionToForm(row));
      if (puedeCrearPromocion && promocionesCategoria.id != null) {
        form.setValue("categoria_id", promocionesCategoria.id);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const closeFormModal = () => {
    form.clearErrors();
    setFormModalOpen(false);
    setEditing(null);
    setDetailLoading(false);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (submitGuardRef.current) return;
    submitGuardRef.current = true;
    form.clearErrors();
    const catPromoId = findCategoriaPromocionesId(categorias);
    const catRow = categorias.find((c) => Number(c.id) === Number(catPromoId));
    if (!catPromoId || !catRow?.activo) {
      toast.error("No está disponible la categoría «Combos»", {
        description: "Creala o activala en «Categorías» con ese nombre (o slug «combos»).",
      });
      submitGuardRef.current = false;
      return;
    }
    setSaving(true);
    const payload = buildPromocionPayload({ ...values, categoria_id: catPromoId });
    try {
      if (editing) {
        await updatePromocion(editing.id, payload);
        toast.success("Combo actualizado");
      } else {
        await createPromocion(payload);
        toast.success("Combo creado");
      }
      closeFormModal();
      await load();
    } catch (e) {
      if (e instanceof ApiError) {
        applyServerFieldErrors(form, e);

        if (isNotFoundApi(e)) {
          toast.error("Este combo ya no existe", { description: "Actualizamos el listado." });
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
            description: "El combo debe usar la categoría «Combos» activa en «Categorías».",
          });
          form.setError("categoria_id", {
            type: "server",
            message: e.message || "Categoría no válida",
          });
          return;
        }

        if (hasMappedPromoFieldError(e)) {
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
      await togglePromocionEstado(row.id, next);
      toast.success(next ? "Combo activado" : "Combo desactivado");
      await load();
    } catch (e) {
      if (isNotFoundApi(e)) {
        toast.error("Ese combo ya no existe", {
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

  const modalBusy = saving || imageUploading || detailLoading;
  const primarySubmitLabel =
    imageUploading && !saving
      ? "Esperá la imagen…"
      : detailLoading
        ? "Cargando combo…"
        : editing
          ? "Guardar cambios"
          : "Crear combo";

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
            <h2 className="truncate text-lg font-bold tracking-tight text-zinc-900">Combos</h2>
            <p className="mt-0.5 text-xs font-medium text-zinc-500">
              Armá nuevos combos con productos del catálogo
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!puedeCrearPromocion}
          className="admin-pressable inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-semibold text-white shadow-sm enabled:hover:brightness-105 enabled:active:brightness-95 active:shadow-[0_1px_4px_rgba(0,0,0,0.2)] disabled:pointer-events-none disabled:opacity-45 sm:min-w-[200px]"
        >
          <Plus size={20} strokeWidth={2.25} aria-hidden />
          Nuevo combo
        </button>
      </header>

      {categorias.length > 0 && !loadError && !puedeCrearPromocion && (
        <div
          className="admin-quick-card-enter rounded-2xl border border-amber-200/90 bg-amber-50/95 p-4 text-sm text-amber-950 shadow-sm ring-1 ring-amber-200/50"
          role="status"
        >
          {promocionesCategoria.id == null ? (
            <>
              <p className="font-semibold text-amber-900">Falta la categoría «Combos»</p>
              <p className="mt-1 leading-relaxed text-amber-900/90">
                Creá en «Categorías» una categoría llamada <span className="font-semibold">Combos</span> (o con slug{" "}
                <span className="font-semibold">combos</span>) para publicar combos.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-amber-900">La categoría «Combos» está inactiva</p>
              <p className="mt-1 leading-relaxed text-amber-900/90">
                Activá esa categoría en «Categorías» para poder crear o guardar combos.
              </p>
            </>
          )}
        </div>
      )}

      {categorias.length === 0 && !loadError && (
        <div
          className="admin-quick-card-enter rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm ring-1 ring-zinc-200/60"
          role="status"
        >
          <p className="font-semibold text-zinc-900">No hay categorías cargadas</p>
          <p className="mt-1 text-zinc-600">
            Cargá categorías desde el backend o en «Categorías» antes de crear combos.
          </p>
        </div>
      )}

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

      {loadingInitial && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Cargando combos">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[8.5rem] animate-pulse rounded-2xl bg-zinc-200/55 ring-1 ring-zinc-200/40 motion-reduce:animate-none"
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
          <p className="col-span-full text-center text-sm text-zinc-500">Cargando combos…</p>
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
          {catalogoVacio && (
            <div className="admin-quick-card-enter flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-zinc-200/60">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-400 ring-1 ring-violet-100">
                <Tag size={28} strokeWidth={1.75} aria-hidden />
              </div>
              <p className="mt-5 text-base font-semibold text-zinc-900">Todavía no hay combos</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                Creá combos con productos del catálogo. El precio final se guarda en el producto tipo combo; el stock
                vendible depende de los componentes.
              </p>
              <button
                type="button"
                onClick={openCreate}
                disabled={!puedeCrearPromocion}
                className="admin-pressable mt-6 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-semibold text-white shadow-sm enabled:hover:brightness-105 enabled:active:brightness-95 active:shadow-[0_1px_4px_rgba(0,0,0,0.2)] disabled:pointer-events-none disabled:opacity-45 sm:w-auto"
              >
                <Plus size={20} strokeWidth={2.25} aria-hidden />
                Nuevo combo
              </button>
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
                Ajustá la búsqueda o los filtros de estado.
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
              className={`scroll-mt-4 grid grid-cols-1 gap-4 transition-opacity duration-200 lg:grid-cols-2 ${listRefreshing ? "pointer-events-none opacity-55" : ""}`}
              aria-busy={listRefreshing}
            >
              {items.map((row, index) => {
                const thumb =
                  buildImageUrl(row.imagen_url, { preset: "adminThumb" }) || PLACEHOLDER_PRODUCT_CARD;
                const busy = togglingId === row.id;
                const comps = normalizeComponentesFromProducto(row);
                const precioPromo = Number(row.precio);
                const combos = resolveCombosDisponibles(row, comps);
                const componentesCount = comps.length;
                const descripcionCompacta = (row.descripcion || "").trim();

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
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p
                            className={`text-base font-semibold leading-snug ${row.activo ? "text-zinc-900" : "text-zinc-600"}`}
                          >
                            {row.nombre}
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
                                Sin stock
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <p className="text-base font-bold text-zinc-900">
                          {formatPrice(Number.isFinite(precioPromo) ? precioPromo : 0)}
                        </p>
                        {combos != null ? (
                          <p className="text-xs font-medium text-zinc-600">
                            {combos > 0 ? (
                              <>
                                Disponible para <span className="text-zinc-900">{combos}</span>{" "}
                                {combos === 1 ? "combo" : "combos"}
                              </>
                            ) : (
                              <span className="text-amber-900">Sin stock suficiente para armar combos</span>
                            )}
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-400">Disponibilidad: sin datos</p>
                        )}
                        {descripcionCompacta ? (
                          <p className="line-clamp-1 text-sm text-zinc-500">{descripcionCompacta}</p>
                        ) : componentesCount > 0 ? (
                          <p className="line-clamp-1 text-sm text-zinc-500">
                            {componentesCount} {componentesCount === 1 ? "componente" : "componentes"} en el combo
                          </p>
                        ) : (
                          <p className="text-sm italic text-zinc-400">Sin descripción</p>
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

          <AdminListPagination
            page={page}
            totalPages={totalPages}
            busy={listRefreshing}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            ariaLabel="Paginación del listado de combos"
          />
        </>
      )}

      <Modal
        isOpen={formModalOpen}
        onClose={closeFormModal}
        title={editing ? "Editar combo" : "Nuevo combo"}
        closeDisabled={modalBusy}
        keepMountedOnClose
        eagerMount
        maxWidthClass="w-full max-w-lg sm:max-w-2xl"
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
              form="admin-promocion-form"
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
        <AdminPromocionForm
          formId="admin-promocion-form"
          showFooter={false}
          form={form}
          onSubmit={onSubmit}
          saving={saving}
          imageUploading={imageUploading}
          onImageUploadingChange={setImageUploading}
          pickerOptions={pickerOptions}
          pickerLoading={pickerLoading}
          pickerError={pickerError}
          pickerQuery={pickerQuery}
          onPickerQueryChange={setPickerQuery}
        />
      </Modal>
    </div>
  );
}
