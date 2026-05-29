"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ConfiguracionCard from "./ConfiguracionCard";

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function validateEmailForm({ nombre, asunto, textoIntro }) {
  const n = stripHtml(nombre);
  const a = stripHtml(asunto);
  if (!n) return { ok: false, error: "El nombre visible es obligatorio." };
  if (n.length > 100) return { ok: false, error: "El nombre no puede superar 100 caracteres." };
  if (!a) return { ok: false, error: "El asunto es obligatorio." };
  if (a.length > 200) return { ok: false, error: "El asunto no puede superar 200 caracteres." };
  const intro = stripHtml(textoIntro);
  if (intro.length > 2000) {
    return { ok: false, error: "El texto introductorio no puede superar 2000 caracteres." };
  }
  return { ok: true, nombre: n, asunto: a, textoIntro: intro };
}

export default function EmailRecuperacionCard({
  emailRecuperacion,
  saving,
  onSave,
}) {
  const [nombre, setNombre] = useState(emailRecuperacion?.nombre ?? "");
  const [asunto, setAsunto] = useState(emailRecuperacion?.asunto ?? "");
  const [textoIntro, setTextoIntro] = useState(emailRecuperacion?.textoIntro ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setNombre(emailRecuperacion?.nombre ?? "");
    setAsunto(emailRecuperacion?.asunto ?? "");
    setTextoIntro(emailRecuperacion?.textoIntro ?? "");
  }, [emailRecuperacion]);

  const dirty =
    stripHtml(nombre) !== stripHtml(emailRecuperacion?.nombre ?? "") ||
    stripHtml(asunto) !== stripHtml(emailRecuperacion?.asunto ?? "") ||
    stripHtml(textoIntro) !== stripHtml(emailRecuperacion?.textoIntro ?? "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateEmailForm({ nombre, asunto, textoIntro });
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError("");
    await onSave({
      nombre: validation.nombre,
      asunto: validation.asunto,
      textoIntro: validation.textoIntro,
    });
  };

  return (
    <ConfiguracionCard
      title="Recuperación de contraseña"
      description="Contenido del correo que reciben los clientes al solicitar restablecer su contraseña."
    >
      <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2.5 text-xs leading-relaxed text-sky-950">
        Las credenciales reales de envío se configuran en el servidor mediante variables de
        entorno. Desde este panel solo se modifica el nombre visible, asunto y texto del correo.
      </div>

      {emailRecuperacion?.smtpFromActual ? (
        <p className="mb-4 text-xs text-zinc-600">
          Remitente técnico actual:{" "}
          <span className="font-mono font-medium text-zinc-800">
            {emailRecuperacion.smtpFromActual}
          </span>
        </p>
      ) : (
        <p className="mb-4 text-xs text-amber-800">
          No hay remitente técnico configurado en el servidor (SMTP_FROM).
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email-nombre" className="mb-1 block text-sm font-medium text-zinc-800">
            Nombre visible del remitente
          </label>
          <input
            id="email-nombre"
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setError("");
            }}
            disabled={saving}
            maxLength={100}
            className="w-full min-h-11 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="email-asunto" className="mb-1 block text-sm font-medium text-zinc-800">
            Asunto del correo
          </label>
          <input
            id="email-asunto"
            type="text"
            value={asunto}
            onChange={(e) => {
              setAsunto(e.target.value);
              setError("");
            }}
            disabled={saving}
            maxLength={200}
            className="w-full min-h-11 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="email-intro" className="mb-1 block text-sm font-medium text-zinc-800">
            Texto introductorio{" "}
            <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <textarea
            id="email-intro"
            value={textoIntro}
            onChange={(e) => {
              setTextoIntro(e.target.value);
              setError("");
            }}
            disabled={saving}
            maxLength={2000}
            rows={4}
            className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Aparece antes del enlace de restablecimiento. No uses HTML.
          </p>
        </div>

        {error ? <p className="text-xs text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={saving || !dirty}
          className="admin-pressable inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
          Guardar email de recuperación
        </button>
      </form>
    </ConfiguracionCard>
  );
}
