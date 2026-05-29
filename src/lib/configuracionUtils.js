export const DIAS_SEMANA = [
  { id: 0, label: "Domingo" },
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
];

export function parseConfigBoolean(value, defaultValue = false) {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "si", "sí", "on", "yes"].includes(normalized)) return true;
  if (["0", "false", "no", "off", ""].includes(normalized)) return false;
  return defaultValue;
}

/** "11:00:00" → "11:00" para input type="time" */
export function timeToInputValue(timeValue) {
  const text = String(timeValue ?? "").trim();
  const match = text.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

/** input "11:00" → "11:00" para API */
export function timeToApiValue(inputValue) {
  const text = String(inputValue ?? "").trim();
  if (!text) return "";
  const match = text.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

/**
 * @param {Array<{ dia_semana: number, hora_apertura?: string, hora_cierre?: string, activo?: number|boolean }>} horariosRows
 */
export function buildHorariosPorDia(horariosRows = []) {
  const byDay = Object.fromEntries(DIAS_SEMANA.map((d) => [d.id, defaultDiaHorario()]));

  for (const row of horariosRows) {
    const day = Number(row.dia_semana);
    if (!Number.isInteger(day) || day < 0 || day > 6) continue;
    const activo = row.activo === true || row.activo === 1;
    if (!activo) continue;
    const current = byDay[day];
    if (current.activo && current.hora_apertura) continue;
    byDay[day] = {
      activo: true,
      hora_apertura: timeToInputValue(row.hora_apertura) || "11:00",
      hora_cierre: timeToInputValue(row.hora_cierre) || "23:00",
    };
  }

  return byDay;
}

export function defaultDiaHorario() {
  return {
    activo: false,
    hora_apertura: "11:00",
    hora_cierre: "23:00",
  };
}

/** true si el cierre es al día siguiente (ej. 20:00 → 02:30) */
export function isHorarioNocturno(horaApertura, horaCierre) {
  const apertura = timeToApiValue(horaApertura);
  const cierre = timeToApiValue(horaCierre);
  if (!apertura || !cierre) return false;
  return cierre < apertura;
}

export function validateDiaHorario(dia) {
  if (!dia.activo) return { ok: true };
  const apertura = timeToApiValue(dia.hora_apertura);
  const cierre = timeToApiValue(dia.hora_cierre);
  if (!apertura || !cierre) {
    return { ok: false, error: "Indicá hora de apertura y cierre." };
  }
  if (apertura === cierre) {
    return { ok: false, error: "La apertura y el cierre no pueden ser iguales." };
  }
  return {
    ok: true,
    apertura,
    cierre,
    nocturno: cierre < apertura,
  };
}

export function validateWhatsappNumero(numero) {
  const digits = String(numero ?? "").replace(/\D/g, "");
  if (!digits) return { ok: false, error: "El número es obligatorio." };
  if (!/^549\d{8,10}$/.test(digits)) {
    return {
      ok: false,
      error: "Usá solo dígitos con formato 549351XXXXXXX (código país 54 + 9 + área + número).",
    };
  }
  return { ok: true, value: digits };
}

export function buildWhatsappPreviewUrl(digits) {
  const n = String(digits ?? "").replace(/\D/g, "");
  if (!n) return null;
  return `https://wa.me/${n}`;
}
