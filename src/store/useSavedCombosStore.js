import { create } from "zustand";
import { persist } from "zustand/middleware";
import appConfig from "@/config/app.config";
import {
  getClienteCombos,
  createClienteCombo,
  deleteClienteCombo,
} from "@/services/clientesCombosService";

const ICE_BAG_UNIT_PRICE = 2500;
const DEFAULT_COMBO_NAME = "Mi Combo Custom";

function buildAutoLabel(base, mixer) {
  const b = (base?.nombre ?? "Base").trim();
  const m = (mixer?.nombre ?? "Mix").trim();
  return `${b} + ${m}`;
}

function computeSavedComboTotal(base, mixer, extras = {}, iceBags = 0) {
  let sum = 0;
  if (base) sum += Number(base.precio) || 0;
  if (mixer) sum += Number(mixer.precio) || 0;
  for (const id in extras) {
    sum += (Number(extras[id].product?.precio) || 0) * (extras[id].cantidad ?? 0);
  }
  sum += Number(iceBags) * ICE_BAG_UNIT_PRICE;
  return sum;
}

/**
 * Aplana las selecciones del wizard a una lista normalizada de "componentes"
 * con IDs y cantidades, para poder reconstruir el combo más adelante.
 */
function buildItems(base, mixer, extras = {}, iceBags = 0) {
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
    items.push({
      id: entry.product?.id ?? key,
      role: "extra",
      nombre: entry.product?.nombre ?? "Extra",
      cantidad: entry.cantidad ?? 1,
      precio: Number(entry.product?.precio) || 0,
    });
  }
  if (iceBags > 0) {
    items.push({
      id: "hielo-bag",
      role: "ice",
      nombre: "Bolsa de Hielo",
      cantidad: Number(iceBags) || 0,
      precio: ICE_BAG_UNIT_PRICE,
    });
  }
  return items;
}

export const useSavedCombosStore = create(
  persist(
    (set, get) => ({
      combos: [],
      syncing: false,
      hasSyncedFromApi: false,

      saveCombo: ({ name, base, mixer, extras = {}, iceBags = 0 }) => {
        const cleanName = String(name ?? "").trim();
        const finalName = cleanName.length > 0 ? cleanName : DEFAULT_COMBO_NAME;
        const entry = {
          id: `combo-${Date.now()}`,
          name: finalName,
          label: buildAutoLabel(base, mixer),
          savedAt: Date.now(),
          base,
          mixer,
          extras: { ...extras },
          iceBags: Number(iceBags) || 0,
          items: buildItems(base, mixer, extras, iceBags),
          total: computeSavedComboTotal(base, mixer, extras, iceBags),
        };
        const max = appConfig.savedCombos?.maxItems ?? 10;
        set((state) => ({
          combos: [entry, ...state.combos].slice(0, max),
        }));
        void get().saveComboRemote(entry);
        return entry;
      },

      removeCombo: (id) =>
        set((state) => ({
          combos: state.combos.filter((c) => c.id !== id),
        })),

      saveComboRemote: async (entry) => {
        try {
          const created = await createClienteCombo(entry);
          if (!created?.id) return null;
          set((state) => ({
            combos: state.combos.map((combo) =>
              combo.id === entry.id
                ? { ...combo, ...created, id: String(created.id), savedAt: created.savedAt ?? combo.savedAt }
                : combo
            ),
          }));
          return created;
        } catch {
          return null;
        }
      },

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
        if (get().syncing) return;
        set({ syncing: true });
        try {
          const remote = await getClienteCombos();
          set({
            combos: Array.isArray(remote) ? remote : [],
            hasSyncedFromApi: true,
          });
        } catch {
          set({ hasSyncedFromApi: true });
        } finally {
          set({ syncing: false });
        }
      },

      getComboById: (id) => get().combos.find((c) => c.id === id) ?? null,
    }),
    {
      name: appConfig.savedCombos?.storageKey ?? "tus_combos",
      partialize: (state) => ({ combos: state.combos }),
    }
  )
);

export const selectSavedCombos = (state) => state.combos;
