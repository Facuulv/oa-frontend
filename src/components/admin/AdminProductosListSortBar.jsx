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
    <div className="admin-quick-card-enter flex items-center gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50/60 px-3 py-2 shadow-sm ring-1 ring-zinc-200/40 sm:px-4">
      <label
        htmlFor="prod-ordenar"
        className="shrink-0 text-sm font-semibold text-zinc-900"
      >
        Ordenar por
      </label>
      <div className="min-w-0 flex-1">
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
