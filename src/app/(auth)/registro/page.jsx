"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/utils/api/apiError";
import { toast } from "@/lib/toast";
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
      <AuthHero tagline="Creá tu cuenta" subtext="Completá tus datos para empezar a pedir" />

      <AuthCard>
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
            <input
              id="registro-password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              autoComplete="new-password"
              className={authInputClass(fieldErrors.password)}
              placeholder="Mínimo 6 caracteres"
            />
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

          <button type="submit" disabled={isLoading} className={authPrimaryButtonClass}>
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
        <div className="inline-flex items-center gap-2 sm:gap-2.5">
          <div className="h-10 w-24 translate-y-px animate-pulse rounded-sm bg-zinc-200/70 sm:h-11 sm:w-[7rem] sm:translate-y-[2px]" />
          <div className="h-7 w-[4.5rem] animate-pulse rounded-sm bg-zinc-200/70 sm:h-8 sm:w-20" />
        </div>
        <div className="mt-2 h-5 w-36 animate-pulse rounded-sm bg-zinc-200/60" />
      </header>
      <div className="rounded-[1.25rem] border border-black/[0.06] bg-white px-5 py-8 text-center text-sm text-zinc-500 shadow-lg">
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
