"use client";

import { useEffect } from "react";

function isLocalhost() {
  if (typeof window === "undefined") return false;
  const { hostname } = window.location;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local")
  );
}

export default function PwaServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (!window.isSecureContext) {
      return;
    }

    // En desarrollo el SW cachea los chunks de Next con estrategia cache-first,
    // lo que sirve bundles viejos y "congela" los cambios. Lo desregistramos y
    // limpiamos las cachés para que siempre se sirva el código fresco.
    if (isLocalhost()) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        })
        .catch(() => undefined);

      if (typeof caches !== "undefined") {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch(() => undefined);
      }
      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Registro silencioso: no interrumpe UX si el navegador bloquea el SW.
      }
    };

    register();
  }, []);

  return null;
}
