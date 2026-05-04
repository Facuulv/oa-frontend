"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ApiError } from "@/utils/api/apiError";
import { authResetPassword } from "@/services/authSessionService";
import { toast } from "@/lib/toast";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => (searchParams.get("token") || "").trim(), [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!token) errors.token = "El enlace es inválido o está incompleto.";
    if (!password) errors.password = "Ingresá una nueva contraseña";
    else if (password.length < 8) errors.password = "La contraseña debe tener al menos 8 caracteres";
    if (!confirmPassword) errors.confirmPassword = "Confirmá tu nueva contraseña";
    else if (confirmPassword !== password) errors.confirmPassword = "Las contraseñas no coinciden";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!validateForm()) {
      toast.error("Revisá los campos marcados.");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await authResetPassword({ token, password });
      const message = data?.message || "Contraseña actualizada correctamente";
      setSuccessMessage(message);
      toast.success(message);
      setPassword("");
      setConfirmPassword("");
      setFieldErrors({});
    } catch (error) {
      let message = error?.message || "No pudimos restablecer tu contraseña";
      if (error instanceof ApiError && error.fieldErrors) {
        setFieldErrors((prev) => ({ ...prev, ...error.fieldErrors }));
      }
      if (error?.fieldErrors?.token) {
        message = error.fieldErrors.token;
      }
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTokenMissing = !token;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary">Restablecer contraseña</h1>
        <p className="mt-1 text-sm text-gray-500">Elegí una nueva contraseña para tu cuenta.</p>
      </div>

      {isTokenMissing ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            El enlace de recuperación no es válido.
          </div>
          <Link
            href="/auth/forgot-password"
            className="block w-full rounded-lg bg-primary py-2.5 text-center text-sm font-medium text-white transition hover:brightness-110"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                autoComplete="new-password"
                className={`w-full rounded-lg border py-2.5 pl-3 pr-11 text-sm outline-none transition ${
                  fieldErrors.password ? "border-red-400" : "border-gray-200 focus:border-primary"
                }`}
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                autoComplete="new-password"
                className={`w-full rounded-lg border py-2.5 pl-3 pr-11 text-sm outline-none transition ${
                  fieldErrors.confirmPassword ? "border-red-400" : "border-gray-200 focus:border-primary"
                }`}
                placeholder="Repetí tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 outline-none transition hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? (
                  <Eye className="h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {fieldErrors.token && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {fieldErrors.token}
            </div>
          )}

          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-lg">Cargando…</div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
