"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppViewport from "@/components/layout/AppViewport";

/**
 * Compatibilidad: `/admin/login` redirige al login unificado.
 */
function RedirectToLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get("next");
    const next =
      raw && raw.startsWith("/") && !raw.startsWith("//") && raw.startsWith("/admin") ? raw : "/admin";
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [router, searchParams]);

  return (
    <p className="text-center text-sm text-gray-500" role="status">
      Redirigiendo al inicio de sesión…
    </p>
  );
}

export default function AdminLoginRedirectPage() {
  return (
    <AppViewport innerClassName="flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-surface px-4 ring-1 ring-black/5">
      <Suspense
        fallback={<p className="text-sm text-gray-500">Cargando…</p>}
      >
        <RedirectToLogin />
      </Suspense>
    </AppViewport>
  );
}
