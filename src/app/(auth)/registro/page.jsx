"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/utils/api/apiError";
import { toast } from "@/lib/toast";
import { validateEmail, validateLastName, validateName } from "@/lib/validations";

export default function RegistroPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [autoLogin, setAutoLogin] = useState(true);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const err = {};
    const nameValidation = validateName(form.nombre);
    const lastNameValidation = validateLastName(form.apellido);
    const emailValidation = validateEmail(form.email, { required: true });
    if (!nameValidation.valid) err.nombre = nameValidation.message;
    if (!lastNameValidation.valid) err.apellido = lastNameValidation.message;
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
          email: form.email.trim(),
          password: form.password,
        },
        { autoLogin }
      );
      toast.success(autoLogin ? "Cuenta lista" : "Cuenta creada");
      const authed = useAuthStore.getState().isAuthenticated;
      if (!authed) {
        router.replace("/login");
        return;
      }
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...err.fieldErrors }));
      }
      toast.error(err.message);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary">OA!</h1>
        <p className="mt-1 text-sm text-gray-500">Creá tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
            autoComplete="given-name"
            className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
              fieldErrors.nombre ? "border-red-400" : "border-gray-200 focus:border-primary"
            }`}
            placeholder="Tu nombre"
          />
          {fieldErrors.nombre && <p className="mt-1 text-xs text-red-600">{fieldErrors.nombre}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Apellido</label>
          <input
            type="text"
            value={form.apellido}
            onChange={(e) => updateField("apellido", e.target.value)}
            autoComplete="family-name"
            className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
              fieldErrors.apellido ? "border-red-400" : "border-gray-200 focus:border-primary"
            }`}
            placeholder="Tu apellido"
          />
          {fieldErrors.apellido && <p className="mt-1 text-xs text-red-600">{fieldErrors.apellido}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
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
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            autoComplete="new-password"
            className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
              fieldErrors.password ? "border-red-400" : "border-gray-200 focus:border-primary"
            }`}
            placeholder="Mínimo 6 caracteres"
          />
          {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={autoLogin}
            onChange={(e) => setAutoLogin(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          Iniciar sesión automáticamente
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
