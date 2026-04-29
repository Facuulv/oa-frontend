"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

let hasRedirectedForUnauthorized = false;

function shouldRedirectToLogin(pathname) {
  if (!pathname) return false;
  if (!pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/admin/login")) return false;
  if (pathname.startsWith("/login")) return false;
  return true;
}

/**
 * Restaura sesión con `GET /auth/me` (cookie admin o cliente).
 */
export default function AuthSessionProvider({ children }) {
  useEffect(() => {
    void useAuthStore.getState().validateSession();
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      useAuthStore.getState().onUnauthorized();

      if (typeof window === "undefined") return;
      if (hasRedirectedForUnauthorized) return;
      if (!shouldRedirectToLogin(window.location.pathname)) return;

      hasRedirectedForUnauthorized = true;
      const next = window.location.pathname + window.location.search;
      window.location.replace(`/login?next=${encodeURIComponent(next || "/admin")}`);

      window.setTimeout(() => {
        hasRedirectedForUnauthorized = false;
      }, 250);
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", onUnauthorized);
    };
  }, []);

  return children;
}
