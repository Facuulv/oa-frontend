"use client";

const inputBase =
  "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400";

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
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
    `${inputBase} ${
      fieldErrors[field] ? "border-red-400" : "border-gray-200 focus:border-primary"
    }`;

  return (
    <form
      className="space-y-4 rounded-xl bg-white p-4 shadow-sm"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
    >
      <h2 className="text-sm font-semibold text-gray-800">Datos personales</h2>

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

      <Field label="Email" hint="No editable por ahora">
        <input
          type="email"
          value={form.email}
          disabled
          className={`${inputBase} cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500`}
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

      <Field label="Fecha de nacimiento" error={fieldErrors.fecha_nacimiento}>
        <input
          type="date"
          value={form.fecha_nacimiento}
          onChange={(e) => onUpdateField("fecha_nacimiento", e.target.value)}
          autoComplete="bday"
          className={inputClass("fecha_nacimiento")}
        />
      </Field>

      <button
        type="submit"
        disabled={!isDirty || saving}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
