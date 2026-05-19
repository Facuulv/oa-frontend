import { create } from "zustand";
import { authLogin, authMe, authLogout, authRegisterCliente } from "@/services/authSessionService";
import { clearLegacyClientToken } from "@/utils/auth/token";
import { useUserDataStore } from "@/store/useUserDataStore";

let validateSessionPromise = null;

function usuarioFromPayload(data) {
  if (!data || typeof data !== "object") return null;
  return data.usuario ?? data.user ?? null;
}

/** Nunca persistir datos sensibles del backend en el store. */
function sanitizeSessionUser(raw) {
  if (!raw || typeof raw !== "object") return null;
  const out = { ...raw };
  delete out.password_hash;
  delete out.username;
  return out;
}

function applyUsuario(set, user) {
  const safe = sanitizeSessionUser(user);
  if (!safe) {
    set({ user: null, isAuthenticated: false });
    return;
  }
  set({ user: safe, isAuthenticated: true });
  if (safe.origen === "CLIENTE") {
    useUserDataStore.getState().syncFromAuthUser(safe);
  }
}

function devAuthLog(message, extra) {
  if (process.env.NODE_ENV !== "development") return;
  if (typeof extra === "undefined") {
    console.info(`[auth] ${message}`);
    return;
  }
  console.info(`[auth] ${message}`, extra);
}

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  isLoading: false,
  error: null,
  hasValidatedSession: false,

  clearSession: () => {
    clearLegacyClientToken();
    set({ user: null, isAuthenticated: false, error: null });
  },

  onUnauthorized: () => {
    get().clearSession();
    set({ loading: false, hasValidatedSession: true });
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authLogin({ email, password });
      clearLegacyClientToken();
      const user = sanitizeSessionUser(usuarioFromPayload(data));

      if (user && user.activo === false) {
        get().clearSession();
        throw new Error("Cuenta inactiva");
      }

      if (data?.ok === true && user) {
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        return data;
      }

      set({ isLoading: false, error: null });
      get().clearSession();
      throw new Error("No pudimos iniciar sesión");
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  validateSession: async ({ force = false } = {}) => {
    const state = get();
    if (!force && state.hasValidatedSession && !state.loading) return;
    if (validateSessionPromise) return validateSessionPromise;

    set({ loading: true });
    devAuthLog("validateSession start");

    validateSessionPromise = (async () => {
      try {
        const data = await authMe();
        applyUsuario(set, usuarioFromPayload(data));
        devAuthLog("validateSession success");
      } catch (error) {
        const status = Number(error?.status ?? error?.response?.status);
        if (status === 401) {
          get().clearSession();
          devAuthLog("validateSession 401");
        } else {
          get().clearSession();
          devAuthLog("validateSession error", error);
        }
      } finally {
        set({ loading: false, hasValidatedSession: true });
        devAuthLog("validateSession end");
        validateSessionPromise = null;
      }
    })();

    return validateSessionPromise;
  },

  /**
   * @param {object} payload — { nombre, apellido, dni, email, password, telefono? }
   * @param {{ autoLogin?: boolean }} [options]
   */
  register: async (payload, options = {}) => {
    const { autoLogin = true } = options;
    set({ isLoading: true, error: null });
    try {
      const data = await authRegisterCliente({ ...payload, useCookie: autoLogin });
      clearLegacyClientToken();
      const user = sanitizeSessionUser(usuarioFromPayload(data));
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
    set({ loading: false, hasValidatedSession: true });
  },

  /** @deprecated Usar validateSession(). */
  refreshProfile: async () => {
    await get().validateSession();
  },

  clearError: () => set({ error: null }),
}));

export const selectAuthUser = (state) => state.user;
export const selectIsAuthenticated = (state) => Boolean(state.user);
export const selectIsSessionLoaded = (state) => state.hasValidatedSession && !state.loading;
export const selectAuthLoading = (state) => state.loading;
export const selectAuthSessionGateReady = (state) => !state.loading;

/**
 * Personal interno (`usuarios`): sesión con `origen: "ADMIN"` (ADMIN, ENCARGADO o VENDEDOR).
 */
export function selectIsPanelStaffUser(state) {
  return state.user?.origen === "ADMIN";
}

/** Rol de panel en mayúsculas o cadena vacía. */
export function selectAdminPanelRole(state) {
  const r = state.user?.rol ?? state.user?.role;
  return r ? String(r).toUpperCase() : "";
}

/**
 * Puede usar rutas `/admin/*`: solo ADMIN o ENCARGADO (VENDEDOR excluido).
 */
export function selectCanAccessAdminPanel(state) {
  if (!selectIsPanelStaffUser(state)) return false;
  const role = selectAdminPanelRole(state);
  return role === "ADMIN" || role === "ENCARGADO";
}

/**
 * Puede gestionar el módulo Usuarios (`/users`): solo rol ADMIN.
 */
export function selectCanManageUsers(state) {
  return selectIsPanelStaffUser(state) && selectAdminPanelRole(state) === "ADMIN";
}

/**
 * Rol ADMIN (APIs que siguen exigiendo administrador en backend).
 */
export function selectIsAdminRole(state) {
  return selectIsPanelStaffUser(state) && selectAdminPanelRole(state) === "ADMIN";
}

/**
 * @deprecated Usar `selectCanAccessAdminPanel`.
 */
export function selectIsAdminUser(state) {
  return selectCanAccessAdminPanel(state);
}

export function selectIsClienteUser(state) {
  return state.user?.origen === "CLIENTE";
}

/** Sesión autenticada estrictamente para área cliente (carta pública + mi cuenta). */
export function selectIsAuthenticatedCliente(state) {
  return selectIsAuthenticated(state) && selectIsClienteUser(state);
}
