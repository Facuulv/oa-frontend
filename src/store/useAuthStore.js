import { create } from "zustand";
import { authLogin, authMe, authLogout, authRegisterCliente } from "@/services/authSessionService";
import { clearLegacyClientToken } from "@/utils/auth/token";

function usuarioFromPayload(data) {
  if (!data || typeof data !== "object") return null;
  return data.usuario ?? data.user ?? null;
}

function applyUsuario(set, user) {
  if (!user) {
    set({ user: null, isAuthenticated: false });
    return;
  }
  set({ user, isAuthenticated: true });
}

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  /** true luego de la primera resolución vía `GET /auth/me` (o fallo controlado). */
  sessionGateReady: false,

  clearSession: () => {
    clearLegacyClientToken();
    set({ user: null, isAuthenticated: false, error: null });
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authLogin({ email, password });
      clearLegacyClientToken();
      const user = usuarioFromPayload(data);
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false, error: null });
      } else {
        await get().refreshProfile();
        set({ isLoading: false, error: null });
      }
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  /**
   * @param {object} payload — { nombre, apellido, email, password, telefono? }
   * @param {{ autoLogin?: boolean }} [options]
   */
  register: async (payload, options = {}) => {
    const { autoLogin = true } = options;
    set({ isLoading: true, error: null });
    try {
      const data = await authRegisterCliente({ ...payload, useCookie: autoLogin });
      clearLegacyClientToken();
      const user = usuarioFromPayload(data);
      if (autoLogin && user) {
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        return data;
      }
      if (autoLogin && payload?.email && payload?.password) {
        await get().login({ email: payload.email, password: payload.password });
        return data;
      }
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authLogout();
    } catch {
      // cookies ya inválidas o red caída
    }
    get().clearSession();
  },

  refreshProfile: async () => {
    try {
      const data = await authMe();
      applyUsuario(set, usuarioFromPayload(data));
    } catch {
      get().clearSession();
    }
  },

  clearError: () => set({ error: null }),
}));

export const selectAuthUser = (state) => state.user;
export const selectIsAuthenticated = (state) => state.isAuthenticated;
export const selectAuthSessionGateReady = (state) => state.sessionGateReady;

export function selectIsAdminUser(state) {
  const u = state.user;
  if (!u || u.origen !== "ADMIN") return false;
  const role = u.rol ?? u.role;
  if (!role) return false;
  return String(role).toUpperCase() === "ADMIN";
}

export function selectIsClienteUser(state) {
  return state.user?.origen === "CLIENTE";
}
