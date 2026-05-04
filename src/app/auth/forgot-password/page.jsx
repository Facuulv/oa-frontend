"use client";

import { useState } from "react";
import Link from "next/link";
import { authForgotPassword } from "@/services/authSessionService";
import { validateEmail } from "@/lib/validations";
import { toast } from "@/lib/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const validateForm = () => {
    const validation = validateEmail(email, { required: true });
    if (!validation.valid) {
      setFieldError(validation.message);
      return false;
    }
    setFieldError("");
    return true;
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
      const data = await authForgotPassword({ email: email.trim() });
      const message =
        data?.message || "Si el correo existe, enviaremos un enlace para restablecer tu contraseña.";
      setSuccessMessage(message);
    } catch (error) {
      const message = error?.message || "No pudimos procesar tu solicitud";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-gray-500">Ingresá tu email y te enviamos un enlace.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldError) setFieldError("");
              if (formError) setFormError("");
            }}
            autoComplete="email"
            className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
              fieldError ? "border-red-400" : "border-gray-200 focus:border-primary"
            }`}
            placeholder="tu@email.com"
          />
          {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
        </div>

        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>
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
          {isSubmitting ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
