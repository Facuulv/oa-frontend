import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Persiste los datos del usuario para pre-completar el checkout
 * y poder ofrecerle direcciones guardadas en futuros pedidos.
 *
 * Llave de localStorage: `user_data`
 *
 * Forma del estado:
 * {
 *   profile: { nombre, telefono, email },
 *   addresses: [{ id, direccion, lat, lng, alias, savedAt }],
 * }
 */
const MAX_ADDRESSES = 5;

const safeString = (v) => String(v ?? "").trim();
const sameAddress = (a, b) =>
  safeString(a).toLowerCase() === safeString(b).toLowerCase();

export const useUserDataStore = create(
  persist(
    (set, get) => ({
      profile: { nombre: "", telefono: "", email: "" },
      addresses: [],

      /**
       * Snapshot del usuario tras confirmar un pedido.
       * Persiste nombre/teléfono/email y agrega la dirección al historial.
       */
      saveFromOrder: ({ nombre, telefono, email, direccion, lat, lng }) => {
        const cleanNombre = safeString(nombre);
        const cleanTel = safeString(telefono);
        const cleanEmail = safeString(email);
        const cleanDir = safeString(direccion);
        const safeLat = Number.isFinite(lat) ? Number(lat) : null;
        const safeLng = Number.isFinite(lng) ? Number(lng) : null;

        set((state) => {
          const nextProfile = {
            nombre: cleanNombre || state.profile.nombre,
            telefono: cleanTel || state.profile.telefono,
            email: cleanEmail || state.profile.email,
          };

          let nextAddresses = state.addresses;
          if (cleanDir.length > 0) {
            const exists = state.addresses.some((a) => sameAddress(a.direccion, cleanDir));
            if (!exists) {
              const entry = {
                id: `addr-${Date.now()}`,
                direccion: cleanDir,
                lat: safeLat,
                lng: safeLng,
                alias: "",
                savedAt: Date.now(),
              };
              nextAddresses = [entry, ...state.addresses].slice(0, MAX_ADDRESSES);
            }
          }

          return { profile: nextProfile, addresses: nextAddresses };
        });

        return get();
      },

      removeAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        })),

      /**
       * Sincroniza perfil local desde sesión autenticada (fuente de verdad en DB).
       */
      syncFromAuthUser: (user) => {
        if (!user || typeof user !== "object") return;
        const nombre = safeString(user.nombre ?? user.name);
        const email = safeString(user.email);
        const telefono = safeString(user.telefono);
        set({
          profile: { nombre, email, telefono },
        });
      },

      clearUserData: () =>
        set({ profile: { nombre: "", telefono: "", email: "" }, addresses: [] }),
    }),
    {
      name: "user_data",
      partialize: (state) => ({ profile: state.profile, addresses: state.addresses }),
    }
  )
);

export const selectUserProfile = (state) => state.profile;
export const selectUserAddresses = (state) => state.addresses;
export const selectPrimaryAddress = (state) => state.addresses[0]?.direccion ?? "";
