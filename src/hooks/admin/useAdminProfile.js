"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore, selectAuthUser } from "@/store/useAuthStore";
import {
  getAdminProfile,
  patchAdminProfile,
  changeAdminOwnPassword,
  ADMIN_PROFILE_CODES,
} from "@/services/adminProfileService";
import { ApiError } from "@/utils/api/apiError";
import { toast } from "@/lib/toast";
import {
  validateName,
  validateLastName,
  validateDni,
  validatePhone,
  validateEmail,
} from "@/lib/validations";

function buildProfileFormFromUser(user) {
  return {
    nombre: user?.nombre ?? "",
    apellido: user?.apellido ?? "",
    dni: user?.dni != null ? String(user.dni) : "",
    email: user?.email ?? "",
    telefono: user?.telefono ?? "",
  };
}

function buildProfilePatch(form, baseline) {
  const patch = {};
  const trim = (v) => (typeof v === "string" ? v.trim() : v);

  if (trim(form.nombre) !== trim(baseline.nombre)) patch.nombre = trim(form.nombre);
  if (trim(form.apellido) !== trim(baseline.apellido)) patch.apellido = trim(form.apellido);
  if (trim(form.email) !== trim(baseline.email)) patch.email = trim(form.email);

  const dniTrim = trim(form.dni);
  const baseDniTrim = trim(baseline.dni);
  if (dniTrim !== baseDniTrim) patch.dni = dniTrim === "" ? null : dniTrim;

  const telTrim = trim(form.telefono);
  const baseTelTrim = trim(baseline.telefono);
  if (telTrim !== baseTelTrim) patch.telefono = telTrim === "" ? null : telTrim;

  return patch;
}

function validateProfileForm(form) {
  const errors = {};
  const nameValidation = validateName(form.nombre);
  const lastNameValidation = validateLastName(form.apellido);
  const dniValidation = validateDni(form.dni, { required: false });
  const phoneValidation = validatePhone(form.telefono, { required: false });
  const emailValidation = validateEmail(form.email, { required: true });

  if (!nameValidation.valid) errors.nombre = nameValidation.message;
  if (!lastNameValidation.valid) errors.apellido = lastNameValidation.message;
  if (!dniValidation.valid) errors.dni = dniValidation.message;
  if (!phoneValidation.valid) errors.telefono = phoneValidation.message;
  if (!emailValidation.valid) errors.email = emailValidation.message;

  return errors;
}

function validatePasswordForm(form) {
  const errors = {};
  if (!form.currentPassword.trim()) {
    errors.currentPassword = "La contraseña actual es obligatoria";
  }
  if (!form.newPassword.trim()) {
    errors.newPassword = "La nueva contraseña es obligatoria";
  } else if (form.newPassword.length < 6) {
    errors.newPassword = "Mínimo 6 caracteres";
  }
  if (!form.confirmPassword.trim()) {
    errors.confirmPassword = "Confirmá la nueva contraseña";
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }
  return errors;
}

export function useAdminProfile() {
  const authUser = useAuthStore(selectAuthUser);
  const validateSession = useAuthStore((s) => s.validateSession);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(buildProfileFormFromUser(authUser));
  const [fieldErrors, setFieldErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const baseline = useMemo(() => buildProfileFormFromUser(profile ?? authUser), [profile, authUser]);
  const isProfileDirty = useMemo(() => {
    const patch = buildProfilePatch(form, baseline);
    return Object.keys(patch).length > 0;
  }, [form, baseline]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminProfile();
      setProfile(data);
      setForm(buildProfileFormFromUser(data));
      setFieldErrors({});
    } catch (err) {
      toast.error(err?.message ?? "No se pudo cargar tu perfil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const updateField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const submitProfile = useCallback(async () => {
    const errors = validateProfileForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Revisá los campos marcados.");
      return { ok: false };
    }

    const patch = buildProfilePatch(form, baseline);
    if (Object.keys(patch).length === 0) {
      return { ok: true };
    }

    setSavingProfile(true);
    setFieldErrors({});
    try {
      const data = await patchAdminProfile(patch);
      setProfile(data);
      setForm(buildProfileFormFromUser(data));
      await validateSession({ force: true });
      toast.success("Perfil actualizado");
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === ADMIN_PROFILE_CODES.EMAIL_EXISTS) {
          setFieldErrors((prev) => ({ ...prev, email: err.message || "Email duplicado" }));
        }
        if (err.code === ADMIN_PROFILE_CODES.DNI_EXISTS) {
          setFieldErrors((prev) => ({ ...prev, dni: err.message || "DNI duplicado" }));
        }
      }
      toast.error(err?.message ?? "No se pudo guardar tu perfil");
      return { ok: false };
    } finally {
      setSavingProfile(false);
    }
  }, [form, baseline, validateSession]);

  const updatePasswordField = useCallback((key, value) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
    setPasswordErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const submitPassword = useCallback(async () => {
    const errors = validatePasswordForm(passwordForm);
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      toast.error("Revisá los campos marcados.");
      return { ok: false };
    }

    setSavingPassword(true);
    setPasswordErrors({});
    try {
      await changeAdminOwnPassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Contraseña actualizada");
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiError && err.code === ADMIN_PROFILE_CODES.CURRENT_PASSWORD_INVALID) {
        const message = err.message || "La contraseña actual es incorrecta";
        setPasswordErrors((prev) => ({
          ...prev,
          currentPassword: message,
        }));
        toast.error(message, { dedupeKey: "admin-profile:wrong-current-password" });
        return { ok: false };
      }
      toast.error(err?.message ?? "No se pudo cambiar la contraseña");
      return { ok: false };
    } finally {
      setSavingPassword(false);
    }
  }, [passwordForm]);

  return {
    loading,
    profile,
    form,
    fieldErrors,
    savingProfile,
    isProfileDirty,
    updateField,
    submitProfile,
    reloadProfile: loadProfile,
    passwordForm,
    passwordErrors,
    savingPassword,
    updatePasswordField,
    submitPassword,
  };
}
