import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginApi, register as registerApi, me as meApi } from "@/services/authService";
import { setToken, removeToken, getToken } from "@/utils/auth/token";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const data = await loginApi({ email, password });
          const token = data.token ?? data.accessToken;
          if (!token) {
            throw new Error("Respuesta de login inválida: sin token");
          }
          setToken(token);
          set({
            user: data.user ?? data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return data;
        } catch (err) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      /**
       * @param {object} payload — register body { nombre, apellido, email, password }
       * @param {{ autoLogin?: boolean }} [options] — si el backend no devuelve token, intenta login
       */
      register: async (payload, options = {}) => {
        const { autoLogin = true } = options;
        set({ isLoading: true, error: null });
        try {
          const data = await registerApi(payload);
          let token = data.token ?? data.accessToken;
          if (token) {
            setToken(token);
            set({
              user: data.user ?? data,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return data;
          }
          if (autoLogin && payload?.email && payload?.password) {
            await get().login({ email: payload.email, password: payload.password });
            return data;
          }
          set({ isLoading: false, error: null });
          return data;
        } catch (err) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      logout: () => {
        removeToken();
        set({ user: null, isAuthenticated: false, error: null });
      },

      refreshProfile: async () => {
        const token = getToken();
        if (!token) return;
        try {
          const data = await meApi();
          set({ user: data.user ?? data, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "oa-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const selectUser = (state) => state.user;
export const selectIsAuthenticated = (state) => state.isAuthenticated;
export const selectIsAdmin = (state) => {
  const role = state.user?.role ?? state.user?.rol;
  if (!role) return false;
  return String(role).toUpperCase() === "ADMIN";
};
