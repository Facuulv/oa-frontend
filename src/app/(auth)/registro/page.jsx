"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/utils/api/apiError";
import { toast } from "@/lib/toast";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { validateDni, validateEmail, validateLastName, validateName } from "@/lib/validations";
import { CLIENTE_ERROR_CODES } from "@/services/clientesService";
import AuthHero from "@/components/auth/AuthHero";
import AuthCard from "@/components/auth/AuthCard";
import {
  authInputClass,
  authLabelClass,
  authLinkClass,
  authPrimaryButtonClass,
} from "@/components/auth/authForm";

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [form, setForm] = useState({ nombre: "", apellido: "", dni: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);

  const nextPath = useMemo(() => {
    const raw = searchParams.get("next");
    if (!raw || !raw.startsWith("/")) return null;
    if (raw.startsWith("//")) return null;
    return raw;
  }, [searchParams]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const err = {};
    const nameValidation = validateName(form.nombre);
    const lastNameValidation = validateLastName(form.apellido);
    const dniValidation = validateDni(form.dni, { required: true });
    const emailValidation = validateEmail(form.email, { required: true });
    if (!nameValidation.valid) err.nombre = nameValidation.message;
    if (!lastNameValidation.valid) err.apellido = lastNameValidation.message;
    if (!dniValidation.valid) err.dni = dniValidation.message;
    if (!emailValidation.valid) err.email = emailValidation.message;
    if (!form.password) err.password = "Ingresá una contraseña";
    else if (form.password.length < 6) err.password = "Mínimo 6 caracteres";
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
      await register(
        {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          dni: form.dni.trim(),
          email: form.email.trim(),
          password: form.password,
        },
        { autoLogin },
      );
      toast.success(autoLogin ? "Cuenta lista" : "Cuenta creada");
      const authed = useAuthStore.getState().isAuthenticated;
      if (!authed) {
        const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";
        router.replace(loginHref);
        return;
      }
      router.replace(nextPath || "/");
    } catch (err) {
      if (err instanceof ApiError) {
        if (Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors((prev) => ({ ...prev, ...err.fieldErrors }));
        }
        if (err.code === CLIENTE_ERROR_CODES.DNI_EXISTS) {
          setFieldErrors((prev) => ({
            ...prev,
            dni: err.message || "Este DNI ya está registrado",
          }));
        }
      }
      toast.error(err.message);
    }
  };

  return (
    <div className="w-full">
      <AuthHero showBebidas={false} />

      <AuthCard softTopGlow>
        <p className="mb-4 text-center text-sm font-medium text-zinc-600">
          Completá tus datos para crear tu cuenta
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4" noValidate>
          <div>
            <label htmlFor="registro-nombre" className={authLabelClass}>
              Nombre
            </label>
            <input
              id="registro-nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
              autoComplete="given-name"
              className={authInputClass(fieldErrors.nombre)}
              placeholder="Tu nombre"
            />
            {fieldErrors.nombre && <p className="mt-1 text-xs text-red-600">{fieldErrors.nombre}</p>}
          </div>

          <div>
            <label htmlFor="registro-apellido" className={authLabelClass}>
              Apellido
            </label>
            <input
              id="registro-apellido"
              type="text"
              value={form.apellido}
              onChange={(e) => updateField("apellido", e.target.value)}
              autoComplete="family-name"
              className={authInputClass(fieldErrors.apellido)}
              placeholder="Tu apellido"
            />
            {fieldErrors.apellido && <p className="mt-1 text-xs text-red-600">{fieldErrors.apellido}</p>}
          </div>

          <div>
            <label htmlFor="registro-dni" className={authLabelClass}>
              DNI
            </label>
            <input
              id="registro-dni"
              type="text"
              inputMode="numeric"
              value={form.dni}
              onChange={(e) => updateField("dni", e.target.value)}
              autoComplete="off"
              className={authInputClass(fieldErrors.dni)}
              placeholder="Sin puntos ni espacios"
            />
            {fieldErrors.dni && <p className="mt-1 text-xs text-red-600">{fieldErrors.dni}</p>}
          </div>

          <div>
            <label htmlFor="registro-email" className={authLabelClass}>
              Email
            </label>
            <input
              id="registro-email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              autoComplete="email"
              className={authInputClass(fieldErrors.email)}
              placeholder="tu@email.com"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="registro-password" className={authLabelClass}>
              Contraseña
            </label>
            <div className="relative">
              <input
                id="registro-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                autoComplete="new-password"
                className={cn(authInputClass(fieldErrors.password), "pr-11")}
                placeholder="Mínimo 6 caracteres"
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
            {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={autoLogin}
              onChange={(e) => setAutoLogin(e.target.checked)}
              className="rounded border-zinc-300 text-primary focus:ring-primary"
            />
            Iniciar sesión automáticamente
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(authPrimaryButtonClass, "mt-5 sm:mt-6")}
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500 sm:mt-5">
          ¿Ya tenés cuenta?{" "}
          <Link
            href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}
            className={authLinkClass}
          >
            Iniciá sesión
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}

function RegistroFallback() {
  return (
    <div className="w-full">
      <header className="mb-4 flex flex-col items-center sm:mb-5">
        <div className="h-11 w-28 animate-pulse rounded-sm bg-zinc-200/70 sm:h-12 sm:w-32 lg:h-14 lg:w-36" />
        <div className="mt-2 h-5 w-40 animate-pulse rounded-sm bg-zinc-200/60" />
        <div className="mt-1 h-4 w-52 max-w-[18rem] animate-pulse rounded-sm bg-zinc-200/50" />
      </header>
      <div className="rounded-[1.25rem] border border-black/[0.06] border-t-primary/[0.08] bg-white px-5 py-8 text-center text-sm text-zinc-500 shadow-lg ring-1 ring-primary/5">
        Cargando…
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<RegistroFallback />}>
      <RegistroForm />
    </Suspense>
  );
}
