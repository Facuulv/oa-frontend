"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAuthStore,
  selectAuthUser,
  selectAuthSessionGateReady,
  selectIsClienteUser,
} from "@/store/useAuthStore";

/**
 * Sesión de **cliente** (área tienda). No confunde con un admin autenticado.
 */
export function useClientAuth({ redirectTo = null, requireCliente = false } = {}) {
  const router = useRouter();
  const user = useAuthStore(selectAuthUser);
  const authReady = useAuthStore(selectAuthSessionGateReady);
  const isCliente = useAuthStore(selectIsClienteUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated && selectIsClienteUser(s));
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!authReady) return;
    if (requireCliente && useAuthStore.getState().isAuthenticated && !isCliente) {
      router.replace("/admin");
      return;
    }
    if (redirectTo && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [authReady, isAuthenticated, isCliente, redirectTo, requireCliente, router]);

  return { user, isAuthenticated, logout, authReady };
}
