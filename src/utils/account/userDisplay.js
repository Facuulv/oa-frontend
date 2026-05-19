const safe = (v) => String(v ?? "").trim();

export function getUserDisplayName(user) {
  const full = [user?.nombre, user?.apellido].map(safe).filter(Boolean).join(" ").trim();
  return full || safe(user?.name) || "Usuario";
}

export function getUserFirstName(user) {
  const nombre = safe(user?.nombre ?? user?.name);
  if (nombre) return nombre.split(/\s+/)[0];
  return getUserDisplayName(user).split(/\s+/)[0];
}

export function getUserInitials(user) {
  const nombre = safe(user?.nombre);
  const apellido = safe(user?.apellido);
  if (nombre && apellido) {
    return `${nombre[0]}${apellido[0]}`.toUpperCase();
  }

  const name = safe(user?.nombre ?? user?.name);
  if (!name) return "?";

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 20) return "Buenas tardes";
  return "Buenas noches";
}
