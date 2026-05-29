"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchEstadoTienda,
  mapEstadoToStoreStatus,
} from "@/services/estadoTiendaService";

const REFRESH_INTERVAL_MS = 60_000;

const INITIAL = {
  isLoading: true,
  error: null,
  estaAbierto: false,
  bloqueado: false,
  validarHorarios: true,
  canAcceptOrders: false,
  mensaje: "",
  message: "",
  nextOpeningText: null,
  timezone: "America/Argentina/Buenos_Aires",
  fetchError: false,
  isOpen: false,
};

/**
 * Estado abierto/cerrado de la carta desde GET /public/carta/estado.
 */
export function useStoreStatus() {
  const [status, setStatus] = useState(INITIAL);

  const load = useCallback(async (force = false) => {
    setStatus((prev) => ({ ...prev, isLoading: prev.isLoading && !force }));
    try {
      const estado = await fetchEstadoTienda({ force });
      const mapped = mapEstadoToStoreStatus(estado);
      setStatus({
        ...mapped,
        isLoading: false,
        error: mapped.fetchError ? mapped.mensaje : null,
      });
    } catch (err) {
      setStatus({
        ...INITIAL,
        isLoading: false,
        error: err?.message || "Error al consultar el estado de la tienda.",
        fetchError: true,
      });
    }
  }, []);

  useEffect(() => {
    load(false);
    const interval = setInterval(() => load(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const refetch = useCallback(() => load(true), [load]);

  return {
    ...status,
    refetch,
  };
}
