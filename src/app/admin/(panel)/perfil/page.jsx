"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Save, UserRound } from "lucide-react";
import { useAdminProfile } from "@/hooks/admin/useAdminProfile";
import { useAuthStore, selectAuthUser } from "@/store/useAuthStore";

const ROLE_LABEL = {
  ADMIN: "Administrador",
  ENCARGADO: "Encargado",
  VENDEDOR: "Vendedor",
};

const fieldBase =
  "min-h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-zinc-900 outline-none ring-primary transition-colors placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60";
const fieldOk = "border-zinc-300 focus-visible:border-primary/40";
const fieldErr = "border-red-400 focus-visible:border-red-400";

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  show,
  onToggleShow,
  autoComplete,
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-zinc-800" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldBase} pr-11 ${error ? fieldErr : fieldOk}`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 outline-none ring-primary transition hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <Eye className="h-4 w-4 shrink-0" aria-hidden /> : <EyeOff className="h-4 w-4 shrink-0" aria-hidden />}
        </button>
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

export default function AdminPerfilPage() {
  const authUser = useAuthStore(selectAuthUser);
  const {
    loading,
    profile,
    form,
    fieldErrors,
    savingProfile,
    isProfileDirty,
    updateField,
    submitProfile,
    passwordForm,
    passwordErrors,
    savingPassword,
    updatePasswordField,
    submitPassword,
  } = useAdminProfile();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const displayUser = profile ?? authUser;
  const roleLabel = ROLE_LABEL[displayUser?.rol] ?? displayUser?.rol ?? "—";

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <p>Cargando tu perfil…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <header className="admin-quick-card-enter flex items-center gap-3">
        <Link
          href="/admin"
          className="admin-pressable inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 active:bg-zinc-100"
          aria-label="Volver al panel"
        >
          <ArrowLeft size={18} strokeWidth={2.25} aria-hidden />
        </Link>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold tracking-tight text-zinc-900">Mi perfil</h2>
          <p className="mt-0.5 text-xs font-medium text-zinc-500">
            Administrá tus datos de cuenta y contraseña.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-200/50 xl:col-span-1">
          <h3 className="text-base font-semibold text-zinc-900">Resumen</h3>
          <p className="mt-1 text-sm text-zinc-500">Vista rápida de tu cuenta</p>
          <div className="mt-5 flex flex-col items-center gap-3 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary ring-2 ring-primary/15">
              {[form.nombre, form.apellido]
                .filter(Boolean)
                .join(" ")
                .split(/\s+/)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase() ?? "")
                .join("") || "A"}
            </span>
            <div>
              <p className="text-base font-semibold text-zinc-900">
                {[form.nombre, form.apellido].filter(Boolean).join(" ").trim() || "—"}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{form.email || "—"}</p>
              <p className="mt-1 text-xs font-medium text-primary">{roleLabel}</p>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4 xl:col-span-2">
          <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-200/50">
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" aria-hidden />
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Datos personales</h3>
                <p className="text-sm text-zinc-500">Actualizá la información de tu cuenta.</p>
              </div>
            </div>

            <form
              className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                void submitProfile();
              }}
            >
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-zinc-800" htmlFor="pf-nombre">
                  Nombre <span className="text-red-600">*</span>
                </label>
                <input
                  id="pf-nombre"
                  autoComplete="given-name"
                  value={form.nombre}
                  onChange={(e) => updateField("nombre", e.target.value)}
                  disabled={savingProfile}
                  className={`${fieldBase} ${fieldErrors.nombre ? fieldErr : fieldOk}`}
                />
                {fieldErrors.nombre ? (
                  <p className="text-xs font-medium text-red-600">{fieldErrors.nombre}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-zinc-800" htmlFor="pf-apellido">
                  Apellido <span className="text-red-600">*</span>
                </label>
                <input
                  id="pf-apellido"
                  autoComplete="family-name"
                  value={form.apellido}
                  onChange={(e) => updateField("apellido", e.target.value)}
                  disabled={savingProfile}
                  className={`${fieldBase} ${fieldErrors.apellido ? fieldErr : fieldOk}`}
                />
                {fieldErrors.apellido ? (
                  <p className="text-xs font-medium text-red-600">{fieldErrors.apellido}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-zinc-800" htmlFor="pf-dni">
                  DNI
                </label>
                <input
                  id="pf-dni"
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.dni}
                  onChange={(e) => updateField("dni", e.target.value)}
                  disabled={savingProfile}
                  className={`${fieldBase} ${fieldErrors.dni ? fieldErr : fieldOk}`}
                />
                {fieldErrors.dni ? (
                  <p className="text-xs font-medium text-red-600">{fieldErrors.dni}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-zinc-800" htmlFor="pf-email">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  id="pf-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  disabled={savingProfile}
                  className={`${fieldBase} ${fieldErrors.email ? fieldErr : fieldOk}`}
                />
                {fieldErrors.email ? (
                  <p className="text-xs font-medium text-red-600">{fieldErrors.email}</p>
                ) : null}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-sm font-semibold text-zinc-800" htmlFor="pf-tel">
                  Teléfono
                </label>
                <input
                  id="pf-tel"
                  type="tel"
                  autoComplete="tel"
                  value={form.telefono}
                  onChange={(e) => updateField("telefono", e.target.value)}
                  disabled={savingProfile}
                  className={`${fieldBase} ${fieldErrors.telefono ? fieldErr : fieldOk}`}
                />
                {fieldErrors.telefono ? (
                  <p className="text-xs font-medium text-red-600">{fieldErrors.telefono}</p>
                ) : null}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-sm font-semibold text-zinc-800" htmlFor="pf-rol">
                  Rol
                </label>
                <input
                  id="pf-rol"
                  value={roleLabel}
                  readOnly
                  disabled
                  className={`${fieldBase} border-zinc-200 bg-zinc-50 text-zinc-600`}
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile || !isProfileDirty}
                  className="admin-pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm enabled:hover:brightness-105 disabled:opacity-50"
                >
                  {savingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden />
                  )}
                  Guardar cambios
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-200/50">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" aria-hidden />
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Contraseña</h3>
                <p className="text-sm text-zinc-500">
                  Ingresá tu contraseña actual para definir una nueva.
                </p>
              </div>
            </div>

            <form
              className="mt-5 flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                void submitPassword();
              }}
            >
              <PasswordField
                id="pf-pass-current"
                label="Contraseña actual"
                value={passwordForm.currentPassword}
                onChange={(v) => updatePasswordField("currentPassword", v)}
                error={passwordErrors.currentPassword}
                show={showCurrentPassword}
                onToggleShow={() => setShowCurrentPassword((v) => !v)}
                autoComplete="current-password"
              />
              <PasswordField
                id="pf-pass-new"
                label="Nueva contraseña"
                value={passwordForm.newPassword}
                onChange={(v) => updatePasswordField("newPassword", v)}
                error={passwordErrors.newPassword}
                show={showNewPassword}
                onToggleShow={() => setShowNewPassword((v) => !v)}
                autoComplete="new-password"
              />
              <PasswordField
                id="pf-pass-confirm"
                label="Confirmar nueva contraseña"
                value={passwordForm.confirmPassword}
                onChange={(v) => updatePasswordField("confirmPassword", v)}
                error={passwordErrors.confirmPassword}
                show={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword((v) => !v)}
                autoComplete="new-password"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="admin-pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-800 shadow-sm enabled:hover:bg-zinc-50 disabled:opacity-50"
                >
                  {savingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <KeyRound className="h-4 w-4" aria-hidden />
                  )}
                  Actualizar contraseña
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
