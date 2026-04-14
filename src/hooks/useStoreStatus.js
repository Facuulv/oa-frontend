"use client";

import { useState, useEffect } from "react";
import appConfig from "@/config/app.config";

const REFRESH_INTERVAL_MS = 60_000;
const ALWAYS_OPEN = { isOpen: true, message: "Abierto", nextOpeningText: null };

/**
 * Store open/closed status hook.
 * When store hours validation is disabled (default), always returns open.
 * Connect to a backend schedule endpoint when needed.
 */
export function useStoreStatus() {
  const [status, setStatus] = useState(ALWAYS_OPEN);

  useEffect(() => {
    if (!appConfig.features.storeHoursValidation) return;

    const updateStatus = () => {
      setStatus(ALWAYS_OPEN);
    };

    const timer = setTimeout(updateStatus, 0);
    const interval = setInterval(updateStatus, REFRESH_INTERVAL_MS);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!appConfig.features.storeHoursValidation) {
    return ALWAYS_OPEN;
  }

  return status;
}
