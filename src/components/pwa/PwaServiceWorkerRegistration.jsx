"use client";

import { useEffect } from "react";

export default function PwaServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (!window.isSecureContext) {
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
