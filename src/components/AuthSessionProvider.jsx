"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

let authBootstrapPromise = null;

function startAuthBootstrap() {
  if (typeof window === "undefined") return Promise.resolve();
  if (useAuthStore.getState().sessionGateReady) return Promise.resolve();
  if (authBootstrapPromise) return authBootstrapPromise;

  authBootstrapPromise = (async () => {
    try {
      await useAuthStore.getState().refreshProfile();
    } finally {
      useAuthStore.setState({ sessionGateReady: true });
      authBootstrapPromise = null;
    }
  })();

  return authBootstrapPromise;
}

/**
 * Restaura sesión con `GET /auth/me` (cookie admin o cliente).
 */
export default function AuthSessionProvider({ children }) {
  useEffect(() => {
    void startAuthBootstrap();
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      void useAuthStore.getState().refreshProfile();
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", onUnauthorized);
    };
  }, []);

  return children;
}
