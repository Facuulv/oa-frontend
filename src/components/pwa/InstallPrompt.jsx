"use client";

import { useMemo, useState } from "react";
import { Download, X } from "lucide-react";
import { APP_VIEWPORT_MAX_CLASS } from "@/components/layout/AppViewport";
import { cn } from "@/lib/cn";

function buildGuideContent(platform) {
  if (platform === "android-chrome") {
    return {
      title: "Instalar OA! en Android",
      description: "Seguí estos pasos para tener OA! como una app en tu celular.",
      steps: [
        "⋮ Tocá los tres puntitos arriba a la derecha.",
        '➕ Tocá "Agregar a pantalla principal" o "Instalar app".',
        '✅ Tocá "Instalar" o "Agregar".',
        "📱 Buscá el ícono OA! en la pantalla de tu celular.",
      ],
    };
  }

  if (platform === "ios-safari") {
    return {
      title: "Instalar OA! en iPhone",
      description: "En iPhone se agrega desde Safari.",
      steps: [
        "📱 Abrí esta página usando Safari.",
        "⬆️ Tocá el botón Compartir.",
        '➕ Elegí "Agregar a pantalla de inicio".',
        '✅ Tocá "Agregar".',
        "📱 Buscá el ícono OA! en tu pantalla.",
      ],
    };
  }

  return {
    title: "Instalar OA! en tu celular",
    description: "Te guiamos paso a paso para agregar OA! como app.",
    steps: [
      "⋮ Abrí el menú del navegador (o el botón compartir ⬆️).",
      '➕ Elegí "Agregar a pantalla principal", "Agregar a inicio" o "Instalar app".',
      '✅ Confirmá con "Instalar" o "Agregar".',
      "📱 Buscá el ícono OA! en tu pantalla principal.",
    ],
  };
}

export default function InstallPrompt({
  hidden = false,
  isOpen = false,
  onClose,
  installState,
}) {
  const [isInstalling, setIsInstalling] = useState(false);

  const {
    canOfferInstallGuide = false,
    canUseNativeInstall = false,
    platform = "unknown",
    promptInstall,
  } = installState || {};

  const guide = useMemo(() => buildGuideContent(platform), [platform]);

  if (hidden || !isOpen || !canOfferInstallGuide) {
    return null;
  }

  const handleAutomaticInstall = async () => {
    if (!canUseNativeInstall || typeof promptInstall !== "function") {
      return;
    }
    setIsInstalling(true);
    await promptInstall();
    setIsInstalling(false);
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] flex items-end justify-center bg-black/45 px-2 pb-2 pt-8 sm:items-center sm:p-4",
        APP_VIEWPORT_MAX_CLASS
      )}
      onClick={(event) => {
        if (event.target === event.currentTarget && typeof onClose === "function") {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Guía para instalar la app"
    >
      <div className="w-full max-w-lg rounded-2xl border border-black/5 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 pb-3 pt-4">
          <div>
            <p className="text-xl font-bold leading-tight text-slate-900">{guide.title}</p>
            <p className="mt-2 text-sm text-slate-600">{guide.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar guía de instalación"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pb-4 pt-3">
          {canUseNativeInstall ? (
            <button
              type="button"
              onClick={handleAutomaticInstall}
              disabled={isInstalling}
              className="mb-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white transition hover:brightness-110 disabled:opacity-70"
            >
              <Download size={18} />
              {isInstalling ? "Abriendo instalacion..." : "Instalar automáticamente"}
            </button>
          ) : (
            <div className="mb-3 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-sm text-primary">
              Seguí estos pasos manuales para instalar la app.
            </div>
          )}

          <ol className="space-y-2.5 rounded-xl bg-slate-50 p-3 text-base text-slate-700">
            {guide.steps.map((step, index) => (
              <li key={step} className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <span className="leading-snug">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
