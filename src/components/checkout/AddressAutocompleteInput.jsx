"use client";

import { useId, useMemo } from "react";
import { MapPin } from "lucide-react";

/**
 * Input de dirección listo para integrarse con Google Places Autocomplete.
 *
 * Por ahora ofrece autocompletado del navegador (`autoComplete="street-address"`)
 * + un <datalist> con direcciones guardadas previamente del usuario.
 *
 * Para conectar Google Places más adelante:
 *  1. Cargar el script `@googlemaps/js-api-loader`.
 *  2. Reemplazar el `<input>` por `new google.maps.places.Autocomplete(input)`.
 *  3. Llamar a `onChange` (y opcionalmente `onPlaceSelected`) con la dirección formateada.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {string} [props.error]
 * @param {string} [props.label]
 * @param {{ id: string, direccion: string }[]} [props.savedAddresses]
 * @param {string} [props.id]
 * @param {string} [props.name]
 * @param {boolean} [props.required]
 */
export default function AddressAutocompleteInput({
  value,
  onChange,
  placeholder = "Calle y número, piso, depto",
  error,
  label = "Dirección de entrega",
  savedAddresses = [],
  id = "checkout-direccion",
  name = "direccion",
  required = false,
}) {
  const listId = useId();

  const uniqueSavedAddresses = useMemo(() => {
    const seen = new Set();
    return savedAddresses.filter((addr) => {
      const key = addr.direccion?.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [savedAddresses]);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-zinc-700">
        {label} {required && <span className="text-[#C1121F]">*</span>}
      </label>
      <div className="relative">
        <MapPin
          size={16}
          strokeWidth={2}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="street-address"
          inputMode="text"
          list={uniqueSavedAddresses.length > 0 ? listId : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-11 w-full rounded-xl border bg-white pl-9 pr-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:font-normal placeholder:text-zinc-400 ${
            error
              ? "border-[#C1121F] ring-2 ring-[#C1121F]/15 focus:border-[#C1121F]"
              : "border-zinc-200 focus:border-[#C1121F]/40 focus:ring-2 focus:ring-[#C1121F]/15"
          }`}
        />
        {uniqueSavedAddresses.length > 0 && (
          <datalist id={listId}>
            {uniqueSavedAddresses.map((addr) => (
              <option key={addr.id} value={addr.direccion} />
            ))}
          </datalist>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-[#C1121F]">
          {error}
        </p>
      ) : uniqueSavedAddresses.length > 0 ? (
        <p className="mt-1 text-[11px] text-zinc-500">
          Empezá a escribir para ver tus direcciones guardadas.
        </p>
      ) : null}
    </div>
  );
}
