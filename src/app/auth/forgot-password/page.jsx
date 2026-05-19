"use client";

import { useState } from "react";
import Link from "next/link";
import { authForgotPassword } from "@/services/authSessionService";
import { validateEmail } from "@/lib/validations";
import { toast } from "@/lib/toast";
import AuthHero from "@/components/auth/AuthHero";
import AuthCard from "@/components/auth/AuthCard";
import {
  authInputClass,
  authLabelClass,
  authLinkClass,
  authPrimaryButtonClass,
} from "@/components/auth/authForm";

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
    <div className="w-full">
      <AuthHero
        tagline="Recuperá tu contraseña"
        subtext="Te enviaremos un enlace a tu email para restablecer el acceso"
      />

      <AuthCard>
        <p className="mb-4 text-center text-sm font-medium text-zinc-600">
          Ingresá el email de tu cuenta
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4" noValidate>
          <div>
            <label htmlFor="forgot-email" className={authLabelClass}>
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldError) setFieldError("");
                if (formError) setFormError("");
              }}
              autoComplete="email"
              className={authInputClass(fieldError)}
              placeholder="tu@email.com"
            />
            {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
          </div>

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className={authPrimaryButtonClass}>
            {isSubmitting ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500 sm:mt-5">
          <Link href="/login" className={authLinkClass}>
            Volver a iniciar sesión
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
