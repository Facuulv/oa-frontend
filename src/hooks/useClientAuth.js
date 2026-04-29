"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAuthStore,
  selectAuthUser,
  selectAuthLoading,
  selectIsClienteUser,
} from "@/store/useAuthStore";

/**
 * Sesión de **cliente** (área tienda). No confunde con un admin autenticado.
 */
export function useClientAuth({ redirectTo = null, requireCliente = false } = {}) {
  const router = useRouter();
  const user = useAuthStore(selectAuthUser);
  const loading = useAuthStore(selectAuthLoading);
  const isCliente = useAuthStore(selectIsClienteUser);
  const isAuthenticated = useAuthStore((s) => Boolean(s.user) && selectIsClienteUser(s));
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (loading) return;
    if (requireCliente && Boolean(useAuthStore.getState().user) && !isCliente) {
      router.replace("/admin");
      return;
    }
    if (redirectTo && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [loading, isAuthenticated, isCliente, redirectTo, requireCliente, router]);

  return { user, isAuthenticated, logout, loading };
}
