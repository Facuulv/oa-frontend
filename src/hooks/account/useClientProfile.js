"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore, selectAuthUser } from "@/store/useAuthStore";
import { patchClienteProfile, CLIENTE_ERROR_CODES } from "@/services/clientesService";
import { ApiError } from "@/utils/api/apiError";
import { toast } from "@/lib/toast";
import {
  validateName,
  validateLastName,
  validateDni,
  validatePhone,
  validateBirthDate,
} from "@/lib/validations";
import {
  buildProfileFormFromUser,
  buildProfilePatchPayload,
  isProfileFormDirty,
} from "@/utils/account/profileHelpers";

function validateProfileForm(form) {
  const errors = {};
  const nameValidation = validateName(form.nombre);
  const lastNameValidation = validateLastName(form.apellido);
  const dniValidation = validateDni(form.dni, { required: true });
  const phoneValidation = validatePhone(form.telefono, { required: false });
  const birthValidation = validateBirthDate(form.fecha_nacimiento, { required: false });

  if (!nameValidation.valid) errors.nombre = nameValidation.message;
  if (!lastNameValidation.valid) errors.apellido = lastNameValidation.message;
  if (!dniValidation.valid) errors.dni = dniValidation.message;
  if (!phoneValidation.valid) errors.telefono = phoneValidation.message;
  if (!birthValidation.valid) errors.fecha_nacimiento = birthValidation.message;

  return errors;
}

export function useClientProfile() {
  const user = useAuthStore(selectAuthUser);
  const validateSession = useAuthStore((s) => s.validateSession);

  const baseline = useMemo(() => buildProfileFormFromUser(user), [user]);
  const [form, setForm] = useState(baseline);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(baseline);
    setFieldErrors({});
  }, [baseline]);

  const isDirty = useMemo(() => isProfileFormDirty(form, baseline), [form, baseline]);

  const updateField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const submit = useCallback(async () => {
    const errors = validateProfileForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Revisá los campos marcados.");
      return { ok: false };
    }

    const patch = buildProfilePatchPayload(form, baseline);
    if (Object.keys(patch).length === 0) {
      return { ok: true };
    }

    setSaving(true);
    setFieldErrors({});
    try {
      const data = await patchClienteProfile(patch);
      await validateSession({ force: true });
      toast.success("Perfil actualizado");
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiError) {
        if (Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        }
        if (err.code === CLIENTE_ERROR_CODES.DNI_EXISTS) {
          setFieldErrors((prev) => ({
            ...prev,
            dni: err.message || "Este DNI ya está registrado",
          }));
        }
      }
      toast.error(err?.message ?? "No pudimos guardar tu perfil");
      return { ok: false };
    } finally {
      setSaving(false);
    }
  }, [form, baseline, validateSession]);

  return {
    form,
    fieldErrors,
    saving,
    isDirty,
    updateField,
    submit,
  };
}
