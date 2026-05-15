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
 *   addresses: [{ id, direccion, alias, savedAt }],
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
      saveFromOrder: ({ nombre, telefono, email, direccion }) => {
        const cleanNombre = safeString(nombre);
        const cleanTel = safeString(telefono);
        const cleanEmail = safeString(email);
        const cleanDir = safeString(direccion);

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
