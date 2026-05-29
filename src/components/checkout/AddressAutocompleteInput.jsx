"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import {
  CORDOBA_CAPITAL_CENTER,
  CORDOBA_CAPITAL_VIEWBOX,
  isCordobaCapitalResult,
} from "@/constants/cordobaMap";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const SEARCH_DEBOUNCE_MS = 450;
const SEARCH_MIN_LENGTH = 4;

const LeafletAddressMap = dynamic(
  () => import("@/components/checkout/LeafletAddressMap"),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full animate-pulse bg-zinc-100"
        aria-label="Cargando mapa de direcciones"
      />
    ),
  },
);

function toLatLngTuple(coords) {
  if (!coords) return null;
  const { lat, lng } = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

function toAddressCoords(result) {
  if (!result) return null;
  const lat = parseFloat(result.lat);
  const lng = parseFloat(result.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/**
 * Input de dirección con autocompletado (Nominatim) + mapa interactivo (Leaflet).
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {{ lat: number, lng: number } | null} [props.location]
 * @param {(coords: { lat: number, lng: number } | null) => void} [props.onLocationChange]
 * @param {string} [props.placeholder]
 * @param {string} [props.error]
 * @param {string} [props.label]
 * @param {{ id: string, direccion: string, lat?: number, lng?: number }[]} [props.savedAddresses]
 * @param {string} [props.id]
 * @param {string} [props.name]
 * @param {boolean} [props.required]
 */
export default function AddressAutocompleteInput({
  value,
  onChange,
  location = null,
  onLocationChange,
  placeholder = "Calle y altura (ej. Ituzaingó 450)",
  error,
  label = "Dirección de entrega",
  savedAddresses = [],
  id = "checkout-direccion",
  name = "direccion",
  required = false,
}) {
  const listId = useId();
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const [userLocation, setUserLocation] = useState(
    () => toLatLngTuple(location) ?? CORDOBA_CAPITAL_CENTER,
  );
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [busquedaFallida, setBusquedaFallida] = useState(false);
  const [direccionValida, setDireccionValida] = useState(
    Boolean(toLatLngTuple(location)),
  );

  const onLocationChangeRef = useRef(onLocationChange);
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  const uniqueSavedAddresses = useMemo(() => {
    const seen = new Set();
    return savedAddresses.filter((addr) => {
      const key = addr.direccion?.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [savedAddresses]);

  // Sincroniza el userLocation cuando el padre nos pasa una location válida.
  useEffect(() => {
    const tuple = toLatLngTuple(location);
    if (tuple) {
      setUserLocation(tuple);
      setDireccionValida(true);
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setMostrarLista(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const buscarSugerencias = useCallback((texto) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBuscando(true);
    setBusquedaFallida(false);
    setMostrarLista(true);

    // Nominatim NO permite combinar `q` con city/country (devuelve 400),
    // así que sumamos la ciudad dentro de `q` y acotamos con viewbox + bounded.
    const params = new URLSearchParams({
      format: "json",
      addressdetails: "1",
      limit: "6",
      countrycodes: "ar",
      viewbox: CORDOBA_CAPITAL_VIEWBOX,
      bounded: "1",
      q: `${texto}, Córdoba Capital, Argentina`,
    });

    fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Nominatim respondió ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const next = (Array.isArray(data) ? data : []).filter(isCordobaCapitalResult);
        setSugerencias(next);
        setBusquedaFallida(false);
        setMostrarLista(true);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setSugerencias([]);
          setBusquedaFallida(true);
          setMostrarLista(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setBuscando(false);
      });
  }, []);

  const handleInputChange = useCallback(
    (nextValue) => {
      onChange(nextValue);
      setDireccionValida(false);
      onLocationChangeRef.current?.(null);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      const texto = nextValue.trim();
      if (texto.length < SEARCH_MIN_LENGTH) {
        abortRef.current?.abort();
        setSugerencias([]);
        setMostrarLista(false);
        setBuscando(false);
        setBusquedaFallida(false);
        return;
      }

      debounceRef.current = setTimeout(() => buscarSugerencias(texto), SEARCH_DEBOUNCE_MS);
    },
    [onChange, buscarSugerencias],
  );

  const handleSuggestionSelect = useCallback(
    (item) => {
      const coords = toAddressCoords(item);
      if (!coords) return;
      const displayName = item.display_name?.trim() || value;
      onChange(displayName);
      setUserLocation([coords.lat, coords.lng]);
      setDireccionValida(true);
      setSugerencias([]);
      setMostrarLista(false);
      setBuscando(false);
      onLocationChangeRef.current?.(coords);
    },
    [onChange, value],
  );

  const hasSavedAddresses = uniqueSavedAddresses.length > 0;
  const showError = Boolean(error) && !direccionValida;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-zinc-700">
        {label} {required && <span className="text-[#C1121F]">*</span>}
      </label>
      <div ref={wrapperRef} className="relative">
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
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          inputMode="text"
          onFocus={() => {
            if (sugerencias.length > 0) setMostrarLista(true);
          }}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-error` : undefined}
          className={`h-11 w-full rounded-xl border bg-white pl-9 pr-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:font-normal placeholder:text-zinc-400 ${
            showError
              ? "border-[#C1121F] ring-2 ring-[#C1121F]/15 focus:border-[#C1121F]"
              : direccionValida
                ? "border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                : "border-zinc-200 focus:border-[#C1121F]/40 focus:ring-2 focus:ring-[#C1121F]/15"
          }`}
        />
        {mostrarLista && (buscando || sugerencias.length > 0 || busquedaFallida) && (
          <ul
            id={listId}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
            role="listbox"
          >
            {buscando && sugerencias.length === 0 ? (
              <li className="px-3 py-2 text-sm text-zinc-500">Buscando...</li>
            ) : busquedaFallida ? (
              <li className="px-3 py-2 text-sm text-zinc-500">
                No pudimos buscar la dirección. Revisá tu conexión e intentá de nuevo.
              </li>
            ) : sugerencias.length === 0 ? (
              <li className="px-3 py-2 text-sm text-zinc-500">
                Sin resultados en Córdoba capital. Probá con calle y altura.
              </li>
            ) : (
              sugerencias.map((item) => (
                <li
                  key={item.place_id}
                  className="flex cursor-pointer items-start gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-gray-100"
                  onClick={() => handleSuggestionSelect(item)}
                  role="option"
                  aria-selected="false"
                >
                  <MapPin size={14} className="mt-0.5 shrink-0 text-[#C1121F]" aria-hidden />
                  <span>{item.display_name}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <div className="relative z-0 mt-4 mb-2 h-[250px] w-full overflow-hidden rounded-xl border border-zinc-200">
        <LeafletAddressMap userLocation={userLocation} />
      </div>
      {showError ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-[#C1121F]">
          {error}
        </p>
      ) : direccionValida ? (
        <p className="mt-1 text-[11px] font-medium text-emerald-600">
          Ubicación confirmada en el mapa.
        </p>
      ) : hasSavedAddresses ? (
        <p className="mt-1 text-[11px] text-zinc-500">
          Empezá a escribir y elegí tu dirección de la lista.
        </p>
      ) : (
        <p className="mt-1 text-[11px] text-zinc-500">
          Escribí la calle y altura, después elegí la opción correcta.
        </p>
      )}
    </div>
  );
}
