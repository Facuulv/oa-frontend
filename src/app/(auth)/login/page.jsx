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
import { cn } from "@/lib/cn";
import AuthHero from "@/components/auth/AuthHero";
import AuthCard from "@/components/auth/AuthCard";
import {
  authInputClass,
  authLabelClass,
  authLinkClass,
  authPrimaryButtonClass,
} from "@/components/auth/authForm";

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
    <div className="w-full">
      <AuthHero />

      <AuthCard>
        <p className="mb-4 text-center text-sm font-medium text-zinc-600">
          Iniciá sesión con tu email
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className={authLabelClass}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              autoComplete="email"
              className={authInputClass(fieldErrors.email)}
              placeholder="tu@email.com"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="login-password" className={authLabelClass}>
              Contraseña
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                }}
                autoComplete="current-password"
                className={cn(authInputClass(fieldErrors.password), "pr-11")}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <Eye className="h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
            <div className="mt-2 text-right">
              <Link href="/auth/forgot-password" className={authLinkClass}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(authPrimaryButtonClass, "mt-5 sm:mt-6")}
          >
            {isLoading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500 sm:mt-5">
          ¿No tenés cuenta?{" "}
          <Link
            href={nextPath ? `/registro?next=${encodeURIComponent(nextPath)}` : "/registro"}
            className={authLinkClass}
          >
            Registrate
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="w-full">
      <header className="mb-4 flex flex-col items-center sm:mb-5">
        <div className="inline-flex items-center gap-2 sm:gap-2.5">
          <div className="h-10 w-24 translate-y-px animate-pulse rounded-sm bg-zinc-200/70 sm:h-11 sm:w-[7rem] sm:translate-y-[2px]" />
          <div className="h-7 w-[4.5rem] animate-pulse rounded-sm bg-zinc-200/70 sm:h-8 sm:w-20" />
        </div>
        <div className="mt-2 h-5 w-40 animate-pulse rounded-sm bg-zinc-200/60" />
      </header>
      <div className="rounded-[1.25rem] border border-black/[0.06] bg-white px-5 py-8 text-center text-sm text-zinc-500 shadow-lg">
        Cargando…
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
