"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ConfiguracionCard from "./ConfiguracionCard";
import ConfiguracionToggle from "./ConfiguracionToggle";

function estadoBadgeClass(estado) {
  if (!estado) return "bg-zinc-100 text-zinc-700 ring-zinc-200";
  if (estado.bloqueado) return "bg-red-100 text-red-800 ring-red-200/80";
  if (estado.estaAbierto) return "bg-emerald-100 text-emerald-900 ring-emerald-200/80";
  return "bg-amber-100 text-amber-900 ring-amber-200/80";
}

function estadoBadgeLabel(estado) {
  if (!estado) return "Sin datos";
  if (estado.bloqueado) return "Carta deshabilitada";
  if (estado.estaAbierto) return "Abierto ahora";
  return "Cerrado ahora";
}

export default function CartaOnlineCard({
  cartaOnlineHabilitada,
  validarHorarios,
  estado,
  saving,
  onSave,
}) {
  const [cartaActiva, setCartaActiva] = useState(cartaOnlineHabilitada);
  const [validar, setValidar] = useState(validarHorarios);

  useEffect(() => {
    setCartaActiva(cartaOnlineHabilitada);
    setValidar(validarHorarios);
  }, [cartaOnlineHabilitada, validarHorarios]);

  const dirty =
    cartaActiva !== cartaOnlineHabilitada || validar !== validarHorarios;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({ cartaOnlineHabilitada: cartaActiva, validarHorarios: validar });
  };

  return (
    <ConfiguracionCard
      title="Carta online"
      description="Activá o desactivá la carta y la validación de horarios al crear pedidos."
    >
      <div
        className={`mb-4 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${estadoBadgeClass(estado)} ring-1`}
        role="status"
      >
        <span className="font-semibold">{estadoBadgeLabel(estado)}</span>
        {estado?.mensaje ? (
          <span className="text-zinc-600">· {estado.mensaje}</span>
        ) : null}
      </div>
      {estado?.nextOpeningText ? (
        <p className="mb-4 text-sm text-zinc-600">{estado.nextOpeningText}</p>
      ) : null}
      {estado?.timezone ? (
        <p className="mb-4 text-xs text-zinc-400">Zona horaria: {estado.timezone}</p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 px-3 py-3">
          <div>
            <p className="text-sm font-medium text-zinc-900">Carta online habilitada</p>
            <p className="text-xs text-zinc-500">Si está desactivada, no se aceptan pedidos.</p>
          </div>
          <ConfiguracionToggle
            id="carta-habilitada"
            label="Carta online habilitada"
            checked={cartaActiva}
            onChange={setCartaActiva}
            disabled={saving}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 px-3 py-3">
          <div>
            <p className="text-sm font-medium text-zinc-900">Validar horarios en pedidos</p>
            <p className="text-xs text-zinc-500">
              Rechaza pedidos fuera del horario de atención configurado.
            </p>
          </div>
          <ConfiguracionToggle
            id="validar-horarios"
            label="Validar horarios"
            checked={validar}
            onChange={setValidar}
            disabled={saving}
          />
        </div>

        <button
          type="submit"
          disabled={saving || !dirty}
          className="admin-pressable inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
          Guardar carta online
        </button>
      </form>
    </ConfiguracionCard>
  );
}
