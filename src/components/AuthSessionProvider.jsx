"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getToken, syncTokenToCookie } from "@/utils/auth/token";

/**
 * Sincroniza token → cookie (middleware) y refresca el perfil tras rehidratar el store.
 */
export default function AuthSessionProvider({ children }) {
  useEffect(() => {
    syncTokenToCookie();
  }, []);

  useEffect(() => {
    const bootstrap = () => {
      syncTokenToCookie();
      if (getToken()) {
        void useAuthStore.getState().refreshProfile();
      }
    };

    if (useAuthStore.persist.hasHydrated()) {
      bootstrap();
      return undefined;
    }

    return useAuthStore.persist.onFinishHydration(() => {
      bootstrap();
    });
  }, []);

  return children;
}
