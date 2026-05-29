"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAdminConfiguracion,
  updateConfiguracionCarta,
  updateConfiguracionHorarioDia,
  updateConfiguracionWhatsapp,
  updateConfiguracionEmailRecuperacion,
} from "@/services/configuracionService";
import {
  buildHorariosPorDia,
  parseConfigBoolean,
} from "@/lib/configuracionUtils";
import { apiErrorFromAxios } from "@/utils/api/apiError";

const initialSaving = {
  carta: false,
  whatsapp: false,
  email: false,
  horarioDia: null,
};

export function useConfiguracion({ enabled = true } = {}) {
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [horariosPorDia, setHorariosPorDia] = useState(() => buildHorariosPorDia());
  const [estado, setEstado] = useState(null);
  const [emailRecuperacion, setEmailRecuperacion] = useState(null);
  const [saving, setSaving] = useState(initialSaving);
  const loadSeq = useRef(0);

  const applyPayload = useCallback((payload) => {
    if (!payload) return;
    setSettings(payload.settings ?? null);
    const rows = Array.isArray(payload.horarios) ? payload.horarios : [];
    setHorarios(rows);
    setHorariosPorDia(buildHorariosPorDia(rows));
    setEstado(payload.estado ?? null);
    setEmailRecuperacion(payload.emailRecuperacion ?? null);
  }, []);

  const reload = useCallback(async () => {
    if (!enabled) return null;
    const seq = ++loadSeq.current;
    setLoading(true);
    setError(null);
    try {
      const payload = await getAdminConfiguracion();
      if (seq !== loadSeq.current) return null;
      applyPayload(payload);
      return payload;
    } catch (err) {
      if (seq !== loadSeq.current) return null;
      const parsed = apiErrorFromAxios(err);
      setError(parsed.message || "No se pudo cargar la configuración.");
      return null;
    } finally {
      if (seq === loadSeq.current) setLoading(false);
    }
  }, [enabled, applyPayload]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    reload();
  }, [enabled, reload]);

  const saveCarta = useCallback(
    async ({ cartaOnlineHabilitada, validarHorarios }) => {
      setSaving((s) => ({ ...s, carta: true }));
      try {
        const result = await updateConfiguracionCarta({
          cartaOnlineHabilitada,
          validarHorarios,
        });
        await reload();
        return { ok: true, result };
      } catch (err) {
        const parsed = apiErrorFromAxios(err);
        return { ok: false, message: parsed.message };
      } finally {
        setSaving((s) => ({ ...s, carta: false }));
      }
    },
    [reload],
  );

  const saveHorarioDia = useCallback(
    async (diaSemana, diaState) => {
      setSaving((s) => ({ ...s, horarioDia: diaSemana }));
      try {
        const franjas = diaState.activo
          ? [
              {
                hora_apertura: diaState.hora_apertura,
                hora_cierre: diaState.hora_cierre,
                activo: true,
              },
            ]
          : [];

        const result = await updateConfiguracionHorarioDia({
          dia_semana: diaSemana,
          franjas,
        });
        const payload = result?.data ?? result;
        if (payload?.horarios) {
          setHorarios(payload.horarios);
          setHorariosPorDia(buildHorariosPorDia(payload.horarios));
        }
        if (payload?.estado) setEstado(payload.estado);
        else await reload();
        return { ok: true };
      } catch (err) {
        const parsed = apiErrorFromAxios(err);
        return { ok: false, message: parsed.message };
      } finally {
        setSaving((s) => ({ ...s, horarioDia: null }));
      }
    },
    [reload],
  );

  const saveWhatsapp = useCallback(
    async (numero) => {
      setSaving((s) => ({ ...s, whatsapp: true }));
      try {
        await updateConfiguracionWhatsapp({ numero });
        await reload();
        return { ok: true };
      } catch (err) {
        const parsed = apiErrorFromAxios(err);
        return { ok: false, message: parsed.message };
      } finally {
        setSaving((s) => ({ ...s, whatsapp: false }));
      }
    },
    [reload],
  );

  const saveEmailRecuperacion = useCallback(
    async ({ nombre, asunto, textoIntro }) => {
      setSaving((s) => ({ ...s, email: true }));
      try {
        const result = await updateConfiguracionEmailRecuperacion({
          nombre,
          asunto,
          textoIntro,
        });
        const data = result?.data ?? result;
        if (data) setEmailRecuperacion(data);
        else await reload();
        return { ok: true };
      } catch (err) {
        const parsed = apiErrorFromAxios(err);
        return { ok: false, message: parsed.message };
      } finally {
        setSaving((s) => ({ ...s, email: false }));
      }
    },
    [reload],
  );

  const cartaOnlineHabilitada = parseConfigBoolean(
    settings?.CARTA_ONLINE_HABILITADA,
    true,
  );
  const validarHorarios = parseConfigBoolean(settings?.VALIDAR_HORARIOS_CHECKOUT, true);
  const whatsappPedidos = String(settings?.WHATSAPP_PEDIDOS ?? "").replace(/\D/g, "");

  const updateDiaLocal = useCallback((diaSemana, patch) => {
    setHorariosPorDia((prev) => ({
      ...prev,
      [diaSemana]: { ...prev[diaSemana], ...patch },
    }));
  }, []);

  return {
    loading,
    error,
    settings,
    horarios,
    horariosPorDia,
    estado,
    saving,
    cartaOnlineHabilitada,
    validarHorarios,
    whatsappPedidos,
    reload,
    saveCarta,
    saveHorarioDia,
    saveWhatsapp,
    saveEmailRecuperacion,
    emailRecuperacion,
    updateDiaLocal,
  };
}
