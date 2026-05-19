const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
const DNI_REGEX = /^\d+$/;
const EMAIL_REGEX = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^\d+$/;
const DECIMAL_REGEX = /^\d+(?:[.,]\d+)?$/;
const PRODUCT_LIKE_NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s.,\-+!%]+$/;
const DESCRIPTION_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s.,;:()\-+!%/"]+$/;

function normalizeText(value) {
  return String(value ?? "").trim();
}

function hasOnlyAllowedChars(value, regex) {
  const text = normalizeText(value);
  if (!text) return false;
  return regex.test(text);
}

function buildResult(valid, message = "") {
  return { valid, message };
}

export function normalizeDecimal(value) {
  return normalizeText(value).replace(",", ".");
}

export function validateName(value) {
  const text = normalizeText(value);
  if (!text) return buildResult(false, "Ingresá tu nombre.");
  if (!hasOnlyAllowedChars(text, NAME_REGEX)) {
    return buildResult(false, "El nombre solo puede contener letras y espacios (sin números ni símbolos).");
  }
  return buildResult(true);
}

export function validateLastName(value) {
  const text = normalizeText(value);
  if (!text) return buildResult(false, "Ingresá tu apellido.");
  if (!hasOnlyAllowedChars(text, NAME_REGEX)) {
    return buildResult(false, "El apellido solo puede contener letras y espacios (sin números ni símbolos).");
  }
  return buildResult(true);
}

export function validateDni(value, { required = false } = {}) {
  const text = normalizeText(value);
  if (!text) {
    return required ? buildResult(false, "Ingresá el DNI.") : buildResult(true);
  }
  if (!DNI_REGEX.test(text)) {
    return buildResult(false, "El DNI solo puede contener números.");
  }
  if (text.length < 7) {
    return buildResult(false, "El DNI debe tener al menos 7 dígitos.");
  }
  if (text.length > 10) {
    return buildResult(false, "El DNI no puede superar 10 dígitos.");
  }
  return buildResult(true);
}

export function validateBirthDate(value, { required = false } = {}) {
  const text = normalizeText(value);
  if (!text) {
    return required ? buildResult(false, "Ingresá tu fecha de nacimiento.") : buildResult(true);
  }
  const parsed = new Date(`${text}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return buildResult(false, "La fecha no es válida.");
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (parsed > today) {
    return buildResult(false, "La fecha de nacimiento no puede ser futura.");
  }
  return buildResult(true);
}

export function validateEmail(value, { required = true } = {}) {
  const text = normalizeText(value);
  if (!text) {
    return required ? buildResult(false, "Ingresá tu email.") : buildResult(true);
  }
  if (!EMAIL_REGEX.test(text)) {
    return buildResult(false, "Ingresá un email válido (ej: usuario@dominio.com).");
  }
  return buildResult(true);
}

export function validatePhone(value, { required = false } = {}) {
  const text = normalizeText(value);
  if (!text) {
    return required ? buildResult(false, "Ingresá tu teléfono.") : buildResult(true);
  }
  if (!PHONE_REGEX.test(text)) {
    return buildResult(false, "El teléfono solo puede contener números.");
  }
  return buildResult(true);
}

export function validatePrice(value, { required = true } = {}) {
  const text = normalizeText(value);
  if (!text) {
    return required ? buildResult(false, "Ingresá el precio.") : buildResult(true);
  }
  if (!DECIMAL_REGEX.test(text)) {
    return buildResult(false, "El precio solo puede contener números y coma o punto decimal.");
  }
  const parsed = Number.parseFloat(normalizeDecimal(text));
  if (!Number.isFinite(parsed)) return buildResult(false, "El precio no es válido.");
  if (parsed < 0) return buildResult(false, "El precio no puede ser negativo.");
  return buildResult(true);
}

export function validateStock(value, { required = false, allowDecimal = false } = {}) {
  const text = normalizeText(value);
  if (!text) {
    return required ? buildResult(false, "Ingresá el stock.") : buildResult(true);
  }
  const regex = allowDecimal ? DECIMAL_REGEX : DNI_REGEX;
  if (!regex.test(text)) {
    return buildResult(
      false,
      allowDecimal
        ? "El stock solo puede contener números y coma o punto decimal."
        : "El stock solo puede contener números.",
    );
  }
  const parsed = Number.parseFloat(normalizeDecimal(text));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return buildResult(false, "El stock no puede ser negativo.");
  }
  return buildResult(true);
}

export function validateDescription(value, { required = false } = {}) {
  const text = normalizeText(value);
  if (!text) {
    return required ? buildResult(false, "Ingresá una descripción.") : buildResult(true);
  }
  if (!DESCRIPTION_REGEX.test(text)) {
    return buildResult(false, "La descripción contiene caracteres no permitidos.");
  }
  return buildResult(true);
}

export function validateProductLikeName(value, { required = true } = {}) {
  const text = normalizeText(value);
  if (!text) {
    return required ? buildResult(false, "Este campo es obligatorio.") : buildResult(true);
  }
  if (!PRODUCT_LIKE_NAME_REGEX.test(text)) {
    return buildResult(false, "Solo se permiten letras, números, espacios y . , - + ! %");
  }
  return buildResult(true);
}
