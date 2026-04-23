"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAuthStore,
  selectAuthUser,
  selectIsAdminUser,
  selectIsAuthenticated,
  selectAuthSessionGateReady,
} from "@/store/useAuthStore";

export function useAdminAuth({ redirectTo = null, requireAdmin = false } = {}) {
  const router = useRouter();
  const user = useAuthStore(selectAuthUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isAdmin = useAuthStore(selectIsAdminUser);
  const logout = useAuthStore((s) => s.logout);
  const authReady = useAuthStore(selectAuthSessionGateReady);

  useEffect(() => {
    if (!authReady) return;
    if (redirectTo && !isAuthenticated) {
      router.replace(redirectTo);
    }
    if (requireAdmin && isAuthenticated && !isAdmin) {
      router.replace("/");
    }
  }, [authReady, isAuthenticated, isAdmin, redirectTo, requireAdmin, router]);

  return { user, isAuthenticated, isAdmin, logout, authReady };
}
