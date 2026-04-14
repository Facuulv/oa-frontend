function required(value) {
  return value != null && String(value).trim().length > 0;
}

function minLength(value, min) {
  return String(value).trim().length >= min;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isValidPhone(value) {
  return /^\+?[\d\s\-()]{7,20}$/.test(String(value).trim());
}

export function validateCheckoutForm(values) {
  const errors = {};

  if (!required(values.nombre)) {
    errors.nombre = "Ingresá tu nombre";
  } else if (!minLength(values.nombre, 2)) {
    errors.nombre = "El nombre debe tener al menos 2 caracteres";
  }

  if (!required(values.telefono)) {
    errors.telefono = "Ingresá tu teléfono";
  } else if (!isValidPhone(values.telefono)) {
    errors.telefono = "El teléfono no es válido";
  }

  if (values.email && !isValidEmail(values.email)) {
    errors.email = "El email no es válido";
  }

  if (values.deliveryType === "DELIVERY" && !required(values.direccion)) {
    errors.direccion = "Ingresá tu dirección";
  }

  const keys = Object.keys(errors);
  return {
    ok: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : null,
    normalized: {
      nombre: String(values.nombre ?? "").trim(),
      telefono: String(values.telefono ?? "").trim(),
      email: String(values.email ?? "").trim(),
      direccion: String(values.direccion ?? "").trim(),
      deliveryType: values.deliveryType ?? "RETIRO",
      paymentMethod: values.paymentMethod ?? "efectivo",
      when: values.when ?? "CUANTO_ANTES",
      scheduledTime: values.scheduledTime ?? null,
      notes: String(values.notes ?? "").trim(),
      couponCode: String(values.couponCode ?? "").trim(),
    },
  };
}
