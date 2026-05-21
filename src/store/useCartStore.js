import { create } from "zustand";
import { persist } from "zustand/middleware";
import appConfig from "@/config/app.config";
import { CUSTOM_COMBO_LINE_KIND } from "@/constants/cartLineKinds";

export { CUSTOM_COMBO_LINE_KIND };

/**
 * Cart item shape (field names match backend API contract):
 * { id, articuloId, slug, nombre, precioBase, extrasSeleccionados,
 *   observaciones, cantidad, precioUnitario, subtotal,
 *   categoria_nombre, imagen_url }
 *
 * Combo personalizado (solo UI + snapshot para checkout):
 * { lineKind: "CUSTOM_COMBO", comboComponents: { displayName, base, mixer, extras } }
 * articuloId/slug combo-personalizado-* no se envían al API de pedidos.
 */

const getExtraIds = (item) => {
  const ex = item.extrasSeleccionados ?? item.extras ?? [];
  return [...ex]
    .map((e) => (typeof e === "object" && e != null && "id" in e ? e.id : Number(e)))
    .sort((a, b) => a - b);
};

const areSameExtras = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
};

const getItemQuantity = (item) => item.cantidad ?? item.quantity ?? 1;

const getExtrasPriceSum = (item) => {
  const ex = item.extrasSeleccionados ?? item.extras ?? [];
  return ex.reduce((acc, e) => {
    const p = typeof e === "object" && e != null ? (e.precioExtra ?? e.precio ?? 0) : 0;
    return acc + Number(p);
  }, 0);
};

export const getItemUnitPrice = (item) => {
  if (item.precioUnitario != null) return Number(item.precioUnitario);
  return Number(item.precioBase ?? 0) + getExtrasPriceSum(item);
};

export const getItemSubtotal = (item) => {
  if (item.subtotal != null) return Number(item.subtotal);
  return getItemUnitPrice(item) * getItemQuantity(item);
};

// --- Selectors ---
export const selectCartItems = (state) => state.items;
export const selectCartTotal = (state) =>
  state.items.reduce((acc, item) => acc + getItemSubtotal(item), 0);
export const selectCartCount = (state) =>
  state.items.reduce((acc, item) => acc + getItemQuantity(item), 0);

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      searchQuery: "",

      addItem: (item) => {
        set((state) => {
          const incomingExtras = item.extrasSeleccionados ?? [];
          const incomingIds = getExtraIds({ extrasSeleccionados: incomingExtras });

          const existingIndex = state.items.findIndex((current) => {
            if (
              current.lineKind === CUSTOM_COMBO_LINE_KIND ||
              item.lineKind === CUSTOM_COMBO_LINE_KIND
            ) {
              return false;
            }
            const currentIds = getExtraIds(current);
            return (
              current.slug === item.slug &&
              (current.articuloId ?? current.slug) === (item.articuloId ?? item.slug) &&
              areSameExtras(currentIds, incomingIds)
            );
          });

          const cantidad = item.cantidad ?? 1;
          const precioBase = Number(item.precioBase ?? 0);
          const extrasSum = incomingExtras.reduce(
            (acc, e) => acc + Number(e.precioExtra ?? e.precio ?? 0),
            0
          );
          const precioUnitario = precioBase + extrasSum;
          const subtotal = precioUnitario * cantidad;

          const newItem = {
            id: item.id ?? `${item.articuloId ?? item.slug}-${Date.now()}`,
            articuloId: item.articuloId ?? (item.slug ? Number(item.slug) || item.slug : null),
            slug: item.slug ?? String(item.articuloId ?? ""),
            nombre: item.nombre ?? "Producto",
            precioBase,
            extrasSeleccionados: incomingExtras,
            observaciones: item.observaciones ?? "",
            cantidad,
            precioUnitario,
            subtotal,
            categoria_nombre: item.categoria_nombre ?? null,
            imagen_url: item.imagen_url ?? null,
            ...(item.lineKind ? { lineKind: item.lineKind } : {}),
            ...(item.comboComponents ? { comboComponents: item.comboComponents } : {}),
          };

          if (existingIndex !== -1) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            const nextCantidad = getItemQuantity(existing) + cantidad;
            const existingUnitPrice = getItemUnitPrice(existing);

            updatedItems[existingIndex] = {
              ...existing,
              cantidad: nextCantidad,
              quantity: nextCantidad,
              subtotal: existingUnitPrice * nextCantidad,
            };

            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== id) };
          }
          return {
            items: state.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    cantidad: quantity,
                    quantity: quantity,
                    subtotal: getItemUnitPrice(item) * quantity,
                  }
                : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      setSearchQuery: (value) => set({ searchQuery: value }),
      clearSearch: () => set({ searchQuery: "" }),
    }),
    {
      name: appConfig.cart.storageKey,
      partialize: (state) => ({ items: state.items }),
    }
  )
);
