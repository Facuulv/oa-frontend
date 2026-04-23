"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  useAuthStore,
  selectAuthSessionGateReady,
  selectIsAdminUser,
  selectIsClienteUser,
} from "@/store/useAuthStore";
import { toast } from "sonner";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const sessionGateReady = useAuthStore(selectAuthSessionGateReady);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const nextPath = useMemo(() => {
    const raw = searchParams.get("next");
    if (!raw || !raw.startsWith("/")) return null;
    if (raw.startsWith("//")) return null;
    return raw;
  }, [searchParams]);

  useEffect(() => {
    if (!sessionGateReady) return;

    let cancelled = false;

    (async () => {
      await useAuthStore.getState().refreshProfile();
      if (cancelled) return;

      const state = useAuthStore.getState();
      if (!state.isAuthenticated || !state.user) return;

      if (selectIsAdminUser(state)) {
        const dest = nextPath?.startsWith("/admin") ? nextPath : "/admin";
        router.replace(dest);
        return;
      }

      if (selectIsClienteUser(state)) {
        if (nextPath?.startsWith("/admin")) {
          router.replace("/");
          return;
        }
        if (nextPath) {
          router.replace(nextPath);
          return;
        }
        router.replace("/");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionGateReady, nextPath, router]);

  const validate = () => {
    const err = {};
    if (!email.trim()) err.email = "Ingresá tu email";
    else if (!isValidEmail(email)) err.email = "Email no válido";
    if (!password) err.password = "Ingresá tu contraseña";
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login({ email: email.trim(), password });
      toast.success("Sesión iniciada");
      const state = useAuthStore.getState();
      if (!state.isAuthenticated || !state.user) {
        toast.error("No pudimos iniciar sesión");
        return;
      }
      if (selectIsAdminUser(state)) {
        const dest = nextPath?.startsWith("/admin") ? nextPath : "/admin";
        router.replace(dest);
        return;
      }
      if (selectIsClienteUser(state)) {
        if (nextPath?.startsWith("/admin")) {
          toast.error("Esta cuenta no tiene acceso al panel de administración");
          router.replace("/");
          return;
        }
        router.replace(nextPath || "/");
        return;
      }
      toast.error("Respuesta de sesión no reconocida");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary">OA!</h1>
        <p className="mt-1 text-sm text-gray-500">Iniciá sesión con tu email</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
            }}
            autoComplete="email"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary"
            placeholder="tu@email.com"
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
            }}
            autoComplete="current-password"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary"
            placeholder="••••••••"
          />
          {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {isLoading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="font-medium text-primary hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-lg">Cargando…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
