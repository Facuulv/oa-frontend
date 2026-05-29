"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import ConfiguracionCard from "./ConfiguracionCard";
import ConfiguracionToggle from "./ConfiguracionToggle";
import {
  DIAS_SEMANA,
  isHorarioNocturno,
  timeToApiValue,
  validateDiaHorario,
} from "@/lib/configuracionUtils";

export default function HorariosCard({
  horariosPorDia,
  savingDia,
  onUpdateDiaLocal,
  onSaveDia,
}) {
  const [errors, setErrors] = useState({});

  const handleSave = async (diaId) => {
    const dia = horariosPorDia[diaId];
    const validation = validateDiaHorario({
      ...dia,
      hora_apertura: timeToApiValue(dia.hora_apertura),
      hora_cierre: timeToApiValue(dia.hora_cierre),
    });
    if (!validation.ok) {
      setErrors((prev) => ({ ...prev, [diaId]: validation.error }));
      return;
    }
    setErrors((prev) => ({ ...prev, [diaId]: "" }));
    const payload = dia.activo
      ? {
          activo: true,
          hora_apertura: validation.apertura,
          hora_cierre: validation.cierre,
        }
      : { activo: false, hora_apertura: dia.hora_apertura, hora_cierre: dia.hora_cierre };
    await onSaveDia(diaId, payload);
  };

  return (
    <ConfiguracionCard
      title="Horarios de atención"
      description="Una franja por día. Si el cierre es menor que la apertura, se interpreta como horario nocturno (cierra al día siguiente)."
    >
      <ul className="space-y-3">
        {DIAS_SEMANA.map(({ id, label }) => {
          const dia = horariosPorDia[id];
          const isSaving = savingDia === id;
          const err = errors[id];
          const nocturno =
            dia.activo && isHorarioNocturno(dia.hora_apertura, dia.hora_cierre);

          return (
            <li
              key={id}
              className="rounded-xl border border-zinc-100 bg-zinc-50/40 p-3 sm:p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                <div className="flex min-w-0 shrink-0 items-center justify-between gap-3 lg:w-44 lg:justify-start">
                  <p className="text-sm font-semibold text-zinc-900">{label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {dia.activo ? "Abierto" : "Cerrado"}
                    </span>
                    <ConfiguracionToggle
                      id={`dia-${id}-activo`}
                      label={`${label} abierto`}
                      checked={dia.activo}
                      onChange={(checked) => onUpdateDiaLocal(id, { activo: checked })}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                {dia.activo ? (
                  <div className="flex flex-nowrap items-end gap-2 sm:gap-3 lg:min-w-0 lg:flex-1">
                    <label className="flex shrink-0 flex-col gap-1 text-xs text-zinc-500">
                      Apertura
                      <input
                        type="time"
                        value={dia.hora_apertura}
                        onChange={(e) =>
                          onUpdateDiaLocal(id, { hora_apertura: e.target.value })
                        }
                        disabled={isSaving}
                        className="min-h-10 w-[7.25rem] rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900"
                      />
                    </label>
                    <label className="flex shrink-0 flex-col gap-1 text-xs text-zinc-500">
                      Cierre
                      <input
                        type="time"
                        value={dia.hora_cierre}
                        onChange={(e) =>
                          onUpdateDiaLocal(id, { hora_cierre: e.target.value })
                        }
                        disabled={isSaving}
                        className="min-h-10 w-[7.25rem] rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="hidden lg:block lg:min-w-0 lg:flex-1" aria-hidden />
                )}

                <button
                  type="button"
                  onClick={() => handleSave(id)}
                  disabled={isSaving}
                  className="admin-pressable inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-end rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 disabled:opacity-50 lg:self-center"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
                  Guardar
                </button>
              </div>

              {nocturno ? (
                <p className="mt-2 text-xs leading-snug text-amber-800 lg:mt-1.5 lg:pl-44">
                  Horario nocturno: cierra al día siguiente.
                </p>
              ) : null}

              {err ? <p className="mt-2 text-xs text-red-600 lg:pl-44">{err}</p> : null}
            </li>
          );
        })}
      </ul>
    </ConfiguracionCard>
  );
}
