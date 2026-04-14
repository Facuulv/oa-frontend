"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, selectIsAuthenticated, selectUser, selectIsAdmin } from "@/store/useAuthStore";

export function useAuth({ redirectTo = null, requireAdmin = false } = {}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectUser);
  const isAdmin = useAuthStore(selectIsAdmin);
  const logout = useAuthStore((s) => s.logout);

  const [authReady, setAuthReady] = useState(() =>
    typeof window !== "undefined" ? useAuthStore.persist.hasHydrated() : false
  );

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setAuthReady(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setAuthReady(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (redirectTo && !isAuthenticated) {
      router.replace(redirectTo);
    }
    if (requireAdmin && isAuthenticated && !isAdmin) {
      router.replace("/");
    }
  }, [authReady, isAuthenticated, isAdmin, redirectTo, requireAdmin, router]);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, [logout]);

  return { user, isAuthenticated, isAdmin, logout, authReady };
}
