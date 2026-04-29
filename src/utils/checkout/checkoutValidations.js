import { validateEmail, validateName, validatePhone } from "@/lib/validations";

function required(value) {
  return value != null && String(value).trim().length > 0;
}

export function validateCheckoutForm(values) {
  const errors = {};

  if (!required(values.nombre)) {
    errors.nombre = "Ingresá tu nombre";
  } else {
    const nameValidation = validateName(values.nombre);
    if (!nameValidation.valid) errors.nombre = nameValidation.message;
  }

  if (!required(values.telefono)) {
    errors.telefono = "Ingresá tu teléfono";
  } else {
    const phoneValidation = validatePhone(values.telefono, { required: true });
    if (!phoneValidation.valid) errors.telefono = phoneValidation.message;
  }

  if (values.email) {
    const emailValidation = validateEmail(values.email, { required: false });
    if (!emailValidation.valid) errors.email = emailValidation.message;
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
