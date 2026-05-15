"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAuthStore,
  selectAuthUser,
  selectCanAccessAdminPanel,
  selectIsAuthenticated,
  selectAuthLoading,
  selectIsSessionLoaded,
} from "@/store/useAuthStore";

export function useAdminAuth({ redirectTo = null, requireAdmin = false } = {}) {
  const router = useRouter();
  const user = useAuthStore(selectAuthUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  /** ADMIN o ENCARGADO (VENDEDOR no entra al panel). */
  const isAdmin = useAuthStore(selectCanAccessAdminPanel);
  const logout = useAuthStore((s) => s.logout);
  const loading = useAuthStore(selectAuthLoading);
  const isSessionLoaded = useAuthStore(selectIsSessionLoaded);

  useEffect(() => {
    if (loading) return;
    if (redirectTo && !isAuthenticated) {
      router.replace(redirectTo);
    }
    if (requireAdmin && isAuthenticated && !isAdmin) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, isAdmin, redirectTo, requireAdmin, router]);

  return { user, isAuthenticated, isAdmin, logout, loading, isSessionLoaded };
}
