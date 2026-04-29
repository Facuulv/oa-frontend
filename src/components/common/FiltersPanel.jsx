"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import AppSelect from "@/components/ui/AppSelect";

function isFilterActive(filter, value) {
  if (filter.type === "checkbox" || filter.type === "toggle") {
    return Boolean(value) !== Boolean(filter.defaultValue ?? false);
  }
  const fallbackDefault = filter.type === "search" ? "" : "";
  return String(value ?? "") !== String(filter.defaultValue ?? fallbackDefault);
}

function resolveFieldValue(filter, values) {
  const rawValue = values?.[filter.name];
  if (rawValue !== undefined && rawValue !== null) return rawValue;
  if (filter.defaultValue !== undefined) return filter.defaultValue;
  if (filter.type === "checkbox" || filter.type === "toggle") return false;
  return "";
}

function renderField({ filter, value, id, disabled, onChange }) {
  if (filter.type === "search") {
    return (
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          aria-hidden
        />
        <input
          id={id}
          type="search"
          value={String(value ?? "")}
          onChange={(e) => onChange(filter.name, e.target.value)}
          placeholder={filter.placeholder || "Buscar..."}
          disabled={disabled}
          autoComplete="off"
          className="min-h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-3 text-base text-zinc-900 outline-none ring-primary focus:bg-white focus:ring-2 disabled:pointer-events-none disabled:opacity-50"
        />
      </div>
    );
  }

  if (filter.type === "select") {
    return (
      <AppSelect
        id={id}
        value={String(value ?? "")}
        onValueChange={(nextValue) => onChange(filter.name, nextValue)}
        options={Array.isArray(filter.options) ? filter.options : []}
        placeholder={filter.placeholder || filter.label || "Seleccioná..."}
        disabled={disabled}
      />
    );
  }

  if (filter.type === "checkbox" || filter.type === "toggle") {
    return (
      <label
        htmlFor={id}
        className="flex min-h-12 cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 py-2 text-sm font-medium text-zinc-800"
      >
        <span>{filter.checkboxLabel || filter.label}</span>
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          disabled={disabled}
          onChange={(e) => onChange(filter.name, e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary disabled:pointer-events-none disabled:opacity-60"
        />
      </label>
    );
  }

  return null;
}

/**
 * @param {object} props
 * @param {{
 *  type: "search" | "select" | "checkbox" | "toggle",
 *  name: string,
 *  label: string,
 *  placeholder?: string,
 *  options?: { value: string, label: string, disabled?: boolean }[],
 *  defaultValue?: string | boolean,
 *  advanced?: boolean,
 *  id?: string,
 *  disabled?: boolean,
 *  checkboxLabel?: string,
 * }[]} props.filters
 * @param {Record<string, string | boolean | undefined>} props.values
 * @param {(name: string, value: string | boolean) => void} props.onChange
 * @param {() => void} props.onClear
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.clearDisabled]
 * @param {boolean} [props.showAdvancedToggle]
 * @param {string} [props.title]
 * @param {string} [props.clearLabel]
 * @param {string} [props.advancedButtonLabel]
 */
export default function FiltersPanel({
  filters,
  values,
  onChange,
  onClear,
  disabled = false,
  clearDisabled = false,
  showAdvancedToggle = true,
  title = "Filtros",
  clearLabel = "Limpiar filtros",
  advancedButtonLabel = "Filtros avanzados",
}) {
  const rawPanelId = useId();
  const panelId = rawPanelId.replace(/[:]/g, "");

  const searchFilters = useMemo(
    () => filters.filter((filter) => filter.type === "search"),
    [filters],
  );
  const secondaryFilters = useMemo(
    () => filters.filter((filter) => filter.type !== "search" && !filter.advanced),
    [filters],
  );
  const advancedFilters = useMemo(
    () => filters.filter((filter) => filter.type !== "search" && filter.advanced),
    [filters],
  );
  const hasAdvancedFilters = advancedFilters.length > 0;
  const resolvedSecondaryFilters =
    hasAdvancedFilters && !showAdvancedToggle
      ? [...secondaryFilters, ...advancedFilters]
      : secondaryFilters;

  const advancedActive = useMemo(
    () => advancedFilters.some((filter) => isFilterActive(filter, resolveFieldValue(filter, values))),
    [advancedFilters, values],
  );
  const [advancedOpen, setAdvancedOpen] = useState(advancedActive);
  const prevAdvancedActiveRef = useRef(advancedActive);

  useEffect(() => {
    if (advancedActive && !prevAdvancedActiveRef.current) {
      setAdvancedOpen(true);
    }
    prevAdvancedActiveRef.current = advancedActive;
  }, [advancedActive]);

  return (
    <section className="admin-quick-card-enter flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-sm ring-1 ring-zinc-200/50 sm:p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</p>

      {searchFilters.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {searchFilters.map((filter) => {
            const filterId = filter.id || `${panelId}-${filter.name}`;
            const isDisabled = disabled || Boolean(filter.disabled);
            const value = resolveFieldValue(filter, values);
            return (
              <div key={filter.name} className="min-w-0">
                <label htmlFor={filterId} className="mb-1.5 block text-sm font-semibold text-zinc-700">
                  {filter.label}
                </label>
                {renderField({
                  filter,
                  value,
                  id: filterId,
                  disabled: isDisabled,
                  onChange,
                })}
              </div>
            );
          })}
        </div>
      ) : null}

      {resolvedSecondaryFilters.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {resolvedSecondaryFilters.map((filter) => {
            const filterId = filter.id || `${panelId}-${filter.name}`;
            const isDisabled = disabled || Boolean(filter.disabled);
            const value = resolveFieldValue(filter, values);
            return (
              <div key={filter.name} className="min-w-0">
                <label htmlFor={filterId} className="mb-1.5 block text-sm font-semibold text-zinc-700">
                  {filter.label}
                </label>
                {renderField({
                  filter,
                  value,
                  id: filterId,
                  disabled: isDisabled,
                  onChange,
                })}
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 border-t border-zinc-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        {hasAdvancedFilters && showAdvancedToggle ? (
          <button
            type="button"
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 text-sm font-semibold text-zinc-800 outline-none ring-primary transition-colors hover:bg-zinc-100/90 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:justify-start sm:px-4"
            onClick={() => setAdvancedOpen((open) => !open)}
            disabled={disabled}
            aria-expanded={advancedOpen}
            aria-controls={`${panelId}-advanced`}
          >
            <span>{advancedButtonLabel}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={onClear}
          disabled={disabled || clearDisabled}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 outline-none ring-primary transition-colors hover:bg-zinc-50 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-45 sm:w-auto"
        >
          {clearLabel}
        </button>
      </div>

      {hasAdvancedFilters && showAdvancedToggle && advancedOpen ? (
        <div id={`${panelId}-advanced`} className="border-t border-zinc-100 pt-3" role="region" aria-label="Filtros avanzados">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {advancedFilters.map((filter) => {
              const filterId = filter.id || `${panelId}-${filter.name}`;
              const isDisabled = disabled || Boolean(filter.disabled);
              const value = resolveFieldValue(filter, values);
              return (
                <div key={filter.name} className="min-w-0">
                  <label htmlFor={filterId} className="mb-1.5 block text-sm font-semibold text-zinc-700">
                    {filter.label}
                  </label>
                  {renderField({
                    filter,
                    value,
                    id: filterId,
                    disabled: isDisabled,
                    onChange,
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
