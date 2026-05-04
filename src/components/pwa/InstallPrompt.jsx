"use client";

import { useMemo, useState } from "react";
import { Download, Share2, Smartphone, X } from "lucide-react";
import { APP_VIEWPORT_MAX_CLASS } from "@/components/layout/AppViewport";
import { cn } from "@/lib/cn";
import usePwaInstallPrompt from "@/hooks/usePwaInstallPrompt";

export default function InstallPrompt({ hidden = false, bottomOffset = 12 }) {
  const { canShowPrompt, canUseNativeInstall, isIOS, dismissPrompt, promptInstall } =
    usePwaInstallPrompt();
  const [showGuide, setShowGuide] = useState(false);

  const steps = useMemo(() => {
    if (isIOS) {
      return [
        "Abrí esta página desde Safari.",
        "Tocá el botón Compartir.",
        'Elegí "Agregar a pantalla de inicio".',
        'Tocá "Agregar".',
      ];
    }

    return [
      'Tocá "Instalar app".',
      "Confirmá la instalación.",
      "Buscá el ícono OA! en tu pantalla principal.",
    ];
  }, [isIOS]);

  if (hidden || !canShowPrompt) {
    return null;
  }

  return (
    <div
      className={cn("pointer-events-none fixed left-1/2 z-20 w-full px-3", APP_VIEWPORT_MAX_CLASS)}
      style={{
        bottom: `${bottomOffset}px`,
        transform: "translateX(-50%)",
      }}
    >
      <section className="pointer-events-auto rounded-2xl border border-black/5 bg-white p-3 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Instalá OA! en tu celular</p>
            <p className="mt-0.5 text-xs text-slate-600">
              Vas a abrir la app más rápido desde tu pantalla principal.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissPrompt}
            className="shrink-0 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar aviso de instalación"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {canUseNativeInstall ? (
            <button
              type="button"
              onClick={promptInstall}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
            >
              <Download size={15} />
              Instalar app
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setShowGuide((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {isIOS ? <Share2 size={15} /> : <Smartphone size={15} />}
            {showGuide ? "Ocultar instrucciones" : "Ver instrucciones"}
          </button>

          <button
            type="button"
            onClick={dismissPrompt}
            className="rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50"
          >
            Ahora no
          </button>
        </div>

        {showGuide ? (
          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-700">
              {isIOS ? "Instalación en iPhone (Safari)" : "Instalación en Android (Chrome)"}
            </p>
            <ol className="space-y-1.5 text-xs text-slate-700">
              {steps.map((step, index) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>
    </div>
  );
}
