import { create } from "zustand";
import { persist } from "zustand/middleware";
import appConfig from "@/config/app.config";
import { sumSelectionMap } from "@/features/combo/combo.constants";
import {
  getClienteCombos,
  createClienteCombo,
  deleteClienteCombo,
} from "@/services/clientesCombosService";
import { useAuthStore, selectIsAuthenticatedCliente } from "@/store/useAuthStore";

export const FALLBACK_COMBO_NAME = "Mi Combo Personalizado";

const LEGACY_ICE_PRODUCT_ID = "hielo-bag";

function buildAutoLabel(base, mixer) {
  const b = (base?.nombre ?? "Base").trim();
  const m = (mixer?.nombre ?? "Mix").trim();
  return `${b} + ${m}`;
}

/** Nombre para guardar/mostrar: input del usuario, auto "Combo Base + Mix", o fallback. */
export function resolveComboName({ name, base, mixer }) {
  const trimmed = String(name ?? "").trim();
  if (trimmed.length > 0) return trimmed;
  const b = base?.nombre?.trim();
  const m = mixer?.nombre?.trim();
  if (b && m) return `Combo ${b} + ${m}`;
  return FALLBACK_COMBO_NAME;
}

function isValidExtraProductId(id) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
}

/**
 * Extras reales para wizard/checkout: mapa { [productId]: { product, cantidad } }.
 * Fusiona legacy `ice` y descarta hielo-bag / entradas inválidas.
 */
export function normalizeExtrasFromSaved(saved) {
  const merged = { ...(saved?.extras ?? {}) };

  if (saved?.ice && typeof saved.ice === "object") {
    for (const key in saved.ice) {
      const entry = saved.ice[key];
      if (!entry) continue;
      const pid = entry.product?.id ?? key;
      if (String(pid) === LEGACY_ICE_PRODUCT_ID) continue;
      if (!isValidExtraProductId(pid)) continue;
      merged[String(pid)] = entry;
    }
  }

  const clean = {};
  for (const key in merged) {
    const entry = merged[key];
    const product = entry?.product;
    const pid = product?.id ?? key;
    if (String(pid) === LEGACY_ICE_PRODUCT_ID) continue;
    if (!product || !isValidExtraProductId(pid)) continue;
    clean[String(pid)] = {
      product,
      cantidad: Math.max(0, Number(entry.cantidad ?? entry.quantity ?? 0)),
    };
  }
  return clean;
}

function computeSavedComboTotal(base, mixer, extras = {}) {
  let sum = 0;
  if (base) sum += Number(base.precio) || 0;
  if (mixer) sum += Number(mixer.precio) || 0;
  sum += sumSelectionMap(extras);
  return sum;
}

/**
 * Lista normalizada de componentes con producto_id reales (sin hielo ficticio).
 */
function buildItems(base, mixer, extras = {}) {
  const items = [];
  if (base) {
    items.push({
      id: base.id,
      role: "base",
      nombre: base.nombre,
      cantidad: 1,
      precio: Number(base.precio) || 0,
    });
  }
  if (mixer) {
    items.push({
      id: mixer.id,
      role: "mixer",
      nombre: mixer.nombre,
      cantidad: 1,
      precio: Number(mixer.precio) || 0,
    });
  }
  for (const key in extras) {
    const entry = extras[key];
    const pid = entry.product?.id ?? key;
    if (!isValidExtraProductId(pid)) continue;
    const qty = Number(entry.cantidad ?? 0);
    if (qty <= 0) continue;
    items.push({
      id: pid,
      role: "extra",
      nombre: entry.product?.nombre ?? "Extra",
      cantidad: qty,
      precio: Number(entry.product?.precio) || 0,
    });
  }
  return items;
}

function buildComboEntry({ name, base, mixer, extras = {} }) {
  const normalizedExtras = normalizeExtrasFromSaved({ extras });
  return {
    name: resolveComboName({ name, base, mixer }),
    label: buildAutoLabel(base, mixer),
    base,
    mixer,
    extras: normalizedExtras,
    items: buildItems(base, mixer, normalizedExtras),
    total: computeSavedComboTotal(base, mixer, normalizedExtras),
  };
}

/**
 * Normaliza combo desde API o persist local (legacy iceBags / hielo-bag).
 * @returns {object|null}
 */
export function normalizeSavedCombo(raw) {
  if (!raw || typeof raw !== "object") return null;

  const base = raw.base ?? null;
  const mixer = raw.mixer ?? null;
  const extras = normalizeExtrasFromSaved(raw);
  const legacyIceBags = Number(raw.iceBags) > 0;
  const legacyIceSkipped =
    legacyIceBags &&
    !Object.values(extras).some((e) =>
      String(e?.product?.nombre ?? "")
        .toLowerCase()
        .includes("hielo")
    );

  const name =
    String(raw.name ?? "").trim() ||
    resolveComboName({ name: "", base, mixer });

  return {
    ...raw,
    id: raw.id != null ? String(raw.id) : raw.id,
    name,
    label: raw.label ?? buildAutoLabel(base, mixer),
    base,
    mixer,
    extras,
    items: buildItems(base, mixer, extras),
    total: computeSavedComboTotal(base, mixer, extras),
    legacyIceSkipped,
  };
}

/** Solo campos aceptados por el validador Zod strict del backend. */
export function toClienteComboApiPayload(entry) {
  return {
    name: entry.name,
    label: entry.label,
    total: entry.total,
    base: entry.base,
    mixer: entry.mixer,
    extras: entry.extras,
    items: entry.items,
  };
}

export const useSavedCombosStore = create(
  persist(
    (set, get) => ({
      combos: [],
      syncing: false,
      hasSyncedFromApi: false,

      /**
       * Guarda plantilla en API + state solo si hay sesión de cliente.
       * @returns {{ ok: boolean, reason?: 'unauthenticated'|'error', combo?: object }}
       */
      saveComboForCliente: async ({ name, base, mixer, extras = {} }) => {
        if (!selectIsAuthenticatedCliente(useAuthStore.getState())) {
          return { ok: false, reason: "unauthenticated" };
        }

        const entry = buildComboEntry({ name, base, mixer, extras });

        try {
          const created = await createClienteCombo(toClienteComboApiPayload(entry));
          if (!created?.id) {
            return { ok: false, reason: "error" };
          }

          const merged = normalizeSavedCombo({
            ...entry,
            ...created,
            id: String(created.id),
            savedAt: created.savedAt ?? Date.now(),
          });

          const max = appConfig.savedCombos?.maxItems ?? 10;
          set((state) => ({
            combos: [merged, ...state.combos].slice(0, max),
          }));

          return { ok: true, combo: merged };
        } catch {
          return { ok: false, reason: "error" };
        }
      },

      removeCombo: (id) =>
        set((state) => ({
          combos: state.combos.filter((c) => c.id !== id),
        })),

      removeComboRemote: async (id) => {
        try {
          await deleteClienteCombo(id);
          return true;
        } catch {
          return false;
        }
      },

      removeComboWithSync: async (id) => {
        const prev = get().combos;
        set((state) => ({ combos: state.combos.filter((c) => c.id !== id) }));
        const looksRemoteId = /^\d+$/.test(String(id));
        if (!looksRemoteId) return true;
        const ok = await get().removeComboRemote(id);
        if (!ok) {
          set({ combos: prev });
          return false;
        }
        return true;
      },

      syncCombosFromApi: async () => {
        if (!selectIsAuthenticatedCliente(useAuthStore.getState())) return;
        if (get().syncing) return;
        set({ syncing: true });
        try {
          const remote = await getClienteCombos();
          const combos = Array.isArray(remote)
            ? remote.map((row) => normalizeSavedCombo(row)).filter(Boolean)
            : [];
          set({
            combos,
            hasSyncedFromApi: true,
          });
        } catch {
          set({ hasSyncedFromApi: true });
        } finally {
          set({ syncing: false });
        }
      },

      getComboById: (id) => {
        const found = get().combos.find((c) => String(c.id) === String(id));
        return found ? normalizeSavedCombo(found) : null;
      },
    }),
    {
      name: appConfig.savedCombos?.storageKey ?? "tus_combos",
      partialize: (state) => ({ combos: state.combos }),
      merge: (persisted, current) => {
        const p = persisted ?? {};
        const combos = Array.isArray(p.combos)
          ? p.combos.map((c) => normalizeSavedCombo(c)).filter(Boolean)
          : [];
        return { ...current, ...p, combos };
      },
    }
  )
);

export const selectSavedCombos = (state) => state.combos;
