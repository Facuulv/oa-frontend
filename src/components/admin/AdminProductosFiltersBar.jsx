"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import AppSelect from "@/components/ui/AppSelect";

const CAT_FILTER_ALL = "__all__";

/**
 * Barra de filtros del listado admin de productos: principales siempre visibles,
 * secundarios en panel colapsable, chips opcionales y acción de limpieza.
 *
 * @param {object} props
 * @param {{ id: number|string, nombre: string, activo?: boolean }[]} props.categorias
 * @param {string} props.busquedaInput
 * @param {(value: string) => void} props.onBusquedaInputChange
 * @param {string} props.filtroCategoria
 * @param {(value: string) => void} props.onFiltroCategoriaChange
 * @param {"all"|"true"|"false"} props.filtroActivo
 * @param {(value: string) => void} props.onFiltroActivoChange
 * @param {"all"|"true"|"false"} props.filtroDestacado
 * @param {(value: string) => void} props.onFiltroDestacadoChange
 * @param {"all"|"true"|"false"} props.filtroDisponible
 * @param {(value: string) => void} props.onFiltroDisponibleChange
 * @param {boolean} props.filtrosPredeterminados
 * @param {() => void} props.onLimpiarFiltros
 * @param {boolean} [props.listRefreshing]
 */
export default function AdminProductosFiltersBar({
  categorias,
  busquedaInput,
  onBusquedaInputChange,
  filtroCategoria,
  onFiltroCategoriaChange,
  filtroActivo,
  onFiltroActivoChange,
  filtroDestacado,
  onFiltroDestacadoChange,
  filtroDisponible,
  onFiltroDisponibleChange,
  filtrosPredeterminados,
  onLimpiarFiltros,
  listRefreshing = false,
}) {
  const advancedActive = filtroDestacado !== "all" || filtroDisponible !== "all";
  const [advancedOpen, setAdvancedOpen] = useState(advancedActive);
  const prevAdvancedActiveRef = useRef(advancedActive);

  useEffect(() => {
    if (advancedActive && !prevAdvancedActiveRef.current) {
      setAdvancedOpen(true);
    }
    prevAdvancedActiveRef.current = advancedActive;
  }, [advancedActive]);

  const advancedPanelId = "prod-filtros-avanzados-panel";

  const categoriaNombre = useMemo(() => {
    if (!filtroCategoria) return "";
    const c = categorias.find((x) => String(x.id) === String(filtroCategoria));
    return c?.nombre ?? "Categoría";
  }, [categorias, filtroCategoria]);

  /** @type {{ key: string, label: string, onRemove: () => void }[]} */
  const chips = useMemo(() => {
    const out = [];
    const q = busquedaInput.trim();
    if (q) {
      out.push({
        key: "busqueda",
        label: `Búsqueda: ${q}`,
        onRemove: () => onBusquedaInputChange(""),
      });
    }
    if (filtroCategoria) {
      out.push({
        key: "categoria",
        label: `Categoría: ${categoriaNombre}`,
        onRemove: () => onFiltroCategoriaChange(""),
      });
    }
    if (filtroActivo === "true") {
      out.push({
        key: "activo-true",
        label: "Solo activos",
        onRemove: () => onFiltroActivoChange("all"),
      });
    } else if (filtroActivo === "false") {
      out.push({
        key: "activo-false",
        label: "Solo inactivos",
        onRemove: () => onFiltroActivoChange("all"),
      });
    }
    if (filtroDestacado === "true") {
      out.push({
        key: "dest-true",
        label: "Destacados",
        onRemove: () => onFiltroDestacadoChange("all"),
      });
    } else if (filtroDestacado === "false") {
      out.push({
        key: "dest-false",
        label: "Sin destacar",
        onRemove: () => onFiltroDestacadoChange("all"),
      });
    }
    if (filtroDisponible === "true") {
      out.push({
        key: "disp-true",
        label: "Disponibles para venta",
        onRemove: () => onFiltroDisponibleChange("all"),
      });
    } else if (filtroDisponible === "false") {
      out.push({
        key: "disp-false",
        label: "No disponibles",
        onRemove: () => onFiltroDisponibleChange("all"),
      });
    }
    return out;
  }, [
    busquedaInput,
    categoriaNombre,
    filtroActivo,
    filtroCategoria,
    filtroDestacado,
    filtroDisponible,
    onBusquedaInputChange,
    onFiltroActivoChange,
    onFiltroCategoriaChange,
    onFiltroDestacadoChange,
    onFiltroDisponibleChange,
  ]);

  return (
    <div className="admin-quick-card-enter rounded-2xl border border-zinc-200/90 bg-white p-3 shadow-sm ring-1 ring-zinc-200/50 sm:p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end sm:gap-x-3 sm:gap-y-2">
        <div className="min-w-0 sm:col-span-5">
          <label
            htmlFor="prod-busqueda"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
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
              onChange={(e) => onBusquedaInputChange(e.target.value)}
              placeholder="Ej. gin, cola…"
              className="min-h-10 w-full rounded-xl border border-zinc-200 py-2 pl-9 pr-3 text-base outline-none ring-primary ring-offset-2 ring-offset-white focus:ring-2 sm:min-h-11 sm:py-2.5"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="min-w-0 sm:col-span-4">
          <label
            htmlFor="prod-f-cat"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Categoría
          </label>
          <AppSelect
            id="prod-f-cat"
            value={filtroCategoria ? String(filtroCategoria) : CAT_FILTER_ALL}
            onValueChange={(v) => onFiltroCategoriaChange(v === CAT_FILTER_ALL ? "" : v)}
            disabled={listRefreshing}
            size="compact"
            options={[
              { value: CAT_FILTER_ALL, label: "Todas" },
              ...categorias.map((c) => ({
                value: String(c.id),
                label: `${c.nombre}${!c.activo ? " (inactiva)" : ""}`,
              })),
            ]}
            placeholder="Categoría"
          />
        </div>

        <div className="min-w-0 sm:col-span-3">
          <label
            htmlFor="prod-f-act"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Catálogo / estado
          </label>
          <AppSelect
            id="prod-f-act"
            value={filtroActivo}
            onValueChange={onFiltroActivoChange}
            disabled={listRefreshing}
            size="compact"
            options={[
              { value: "all", label: "Todos" },
              { value: "true", label: "Activos" },
              { value: "false", label: "Inactivos" },
            ]}
            placeholder="Estado"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <button
          type="button"
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 text-sm font-semibold text-zinc-800 outline-none ring-primary transition-colors hover:bg-zinc-100/90 focus-visible:ring-2 sm:w-auto sm:justify-start sm:px-4"
          aria-expanded={advancedOpen}
          aria-controls={advancedPanelId}
          disabled={listRefreshing}
          onClick={() => setAdvancedOpen((o) => !o)}
        >
          <span>Filtros avanzados</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        <button
          type="button"
          onClick={onLimpiarFiltros}
          disabled={filtrosPredeterminados || listRefreshing}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 outline-none ring-primary transition-colors hover:bg-zinc-50 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-45 sm:ml-auto sm:w-auto"
        >
          Limpiar filtros
        </button>
      </div>

      {advancedOpen ? (
        <div
          id={advancedPanelId}
          className="mt-3 border-t border-zinc-200/80 pt-3"
          role="region"
          aria-label="Filtros avanzados"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-3">
            <div className="min-w-0">
              <label
                htmlFor="prod-f-dest"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
              >
                Destacado
              </label>
              <AppSelect
                id="prod-f-dest"
                value={filtroDestacado}
                onValueChange={onFiltroDestacadoChange}
                disabled={listRefreshing}
                size="compact"
                options={[
                  { value: "all", label: "Todos" },
                  { value: "true", label: "Solo destacados" },
                  { value: "false", label: "Sin destacar" },
                ]}
                placeholder="Destacado"
              />
            </div>
            <div className="min-w-0">
              <label
                htmlFor="prod-f-disp"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
              >
                Venta
              </label>
              <AppSelect
                id="prod-f-disp"
                value={filtroDisponible}
                onValueChange={onFiltroDisponibleChange}
                disabled={listRefreshing}
                size="compact"
                options={[
                  { value: "all", label: "Todos" },
                  { value: "true", label: "Disponibles para venta" },
                  { value: "false", label: "No disponibles" },
                ]}
                placeholder="Venta"
              />
            </div>
          </div>
        </div>
      ) : null}

      {chips.length > 0 ? (
        <div className="mt-3 border-t border-zinc-100 pt-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Filtros activos</p>
          <ul className="flex flex-wrap gap-2" aria-label="Filtros activos">
            {chips.map((c) => (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={c.onRemove}
                  disabled={listRefreshing}
                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-2.5 pr-1 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-50"
                >
                  <span className="min-w-0 truncate">{c.label}</span>
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200/80 hover:text-zinc-800">
                    <X className="h-3.5 w-3.5" aria-hidden />
                    <span className="sr-only">Quitar {c.label}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
