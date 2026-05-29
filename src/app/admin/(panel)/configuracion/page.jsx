"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";
import { useAuthStore, selectIsAdminRole } from "@/store/useAuthStore";
import { useConfiguracion } from "@/hooks/admin/useConfiguracion";
import ConfiguracionHeader from "@/components/admin/configuracion/ConfiguracionHeader";
import CartaOnlineCard from "@/components/admin/configuracion/CartaOnlineCard";
import HorariosCard from "@/components/admin/configuracion/HorariosCard";
import WhatsAppCard from "@/components/admin/configuracion/WhatsAppCard";
import EmailRecuperacionCard from "@/components/admin/configuracion/EmailRecuperacionCard";

export default function AdminConfiguracionPage() {
  const router = useRouter();
  const isAdmin = useAuthStore(selectIsAdminRole);
  const redirectDone = useRef(false);

  useEffect(() => {
    if (isAdmin || redirectDone.current) return;
    redirectDone.current = true;
    toast.error("No tenés permiso para acceder a la configuración.");
    router.replace("/admin");
  }, [isAdmin, router]);

  const {
    loading,
    error,
    estado,
    saving,
    cartaOnlineHabilitada,
    validarHorarios,
    whatsappPedidos,
    horariosPorDia,
    reload,
    saveCarta,
    saveHorarioDia,
    saveWhatsapp,
    saveEmailRecuperacion,
    emailRecuperacion,
    updateDiaLocal,
  } = useConfiguracion({ enabled: isAdmin });

  const handleSaveCarta = async (payload) => {
    const result = await saveCarta(payload);
    if (result.ok) toast.success("Configuración de carta guardada.");
    else toast.error(result.message || "No se pudo guardar la carta online.");
  };

  const handleSaveDia = async (diaSemana, diaState) => {
    const result = await saveHorarioDia(diaSemana, diaState);
    if (result.ok) toast.success("Horario guardado.");
    else toast.error(result.message || "No se pudo guardar el horario.");
  };

  const handleSaveWhatsapp = async (numero) => {
    const result = await saveWhatsapp(numero);
    if (result.ok) toast.success("WhatsApp actualizado.");
    else toast.error(result.message || "No se pudo guardar el número.");
  };

  const handleSaveEmailRecuperacion = async (payload) => {
    const result = await saveEmailRecuperacion(payload);
    if (result.ok) toast.success("Email de recuperación guardado.");
    else toast.error(result.message || "No se pudo guardar el email.");
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 py-16 text-center text-sm text-zinc-500">
        <Loader2 className="h-8 w-8 shrink-0 animate-spin text-primary" aria-hidden />
        <p>Redirigiendo al panel…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <ConfiguracionHeader />
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-sm text-zinc-500">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
          <p>Cargando configuración…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <ConfiguracionHeader onReload={reload} reloading={loading} />
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-800">
          <p>{error}</p>
          <button
            type="button"
            onClick={reload}
            className="admin-pressable mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 font-medium text-red-900"
          >
            <RefreshCw size={16} aria-hidden />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <ConfiguracionHeader onReload={reload} reloading={loading} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <CartaOnlineCard
          cartaOnlineHabilitada={cartaOnlineHabilitada}
          validarHorarios={validarHorarios}
          estado={estado}
          saving={saving.carta}
          onSave={handleSaveCarta}
        />
        <WhatsAppCard
          whatsappPedidos={whatsappPedidos}
          saving={saving.whatsapp}
          onSave={handleSaveWhatsapp}
        />
      </div>

      <HorariosCard
        horariosPorDia={horariosPorDia}
        savingDia={saving.horarioDia}
        onUpdateDiaLocal={updateDiaLocal}
        onSaveDia={handleSaveDia}
      />

      <EmailRecuperacionCard
        emailRecuperacion={emailRecuperacion}
        saving={saving.email}
        onSave={handleSaveEmailRecuperacion}
      />
    </div>
  );
}
