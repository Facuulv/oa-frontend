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

function getFirstProductFromMap(map = {}) {
  for (const key in map) {
    const entry = map[key];
    if ((entry?.cantidad ?? 0) > 0 && entry?.product) return entry.product;
  }
  return null;
}

function normalizeSelectionMap(map, legacySingle) {
  if (map && typeof map === "object" && Object.keys(map).length > 0) {
    return map;
  }
  if (legacySingle?.id) {
    return { [legacySingle.id]: { product: legacySingle, cantidad: 1 } };
  }
  return {};
}

function computeSavedComboTotal(bases = {}, mixers = {}, extras = {}) {
  return (
    sumSelectionMap(bases) + sumSelectionMap(mixers) + sumSelectionMap(extras)
  );
}

/**
 * Lista normalizada de componentes con producto_id reales (sin hielo ficticio).
 */
function buildItems(bases = {}, mixers = {}, extras = {}) {
  const items = [];
  const pushFromMap = (map, role) => {
    for (const key in map) {
      const entry = map[key];
      const pid = entry.product?.id ?? key;
      if (!isValidExtraProductId(pid)) continue;
      const qty = Number(entry.cantidad ?? 0);
      if (qty <= 0) continue;
      items.push({
        id: pid,
        role,
        nombre: entry.product?.nombre ?? role,
        cantidad: qty,
        precio: Number(entry.product?.precio) || 0,
      });
    }
  };

  pushFromMap(bases, "base");
  pushFromMap(mixers, "mixer");
  pushFromMap(extras, "extra");
  return items;
}

function buildComboEntry({ name, bases, mixers, extras = {}, base, mixer }) {
  const normalizedBases = normalizeSelectionMap(bases, base);
  const normalizedMixers = normalizeSelectionMap(mixers, mixer);
  const normalizedExtras = normalizeExtrasFromSaved({ extras });
  const legacyBase = getFirstProductFromMap(normalizedBases);
  const legacyMixer = getFirstProductFromMap(normalizedMixers);

  return {
    name: resolveComboName({ name, base: legacyBase, mixer: legacyMixer }),
    label: buildAutoLabel(legacyBase, legacyMixer),
    base: legacyBase,
    mixer: legacyMixer,
    bases: normalizedBases,
    mixers: normalizedMixers,
    extras: normalizedExtras,
    items: buildItems(normalizedBases, normalizedMixers, normalizedExtras),
    total: computeSavedComboTotal(
      normalizedBases,
      normalizedMixers,
      normalizedExtras
    ),
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
  const bases = normalizeSelectionMap(raw.bases, base);
  const mixers = normalizeSelectionMap(raw.mixers, mixer);
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
    base: getFirstProductFromMap(bases),
    mixer: getFirstProductFromMap(mixers),
    bases,
    mixers,
    extras,
    items: buildItems(bases, mixers, extras),
    total: computeSavedComboTotal(bases, mixers, extras),
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
      saveComboForCliente: async ({
        name,
        bases,
        mixers,
        extras = {},
        base,
        mixer,
      }) => {
        if (!selectIsAuthenticatedCliente(useAuthStore.getState())) {
          return { ok: false, reason: "unauthenticated" };
        }

        const entry = buildComboEntry({
          name,
          bases,
          mixers,
          extras,
          base,
          mixer,
        });

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
