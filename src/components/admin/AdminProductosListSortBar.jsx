"use client";

import AppSelect from "@/components/ui/AppSelect";

/**
 * Selector de orden del listado, separado visualmente del bloque de filtros.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {{ value: string, label: string }[]} props.options
 * @param {boolean} [props.disabled]
 */
export default function AdminProductosListSortBar({ value, onChange, options, disabled = false }) {
  return (
    <div className="admin-quick-card-enter flex flex-col gap-2 rounded-2xl border border-zinc-200/70 bg-zinc-50/60 px-3 py-3 shadow-sm ring-1 ring-zinc-200/40 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:px-4">
      <p className="text-sm font-semibold text-zinc-900 sm:self-center sm:pb-2">Listado</p>
      <div className="w-full min-w-0 sm:max-w-xs sm:flex-1 sm:shrink-0">
        <label
          htmlFor="prod-ordenar"
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
        >
          Ordenar por
        </label>
        <AppSelect
          id="prod-ordenar"
          value={value}
          onValueChange={onChange}
          options={options.map((o) => ({ value: o.value, label: o.label }))}
          disabled={disabled}
          placeholder="Orden…"
          size="compact"
        />
      </div>
    </div>
  );
}
