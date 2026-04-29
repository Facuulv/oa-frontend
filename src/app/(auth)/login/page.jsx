"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  useAuthStore,
  selectAuthLoading,
  selectCanAccessAdminPanel,
  selectIsPanelStaffUser,
  selectIsClienteUser,
} from "@/store/useAuthStore";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/lib/toast";
import { validateEmail } from "@/lib/validations";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const authLoading = useAuthStore(selectAuthLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const nextPath = useMemo(() => {
    const raw = searchParams.get("next");
    if (!raw || !raw.startsWith("/")) return null;
    if (raw.startsWith("//")) return null;
    return raw;
  }, [searchParams]);

  useEffect(() => {
    if (authLoading) return;

    const state = useAuthStore.getState();
    if (!state.user) return;

    if (selectCanAccessAdminPanel(state)) {
      const dest = nextPath?.startsWith("/admin") ? nextPath : "/admin";
      router.replace(dest);
      return;
    }

    if (selectIsPanelStaffUser(state)) {
      router.replace("/");
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
  }, [authLoading, nextPath, router]);

  const validate = () => {
    const err = {};
    const emailValidation = validateEmail(email, { required: true });
    if (!emailValidation.valid) err.email = emailValidation.message;
    if (!password) err.password = "Ingresá tu contraseña";
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Revisá los campos marcados.");
      return;
    }
    try {
      await login({ email: email.trim(), password });
      const state = useAuthStore.getState();
      if (!state.isAuthenticated || !state.user) {
        toast.error("No pudimos iniciar sesión");
        return;
      }
      if (selectCanAccessAdminPanel(state)) {
        toast.success("Sesión iniciada");
        const dest = nextPath?.startsWith("/admin") ? nextPath : "/admin";
        router.replace(dest);
        return;
      }

      if (selectIsPanelStaffUser(state)) {
        toast.error("Tu rol no tiene acceso al panel de administración.");
        router.replace("/");
        return;
      }
      if (selectIsClienteUser(state)) {
        if (nextPath?.startsWith("/admin")) {
          toast.error("Esta cuenta no tiene acceso al panel de administración");
          router.replace("/");
          return;
        }
        toast.success("Sesión iniciada");
        router.replace(nextPath || "/");
        return;
      }
      toast.error("Respuesta de sesión no reconocida");
    } catch (err) {
      toast.error(err?.message || "No pudimos iniciar sesión");
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
            className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
              fieldErrors.email ? "border-red-400" : "border-gray-200 focus:border-primary"
            }`}
            placeholder="tu@email.com"
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              autoComplete="current-password"
              className={`w-full rounded-lg border py-2.5 pl-3 pr-11 text-sm outline-none transition ${
                fieldErrors.password ? "border-red-400" : "border-gray-200 focus:border-primary"
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 outline-none transition hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <Eye className="h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
              )}
            </button>
          </div>
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
