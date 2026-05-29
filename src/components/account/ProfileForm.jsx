"use client";

import {
  ACCOUNT_CARD_CLASS,
  ACCOUNT_FORM_GRID_CLASS,
  PUBLIC_FORM_INPUT_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

function Field({ label, hint, error, children, className }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1 text-xs text-zinc-500">{hint}</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default function ProfileForm({
  form,
  fieldErrors,
  saving,
  isDirty,
  onUpdateField,
  onSubmit,
}) {
  const inputClass = (field) =>
    cn(
      PUBLIC_FORM_INPUT_CLASS,
      fieldErrors[field]
        ? "border-red-400 focus:border-red-400 focus:ring-red-200/50"
        : "",
    );

  const isDisabled = !isDirty || saving;

  return (
    <form
      className={cn(ACCOUNT_CARD_CLASS, "p-4 md:p-5")}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
    >
      <h2 className="home-section-header__accent mb-4 text-sm font-bold text-foreground md:text-base">
        Datos personales
      </h2>

      <div className={ACCOUNT_FORM_GRID_CLASS}>
        <Field label="Nombre" error={fieldErrors.nombre}>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => onUpdateField("nombre", e.target.value)}
            autoComplete="given-name"
            className={inputClass("nombre")}
          />
        </Field>

        <Field label="Apellido" error={fieldErrors.apellido}>
          <input
            type="text"
            value={form.apellido}
            onChange={(e) => onUpdateField("apellido", e.target.value)}
            autoComplete="family-name"
            className={inputClass("apellido")}
          />
        </Field>

        <Field label="DNI" error={fieldErrors.dni}>
          <input
            type="text"
            inputMode="numeric"
            value={form.dni}
            onChange={(e) => onUpdateField("dni", e.target.value)}
            autoComplete="off"
            className={inputClass("dni")}
          />
        </Field>

        <Field
          label="Teléfono"
          hint="Recomendado para pedidos"
          error={fieldErrors.telefono}
        >
          <input
            type="tel"
            inputMode="tel"
            value={form.telefono}
            onChange={(e) => onUpdateField("telefono", e.target.value)}
            autoComplete="tel"
            placeholder="Ej: 3515551234"
            className={inputClass("telefono")}
          />
        </Field>

        <Field
          label="Email"
          hint="No editable por ahora"
          className="md:col-span-2"
        >
          <input
            type="email"
            value={form.email}
            disabled
            className={cn(
              PUBLIC_FORM_INPUT_CLASS,
              "cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-500",
            )}
          />
        </Field>

        <Field label="Fecha de nacimiento" error={fieldErrors.fecha_nacimiento}>
          <input
            type="date"
            value={form.fecha_nacimiento}
            onChange={(e) => onUpdateField("fecha_nacimiento", e.target.value)}
            autoComplete="bday"
            className={inputClass("fecha_nacimiento")}
          />
        </Field>
      </div>

      <div className="mt-5 border-t border-zinc-100 pt-5">
        <button
          type="submit"
          disabled={isDisabled}
          aria-disabled={isDisabled || undefined}
          className={cn(
            PUBLIC_PRESSABLE_CLASS,
            "home-cta-primary-shadow inline-flex min-h-12 w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-white",
            "bg-gradient-to-br from-primary via-primary to-primary-dark",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "md:w-auto md:min-w-[12rem]",
            "disabled:cursor-not-allowed disabled:border disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none",
          )}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
