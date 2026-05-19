const safe = (v) => String(v ?? "").trim();

export function formatBirthDateForInput(value) {
  if (value == null || value === "") return "";
  const text = String(value);
  return text.length >= 10 ? text.slice(0, 10) : text;
}

export function buildProfileFormFromUser(user) {
  if (!user) {
    return {
      nombre: "",
      apellido: "",
      dni: "",
      email: "",
      telefono: "",
      fecha_nacimiento: "",
    };
  }
  return {
    nombre: safe(user.nombre ?? user.name),
    apellido: safe(user.apellido),
    dni: safe(user.dni),
    email: safe(user.email),
    telefono: safe(user.telefono),
    fecha_nacimiento: formatBirthDateForInput(user.fecha_nacimiento),
  };
}

/** Falta teléfono o fecha de nacimiento (recomendados para pedidos). */
export function isProfileIncomplete(user) {
  if (!user) return false;
  const telefono = safe(user.telefono);
  const fecha = formatBirthDateForInput(user.fecha_nacimiento);
  return !telefono || !fecha;
}

export function buildProfilePatchPayload(form, baseline) {
  const patch = {};
  const fields = ["nombre", "apellido", "dni", "telefono", "fecha_nacimiento"];

  for (const key of fields) {
    const next = safe(form[key]);
    const prev = safe(baseline[key]);
    if (key === "fecha_nacimiento") {
      if (next !== prev) {
        patch.fecha_nacimiento = next ? next : null;
      }
    } else if (key === "telefono") {
      if (next !== prev) {
        patch.telefono = next ? next : null;
      }
    } else if (next !== prev && next) {
      patch[key] = next;
    }
  }

  return patch;
}

export function isProfileFormDirty(form, baseline) {
  return Object.keys(buildProfilePatchPayload(form, baseline)).length > 0;
}
