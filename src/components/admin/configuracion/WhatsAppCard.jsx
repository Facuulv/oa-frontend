"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ConfiguracionCard from "./ConfiguracionCard";
import {
  buildWhatsappPreviewUrl,
  validateWhatsappNumero,
} from "@/lib/configuracionUtils";

export default function WhatsAppCard({ whatsappPedidos, saving, onSave }) {
  const [numero, setNumero] = useState(whatsappPedidos || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setNumero(whatsappPedidos || "");
  }, [whatsappPedidos]);

  const previewUrl = buildWhatsappPreviewUrl(numero);
  const dirty = numero.replace(/\D/g, "") !== String(whatsappPedidos || "").replace(/\D/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateWhatsappNumero(numero);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError("");
    await onSave(validation.value);
  };

  return (
    <ConfiguracionCard
      title="WhatsApp de pedidos"
      description="Número al que los clientes envían el detalle del pedido desde la carta."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="whatsapp-pedidos" className="mb-1 block text-sm font-medium text-zinc-800">
            Número receptor
          </label>
          <input
            id="whatsapp-pedidos"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={numero}
            onChange={(e) => {
              setNumero(e.target.value.replace(/[^\d+]/g, ""));
              setError("");
            }}
            disabled={saving}
            placeholder="5493511234567"
            className="w-full min-h-11 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1.5 text-xs text-zinc-500">
            Usá formato internacional, por ejemplo <strong>549351XXXXXXX</strong> (solo dígitos).
          </p>
          {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
        </div>

        {previewUrl ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 text-sm">
            <p className="text-xs font-medium text-emerald-900">Vista previa del enlace</p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 break-all text-emerald-800 underline-offset-2 hover:underline"
            >
              {previewUrl}
            </a>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={saving || !dirty}
          className="admin-pressable inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
          Guardar WhatsApp
        </button>
      </form>
    </ConfiguracionCard>
  );
}
