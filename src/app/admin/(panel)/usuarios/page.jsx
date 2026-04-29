"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  KeyRound,
  Loader2,
  Pencil,
  Power,
  RefreshCw,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { z } from "zod";
import { toast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import AppSelect from "@/components/ui/AppSelect";
import AdminListPagination from "@/components/admin/AdminListPagination";
import FiltersPanel from "@/components/common/FiltersPanel";
import { useScrollListTopOnPagination } from "@/hooks/admin/useScrollIntoViewOnPageChange";
import { useAuthStore, selectCanManageUsers } from "@/store/useAuthStore";
import { useAdminUsuariosList } from "@/hooks/admin/useAdminUsuariosList";
import {
  ADMIN_USUARIO_CODES,
  createUsuario,
  updateUsuario,
  changeUsuarioPassword,
  deactivateUsuario,
} from "@/services/adminUsuariosService";
import { ApiError } from "@/utils/api/apiError";
import {
  validateDni,
  validateEmail,
  validateLastName,
  validateName,
  validatePhone,
} from "@/lib/validations";

const LIST_STAGGER_MS = 48;
/** Listado admin mobile-first: 1 card por fila, 4 por página. */
const PAGE_SIZE = 4;
const SEARCH_DEBOUNCE_MS = 350;
const ROLE_FILTER_ALL = "__all__";

const ROLES = ["ADMIN", "ENCARGADO", "VENDEDOR"];

const ROLE_LABEL = {
  ADMIN: "Administrador",
  ENCARGADO: "Encargado",
  VENDEDOR: "Vendedor",
};

const ROLE_BADGE_CLASS = {
  ADMIN: "bg-violet-100 text-violet-900 ring-violet-200/80",
  ENCARGADO: "bg-sky-100 text-sky-900 ring-sky-200/80",
  VENDEDOR: "bg-zinc-200 text-zinc-800 ring-zinc-300/70",
};

const staffRoleEnum = z.enum(["ADMIN", "ENCARGADO", "VENDEDOR"]);

const createUserFormSchema = z
  .object({
    nombre: z
      .string()
      .min(2, "El nombre es obligatorio (mínimo 2 caracteres)")
      .max(100)
      .superRefine((value, ctx) => {
        const r = validateName(value);
        if (!r.valid) ctx.addIssue(r.message);
      }),
    apellido: z
      .string()
      .min(2, "El apellido es obligatorio (mínimo 2 caracteres)")
      .max(100)
      .superRefine((value, ctx) => {
        const r = validateLastName(value);
        if (!r.valid) ctx.addIssue(r.message);
      }),
    dni: z
      .string()
      .max(32)
      .optional()
      .or(z.literal(""))
      .superRefine((value, ctx) => {
        const r = validateDni(value, { required: false });
        if (!r.valid) ctx.addIssue(r.message);
      }),
    email: z
      .string()
      .min(1, "El email es obligatorio")
      .superRefine((value, ctx) => {
        const r = validateEmail(value, { required: true });
        if (!r.valid) ctx.addIssue(r.message);
      }),
    telefono: z
      .string()
      .max(20)
      .optional()
      .or(z.literal(""))
      .superRefine((value, ctx) => {
        const r = validatePhone(value, { required: false });
        if (!r.valid) ctx.addIssue(r.message);
      }),
    rol: staffRoleEnum,
    password: z.string().min(1, "La contraseña es obligatoria").min(6, "Mínimo 6 caracteres").max(128),
    confirmPassword: z.string().min(1, "Confirmá la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const editUserFormSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre es obligatorio (mínimo 2 caracteres)")
    .max(100)
    .superRefine((value, ctx) => {
      const r = validateName(value);
      if (!r.valid) ctx.addIssue(r.message);
    }),
  apellido: z
    .string()
    .min(2, "El apellido es obligatorio (mínimo 2 caracteres)")
    .max(100)
    .superRefine((value, ctx) => {
      const r = validateLastName(value);
      if (!r.valid) ctx.addIssue(r.message);
    }),
  dni: z
    .string()
    .max(32)
    .optional()
    .or(z.literal(""))
    .superRefine((value, ctx) => {
      const r = validateDni(value, { required: false });
      if (!r.valid) ctx.addIssue(r.message);
    }),
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .superRefine((value, ctx) => {
      const r = validateEmail(value, { required: true });
      if (!r.valid) ctx.addIssue(r.message);
    }),
  telefono: z
    .string()
    .max(20)
    .optional()
    .or(z.literal(""))
    .superRefine((value, ctx) => {
      const r = validatePhone(value, { required: false });
      if (!r.valid) ctx.addIssue(r.message);
    }),
  rol: staffRoleEnum,
  activo: z.coerce.boolean(),
});

const passwordFormSchema = z
  .object({
    password: z.string().min(1, "La contraseña es obligatoria").min(6, "Mínimo 6 caracteres").max(128),
    confirmPassword: z.string().min(1, "Confirmá la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const defaultCreateValues = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  rol: "VENDEDOR",
  password: "",
  confirmPassword: "",
};

const CREATE_SERVER_FIELDS = ["nombre", "apellido", "dni", "email", "telefono", "rol", "password"];
const EDIT_SERVER_FIELDS = ["nombre", "apellido", "dni", "email", "telefono", "rol", "activo"];

const fieldBase =
  "min-h-12 w-full rounded-xl border px-3 py-3 text-base text-zinc-900 outline-none transition-shadow ring-primary ring-offset-2 ring-offset-white focus:ring-2";
const fieldOk = "border-zinc-200 bg-white";
const fieldErr = "border-red-300 bg-red-50/30 ring-red-200/60";

function errorMessage(err, fallback) {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message;
  return fallback;
}

function isUnauthorizedApi(err) {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

function humanLoadError(err) {
  if (err instanceof ApiError) {
    if (isUnauthorizedApi(err)) {
      return "No tenés permiso para ver los usuarios. Volvé a iniciar sesión si hace falta.";
    }
    if (err.status === 404) {
      return "No encontramos el recurso. Si el problema sigue, contactá al administrador.";
    }
    if (err.status >= 500) {
      return "El servidor no respondió bien. Reintentá en unos segundos.";
    }
    return err.message || "No se pudieron cargar los usuarios.";
  }
  if (err instanceof Error && err.message) {
    return `No se pudieron cargar los usuarios. (${err.message})`;
  }
  return "No se pudieron cargar los usuarios. Comprobá tu conexión.";
}

function applyServerFieldErrors(form, apiError, allowed) {
  if (!(apiError instanceof ApiError) || !apiError.fieldErrors) return;
  for (const [key, message] of Object.entries(apiError.fieldErrors)) {
    if (allowed.includes(key)) {
      form.setError(key, { type: "server", message });
    }
  }
}

function mapUsuarioToEditForm(row) {
  return {
    nombre: row.nombre ?? "",
    apellido: row.apellido ?? "",
    dni: row.dni != null ? String(row.dni) : "",
    email: row.email ?? "",
    telefono: row.telefono ?? "",
    rol: row.rol && ROLES.includes(row.rol) ? row.rol : "VENDEDOR",
    activo: Boolean(row.activo),
  };
}

function formatFechaCreacion(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return String(iso);
  }
}

function roleBadgeClass(rol) {
  return ROLE_BADGE_CLASS[rol] ?? "bg-zinc-200 text-zinc-800 ring-zinc-300/70";
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const canManageUsers = useAuthStore(selectCanManageUsers);
  const redirectDone = useRef(false);

  useEffect(() => {
    if (canManageUsers || redirectDone.current) return;
    redirectDone.current = true;
    toast.error("No tenés permiso para gestionar usuarios.");
    router.replace("/admin");
  }, [canManageUsers, router]);

  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id != null ? Number(currentUser.id) : null;

  const [page, setPage] = useState(1);
  const listTopRef = useRef(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [q, setQ] = useState("");
  const [rolFiltro, setRolFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("all");

  useEffect(() => {
    const t = window.setTimeout(() => setQ(searchDraft), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchDraft]);

  useEffect(() => {
    setPage(1);
  }, [q, rolFiltro, estadoFiltro]);

  const { items, pagination, loadError, load, loadingInitial, listRefreshing } = useAdminUsuariosList({
    page,
    pageSize: PAGE_SIZE,
    q,
    rol: rolFiltro,
    estadoActivo: estadoFiltro,
    enabled: canManageUsers,
  });

  useScrollListTopOnPagination({
    listRef: listTopRef,
    page,
    waitForRefresh: true,
    listRefreshing,
    loadingInitial,
    loadError,
  });

  const loadErrorMessage = loadError ? humanLoadError(loadError) : "";

  const hasActiveFilters = Boolean(q.trim()) || Boolean(rolFiltro) || estadoFiltro !== "all";

  const catalogoVacio = !loadingInitial && !loadError && items.length === 0 && !hasActiveFilters;
  const vacioPorFiltros = !loadingInitial && !loadError && items.length === 0 && hasActiveFilters;

  const lim = Math.max(1, pagination.limit || PAGE_SIZE);
  const totalPages =
    pagination.total > 0 ? Math.max(1, Math.ceil(pagination.total / lim)) : 1;

  useEffect(() => {
    if (loadingInitial || loadError || !canManageUsers) return;
    if (pagination.total > 0 && page > totalPages) {
      setPage(totalPages);
      return;
    }
    if (pagination.total === 0 && page !== 1) {
      setPage(1);
    }
  }, [loadingInitial, loadError, canManageUsers, page, pagination.total, totalPages]);

  const limpiarFiltros = () => {
    setSearchDraft("");
    setQ("");
    setRolFiltro("");
    setEstadoFiltro("all");
    setPage(1);
  };

  const filtrosPredeterminados = !searchDraft.trim() && !rolFiltro && estadoFiltro === "all";

  const filtersValues = useMemo(
    () => ({
      busqueda: searchDraft,
      rol: rolFiltro || ROLE_FILTER_ALL,
      estado: estadoFiltro,
    }),
    [searchDraft, rolFiltro, estadoFiltro],
  );

  const filtersConfig = useMemo(
    () => [
      {
        type: "search",
        name: "busqueda",
        label: "Buscar",
        placeholder: "Nombre, apellido, email, DNI o teléfono…",
        defaultValue: "",
      },
      {
        type: "select",
        name: "rol",
        label: "Rol",
        defaultValue: ROLE_FILTER_ALL,
        options: [
          { value: ROLE_FILTER_ALL, label: "Todos los roles" },
          ...ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] })),
        ],
      },
      {
        type: "select",
        name: "estado",
        label: "Estado",
        defaultValue: "all",
        options: [
          { value: "all", label: "Todos" },
          { value: "true", label: "Activos" },
          { value: "false", label: "Inactivos" },
        ],
      },
    ],
    [],
  );

  const handleFiltersChange = useCallback((name, value) => {
    switch (name) {
      case "busqueda":
        setSearchDraft(String(value));
        break;
      case "rol":
        setRolFiltro(value === ROLE_FILTER_ALL ? "" : String(value));
        break;
      case "estado":
        setEstadoFiltro(String(value));
        break;
      default:
        break;
    }
  }, []);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);

  const [editingRow, setEditingRow] = useState(null);
  const [passwordRow, setPasswordRow] = useState(null);
  const [deactivateRow, setDeactivateRow] = useState(null);

  const [savingCreate, setSavingCreate] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const createForm = useForm({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: defaultCreateValues,
  });

  const editForm = useForm({
    resolver: zodResolver(editUserFormSchema),
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const openCreate = () => {
    createForm.reset(defaultCreateValues);
    createForm.clearErrors();
    setCreateOpen(true);
  };

  const closeCreate = () => {
    createForm.clearErrors();
    setCreateOpen(false);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    editForm.reset(mapUsuarioToEditForm(row));
    editForm.clearErrors();
    setEditOpen(true);
  };

  const closeEdit = () => {
    editForm.clearErrors();
    setEditOpen(false);
    setEditingRow(null);
  };

  const openPassword = (row) => {
    setPasswordRow(row);
    passwordForm.reset({ password: "", confirmPassword: "" });
    passwordForm.clearErrors();
    setPasswordOpen(true);
  };

  const closePassword = () => {
    passwordForm.clearErrors();
    setPasswordOpen(false);
    setPasswordRow(null);
  };

  const requestDeactivate = (row) => {
    if (row.activo && currentUserId != null && Number(row.id) === currentUserId) {
      toast.error("No podés desactivar tu propia cuenta desde acá.");
      return;
    }
    setDeactivateRow(row);
    setConfirmDeactivateOpen(true);
  };

  const closeConfirmDeactivate = () => {
    setConfirmDeactivateOpen(false);
    setDeactivateRow(null);
  };

  const onSubmitCreate = createForm.handleSubmit(async (values) => {
    createForm.clearErrors();
    setSavingCreate(true);
    try {
      const dniTrim = values.dni.trim();
      const telTrim = values.telefono.trim();
      await createUsuario({
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        email: values.email.trim(),
        password: values.password,
        rol: values.rol,
        dni: dniTrim === "" ? null : dniTrim,
        telefono: telTrim === "" ? null : telTrim,
      });
      toast.success("Usuario creado");
      closeCreate();
      await load();
    } catch (e) {
      if (e instanceof ApiError) {
        applyServerFieldErrors(createForm, e, CREATE_SERVER_FIELDS);
        if (e.code === ADMIN_USUARIO_CODES.EMAIL_EXISTS) {
          toast.error("El email ya está registrado");
          createForm.setError("email", { type: "server", message: e.message || "Email duplicado" });
          return;
        }
        if (e.code === ADMIN_USUARIO_CODES.DNI_EXISTS) {
          toast.error("El DNI ya está registrado");
          createForm.setError("dni", { type: "server", message: e.message || "DNI duplicado" });
          return;
        }
        if (isUnauthorizedApi(e)) {
          toast.error("No tenés permiso", { description: e.message });
          return;
        }
        toast.error(errorMessage(e, "No se pudo crear el usuario"));
      } else {
        toast.error(errorMessage(e, "No se pudo crear el usuario"));
      }
    } finally {
      setSavingCreate(false);
    }
  }, () => {
    toast.error("Revisá los campos marcados.");
  });

  const onSubmitEdit = editForm.handleSubmit(async (values) => {
    if (!editingRow) return;
    editForm.clearErrors();
    setSavingEdit(true);
    try {
      const dniTrim = values.dni.trim();
      const telTrim = values.telefono.trim();
      await updateUsuario(editingRow.id, {
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        email: values.email.trim(),
        rol: values.rol,
        activo: values.activo,
        dni: dniTrim === "" ? null : dniTrim,
        telefono: telTrim === "" ? null : telTrim,
      });
      toast.success("Usuario actualizado");
      closeEdit();
      await load();
    } catch (e) {
      if (e instanceof ApiError) {
        applyServerFieldErrors(editForm, e, EDIT_SERVER_FIELDS);
        if (e.code === ADMIN_USUARIO_CODES.USER_NOT_FOUND) {
          toast.error("Ese usuario ya no existe");
          closeEdit();
          await load();
          return;
        }
        if (e.code === ADMIN_USUARIO_CODES.EMAIL_EXISTS) {
          toast.error("El email ya está registrado");
          editForm.setError("email", { type: "server", message: e.message || "Email duplicado" });
          return;
        }
        if (e.code === ADMIN_USUARIO_CODES.DNI_EXISTS) {
          toast.error("El DNI ya está registrado");
          editForm.setError("dni", { type: "server", message: e.message || "DNI duplicado" });
          return;
        }
        if (e.code === ADMIN_USUARIO_CODES.LAST_ACTIVE_ADMIN_DEACTIVATE) {
          toast.error(e.message || "No se puede desactivar al único administrador activo");
          return;
        }
        if (e.code === ADMIN_USUARIO_CODES.LAST_ACTIVE_ADMIN_ROLE) {
          toast.error(e.message || "No se puede cambiar el rol del único administrador activo");
          return;
        }
        if (e.code === ADMIN_USUARIO_CODES.SELF_DEACTIVATE_FORBIDDEN) {
          toast.error(e.message || "No podés desactivar tu propia cuenta");
          return;
        }
        if (isUnauthorizedApi(e)) {
          toast.error("No tenés permiso", { description: e.message });
          return;
        }
        toast.error(errorMessage(e, "No se pudo guardar"));
      } else {
        toast.error(errorMessage(e, "No se pudo guardar"));
      }
    } finally {
      setSavingEdit(false);
    }
  }, () => {
    toast.error("Revisá los campos marcados.");
  });

  const onSubmitPassword = passwordForm.handleSubmit(async (values) => {
    if (!passwordRow) return;
    passwordForm.clearErrors();
    setSavingPassword(true);
    try {
      await changeUsuarioPassword(passwordRow.id, values.password);
      toast.success("Contraseña actualizada");
      closePassword();
      await load();
    } catch (e) {
      if (e instanceof ApiError) {
        applyServerFieldErrors(passwordForm, e, ["password"]);
        if (e.code === ADMIN_USUARIO_CODES.USER_NOT_FOUND) {
          toast.error("Ese usuario ya no existe");
          closePassword();
          await load();
          return;
        }
        if (isUnauthorizedApi(e)) {
          toast.error("No tenés permiso", { description: e.message });
          return;
        }
        toast.error(errorMessage(e, "No se pudo cambiar la contraseña"));
      } else {
        toast.error(errorMessage(e, "No se pudo cambiar la contraseña"));
      }
    } finally {
      setSavingPassword(false);
    }
  });

  const confirmDeactivate = useCallback(async () => {
    if (!deactivateRow?.id) return;
    setTogglingId(deactivateRow.id);
    try {
      await deactivateUsuario(deactivateRow.id);
      toast.success("Usuario desactivado");
      closeConfirmDeactivate();
      await load();
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === ADMIN_USUARIO_CODES.LAST_ACTIVE_ADMIN_DEACTIVATE) {
          toast.error(e.message || "No se puede desactivar al único administrador activo");
        } else if (e.code === ADMIN_USUARIO_CODES.SELF_DEACTIVATE_FORBIDDEN) {
          toast.error(e.message || "No podés desactivar tu propia cuenta");
        } else if (isUnauthorizedApi(e)) {
          toast.error("No tenés permiso", { description: e.message });
        } else {
          toast.error(errorMessage(e, "No se pudo desactivar"));
        }
      } else {
        toast.error(errorMessage(e, "No se pudo desactivar"));
      }
    } finally {
      setTogglingId(null);
    }
  }, [deactivateRow, load]);

  const handleToggleActivo = async (row) => {
    if (row.activo) {
      requestDeactivate(row);
      return;
    }
    setTogglingId(row.id);
    try {
      await updateUsuario(row.id, { activo: true });
      toast.success("Usuario activado");
      await load();
    } catch (e) {
      if (e instanceof ApiError) {
        toast.error(errorMessage(e, "No se pudo activar"));
      } else {
        toast.error(errorMessage(e, "No se pudo activar"));
      }
    } finally {
      setTogglingId(null);
    }
  };

  const listBusy = loadingInitial || Boolean(loadError);
  const createErrs = createForm.formState.errors;
  const editErrs = editForm.formState.errors;
  const pwdErrs = passwordForm.formState.errors;

  if (!canManageUsers) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 py-16 text-center text-sm text-zinc-500">
        <Loader2 className="h-8 w-8 shrink-0 animate-spin text-primary" aria-hidden />
        <p>Redirigiendo al panel…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <header className="admin-quick-card-enter flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin"
            className="admin-pressable inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 active:bg-zinc-100"
            aria-label="Volver al panel"
            title="Volver al panel"
          >
            <ArrowLeft size={18} strokeWidth={2.25} aria-hidden />
          </Link>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold tracking-tight text-zinc-900">Usuarios</h2>
            <p className="mt-0.5 text-xs font-medium text-zinc-500">Gestioná los usuarios con acceso al panel.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={listBusy}
          className="admin-pressable inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-semibold text-white shadow-sm enabled:hover:brightness-105 enabled:active:brightness-95 active:shadow-[0_1px_4px_rgba(0,0,0,0.2)] disabled:pointer-events-none disabled:opacity-45 sm:min-w-[200px]"
        >
          <UserPlus size={20} strokeWidth={2.25} aria-hidden />
          Nuevo usuario
        </button>
      </header>

      <FiltersPanel
        filters={filtersConfig}
        values={filtersValues}
        onChange={handleFiltersChange}
        onClear={limpiarFiltros}
        disabled={listRefreshing}
        clearDisabled={filtrosPredeterminados || listRefreshing}
      />

      {loadingInitial && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando usuarios">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[10rem] animate-pulse rounded-2xl bg-zinc-200/55 ring-1 ring-zinc-200/40 motion-reduce:animate-none"
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
          <p className="text-center text-sm text-zinc-500">Cargando usuarios…</p>
        </div>
      )}

      {!loadingInitial && loadError && (
        <div
          className="admin-quick-card-enter space-y-3 rounded-2xl border border-red-200/90 bg-red-50/95 p-5 text-sm text-red-950 shadow-sm ring-1 ring-red-200/50"
          role="alert"
        >
          <p className="text-base font-semibold text-red-900">No pudimos cargar el listado</p>
          <p className="leading-relaxed text-red-800/95">{loadErrorMessage}</p>
          <button
            type="button"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition motion-safe:active:scale-[0.985] active:bg-red-700 sm:w-auto"
            onClick={() => load()}
          >
            <RefreshCw size={18} aria-hidden />
            Reintentar
          </button>
        </div>
      )}

      {!loadingInitial && !loadError && listRefreshing && (
        <p
          className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-500"
          aria-live="polite"
        >
          <Loader2 className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
          Actualizando listado…
        </p>
      )}

      {!loadingInitial && !loadError && (
        <>
          {catalogoVacio && (
            <div className="admin-quick-card-enter flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-zinc-200/60">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                <Users size={28} strokeWidth={1.75} aria-hidden />
              </div>
              <p className="mt-5 text-base font-semibold text-zinc-900">No hay usuarios cargados.</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                Creá el primero con «Nuevo usuario» para dar acceso al panel.
              </p>
            </div>
          )}

          {vacioPorFiltros && (
            <div className="admin-quick-card-enter flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-zinc-200/60">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                <Search size={26} strokeWidth={1.75} aria-hidden />
              </div>
              <p className="mt-5 text-base font-semibold text-zinc-900">
                No se encontraron resultados con esos filtros.
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">Probá otra búsqueda o limpiá los filtros.</p>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {items.length > 0 && (
            <>
              <ul
                ref={listTopRef}
                className={`scroll-mt-4 flex flex-col gap-3 transition-opacity duration-200 ${listRefreshing ? "pointer-events-none opacity-55" : ""}`}
                aria-busy={listRefreshing}
              >
                {items.map((row, index) => {
                  const busy = togglingId === row.id;
                  const nombreCompleto = `${row.nombre ?? ""} ${row.apellido ?? ""}`.trim() || "Sin nombre";
                  const selfRow = currentUserId != null && Number(row.id) === currentUserId;
                  const disableSelfDeactivate = Boolean(row.activo && selfRow);

                  return (
                    <li
                      key={row.id}
                      className={`admin-quick-card-enter group rounded-2xl border p-4 shadow-sm ring-1 transition-[transform,box-shadow,background-color] duration-200 ease-out will-change-transform motion-safe:hover:shadow-md motion-safe:active:scale-[0.995] ${
                        row.activo
                          ? "border-zinc-200/90 bg-white ring-zinc-200/50 motion-safe:hover:ring-zinc-300/60"
                          : "border-zinc-300/80 bg-zinc-50/90 ring-zinc-300/40 motion-safe:hover:ring-zinc-400/50"
                      }`}
                      style={{ animationDelay: `${Math.min(index, 8) * LIST_STAGGER_MS}ms` }}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-base font-semibold leading-snug text-zinc-900">{nombreCompleto}</p>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${roleBadgeClass(row.rol)}`}
                            >
                              {ROLE_LABEL[row.rol] ?? row.rol}
                            </span>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                row.activo ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"
                              }`}
                            >
                              {row.activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </div>
                        <p className="break-all text-sm text-zinc-700">{row.email}</p>
                        {row.telefono ? (
                          <p className="text-sm text-zinc-600">
                            Tel.: <span className="font-medium text-zinc-800">{row.telefono}</span>
                          </p>
                        ) : null}
                        {row.dni != null && String(row.dni).trim() !== "" ? (
                          <p className="text-sm text-zinc-600">
                            DNI: <span className="font-medium text-zinc-800">{row.dni}</span>
                          </p>
                        ) : null}
                        <p className="text-xs font-medium text-zinc-500">
                          Creado: <span className="text-zinc-700">{formatFechaCreacion(row.fecha_creacion)}</span>
                        </p>
                      </div>

                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          disabled={busy}
                          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 transition motion-safe:active:scale-[0.985] enabled:active:bg-zinc-50 disabled:opacity-50"
                        >
                          <Pencil size={18} aria-hidden />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => openPassword(row)}
                          disabled={busy}
                          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 transition motion-safe:active:scale-[0.985] enabled:active:bg-zinc-50 disabled:opacity-50"
                        >
                          <KeyRound size={18} aria-hidden />
                          Cambiar contraseña
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActivo(row)}
                          disabled={busy || disableSelfDeactivate}
                          title={disableSelfDeactivate ? "No podés desactivar tu propia cuenta" : undefined}
                          className={
                            row.activo
                              ? "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800 transition motion-safe:active:scale-[0.985] enabled:active:bg-red-100/90 disabled:opacity-50"
                              : "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-900 transition motion-safe:active:scale-[0.985] enabled:active:bg-emerald-100/90 disabled:opacity-50"
                          }
                        >
                          {busy ? (
                            <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                          ) : (
                            <Power size={18} className="shrink-0" aria-hidden />
                          )}
                          {row.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <AdminListPagination
                page={page}
                totalPages={totalPages}
                busy={listRefreshing}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                ariaLabel="Paginación del listado de usuarios"
              />
            </>
          )}
        </>
      )}

      <Modal
        isOpen={createOpen}
        onClose={closeCreate}
        title="Nuevo usuario"
        closeDisabled={savingCreate}
        maxWidthClass="w-full max-w-lg sm:max-w-xl"
        closeOnBackdrop={false}
        animatePanelPop
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={closeCreate}
              disabled={savingCreate}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 outline-none ring-primary transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:min-w-[7.5rem] sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="admin-usuario-create-form"
              disabled={savingCreate}
              className="admin-pressable inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm outline-none ring-primary hover:brightness-105 focus-visible:ring-2 focus-visible:ring-offset-2 active:shadow-[0_1px_4px_rgba(0,0,0,0.18)] disabled:pointer-events-none disabled:opacity-60 sm:min-w-[11rem] sm:w-auto"
            >
              {savingCreate ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : null}
              Crear usuario
            </button>
          </div>
        }
      >
        <form id="admin-usuario-create-form" onSubmit={onSubmitCreate} className="flex flex-col gap-4" noValidate>
          {createErrs.root?.message ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">
              {createErrs.root.message}
            </p>
          ) : null}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="uc-nombre">
              Nombre <span className="text-red-600">*</span>
            </label>
            <input
              id="uc-nombre"
              data-modal-initial-focus
              autoComplete="given-name"
              className={`${fieldBase} ${createErrs.nombre ? fieldErr : fieldOk}`}
              {...createForm.register("nombre")}
            />
            {createErrs.nombre ? (
              <p className="text-xs font-medium text-red-600">{createErrs.nombre.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="uc-apellido">
              Apellido <span className="text-red-600">*</span>
            </label>
            <input
              id="uc-apellido"
              autoComplete="family-name"
              className={`${fieldBase} ${createErrs.apellido ? fieldErr : fieldOk}`}
              {...createForm.register("apellido")}
            />
            {createErrs.apellido ? (
              <p className="text-xs font-medium text-red-600">{createErrs.apellido.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="uc-dni">
              DNI
            </label>
            <input
              id="uc-dni"
              inputMode="numeric"
              autoComplete="off"
              className={`${fieldBase} ${createErrs.dni ? fieldErr : fieldOk}`}
              {...createForm.register("dni")}
            />
            {createErrs.dni ? <p className="text-xs font-medium text-red-600">{createErrs.dni.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="uc-email">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="uc-email"
              type="email"
              autoComplete="email"
              className={`${fieldBase} ${createErrs.email ? fieldErr : fieldOk}`}
              {...createForm.register("email")}
            />
            {createErrs.email ? (
              <p className="text-xs font-medium text-red-600">{createErrs.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="uc-tel">
              Teléfono
            </label>
            <input
              id="uc-tel"
              type="tel"
              autoComplete="tel"
              className={`${fieldBase} ${createErrs.telefono ? fieldErr : fieldOk}`}
              {...createForm.register("telefono")}
            />
            {createErrs.telefono ? (
              <p className="text-xs font-medium text-red-600">{createErrs.telefono.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="uc-rol">
              Rol <span className="text-red-600">*</span>
            </label>
            <AppSelect
              id="uc-rol"
              value={createForm.watch("rol")}
              onValueChange={(v) => createForm.setValue("rol", v, { shouldValidate: true, shouldDirty: true })}
              options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
              placeholder="Seleccioná un rol"
              error={Boolean(createErrs.rol)}
            />
            {createErrs.rol ? <p className="text-xs font-medium text-red-600">{createErrs.rol.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="uc-pass">
              Contraseña <span className="text-red-600">*</span>
            </label>
            <input
              id="uc-pass"
              type="password"
              autoComplete="new-password"
              className={`${fieldBase} ${createErrs.password ? fieldErr : fieldOk}`}
              {...createForm.register("password")}
            />
            {createErrs.password ? (
              <p className="text-xs font-medium text-red-600">{createErrs.password.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="uc-pass2">
              Confirmar contraseña <span className="text-red-600">*</span>
            </label>
            <input
              id="uc-pass2"
              type="password"
              autoComplete="new-password"
              className={`${fieldBase} ${createErrs.confirmPassword ? fieldErr : fieldOk}`}
              {...createForm.register("confirmPassword")}
            />
            {createErrs.confirmPassword ? (
              <p className="text-xs font-medium text-red-600">{createErrs.confirmPassword.message}</p>
            ) : null}
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={closeEdit}
        title="Editar usuario"
        closeDisabled={savingEdit}
        maxWidthClass="w-full max-w-lg sm:max-w-xl"
        closeOnBackdrop={false}
        animatePanelPop
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={closeEdit}
              disabled={savingEdit}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 outline-none ring-primary transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:min-w-[7.5rem] sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="admin-usuario-edit-form"
              disabled={savingEdit}
              className="admin-pressable inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm outline-none ring-primary hover:brightness-105 focus-visible:ring-2 focus-visible:ring-offset-2 active:shadow-[0_1px_4px_rgba(0,0,0,0.18)] disabled:pointer-events-none disabled:opacity-60 sm:min-w-[11rem] sm:w-auto"
            >
              {savingEdit ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : null}
              Guardar cambios
            </button>
          </div>
        }
      >
        <form id="admin-usuario-edit-form" onSubmit={onSubmitEdit} className="flex flex-col gap-4" noValidate>
          {editErrs.root?.message ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">
              {editErrs.root.message}
            </p>
          ) : null}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="ue-nombre">
              Nombre <span className="text-red-600">*</span>
            </label>
            <input
              id="ue-nombre"
              data-modal-initial-focus
              autoComplete="given-name"
              className={`${fieldBase} ${editErrs.nombre ? fieldErr : fieldOk}`}
              {...editForm.register("nombre")}
            />
            {editErrs.nombre ? <p className="text-xs font-medium text-red-600">{editErrs.nombre.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="ue-apellido">
              Apellido <span className="text-red-600">*</span>
            </label>
            <input
              id="ue-apellido"
              autoComplete="family-name"
              className={`${fieldBase} ${editErrs.apellido ? fieldErr : fieldOk}`}
              {...editForm.register("apellido")}
            />
            {editErrs.apellido ? (
              <p className="text-xs font-medium text-red-600">{editErrs.apellido.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="ue-dni">
              DNI
            </label>
            <input
              id="ue-dni"
              inputMode="numeric"
              autoComplete="off"
              className={`${fieldBase} ${editErrs.dni ? fieldErr : fieldOk}`}
              {...editForm.register("dni")}
            />
            {editErrs.dni ? <p className="text-xs font-medium text-red-600">{editErrs.dni.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="ue-email">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="ue-email"
              type="email"
              autoComplete="email"
              className={`${fieldBase} ${editErrs.email ? fieldErr : fieldOk}`}
              {...editForm.register("email")}
            />
            {editErrs.email ? <p className="text-xs font-medium text-red-600">{editErrs.email.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="ue-tel">
              Teléfono
            </label>
            <input
              id="ue-tel"
              type="tel"
              autoComplete="tel"
              className={`${fieldBase} ${editErrs.telefono ? fieldErr : fieldOk}`}
              {...editForm.register("telefono")}
            />
            {editErrs.telefono ? (
              <p className="text-xs font-medium text-red-600">{editErrs.telefono.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="ue-rol">
              Rol <span className="text-red-600">*</span>
            </label>
            <AppSelect
              id="ue-rol"
              value={editForm.watch("rol")}
              onValueChange={(v) => editForm.setValue("rol", v, { shouldValidate: true, shouldDirty: true })}
              options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
              placeholder="Rol"
              error={Boolean(editErrs.rol)}
            />
            {editErrs.rol ? <p className="text-xs font-medium text-red-600">{editErrs.rol.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="ue-activo">
              Estado en el panel
            </label>
            <AppSelect
              id="ue-activo"
              value={editForm.watch("activo") ? "true" : "false"}
              onValueChange={(v) =>
                editForm.setValue("activo", v === "true", { shouldValidate: true, shouldDirty: true })
              }
              options={[
                { value: "true", label: "Activo" },
                { value: "false", label: "Inactivo" },
              ]}
            />
            {editErrs.activo ? (
              <p className="text-xs font-medium text-red-600">{editErrs.activo.message}</p>
            ) : null}
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={passwordOpen}
        onClose={closePassword}
        title="Cambiar contraseña"
        closeDisabled={savingPassword}
        maxWidthClass="w-full max-w-lg"
        closeOnBackdrop={false}
        animatePanelPop
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={closePassword}
              disabled={savingPassword}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 outline-none ring-primary transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:min-w-[7.5rem] sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="admin-usuario-password-form"
              disabled={savingPassword}
              className="admin-pressable inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm outline-none ring-primary hover:brightness-105 focus-visible:ring-2 focus-visible:ring-offset-2 active:shadow-[0_1px_4px_rgba(0,0,0,0.18)] disabled:pointer-events-none disabled:opacity-60 sm:min-w-[11rem] sm:w-auto"
            >
              {savingPassword ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : null}
              Guardar contraseña
            </button>
          </div>
        }
      >
        {passwordRow ? (
          <p className="mb-4 text-sm text-zinc-600">
            Usuario:{" "}
            <span className="font-semibold text-zinc-900">
              {`${passwordRow.nombre ?? ""} ${passwordRow.apellido ?? ""}`.trim()}
            </span>
          </p>
        ) : null}
        <form id="admin-usuario-password-form" onSubmit={onSubmitPassword} className="flex flex-col gap-4" noValidate>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="up-pass">
              Nueva contraseña <span className="text-red-600">*</span>
            </label>
            <input
              id="up-pass"
              data-modal-initial-focus
              type="password"
              autoComplete="new-password"
              className={`${fieldBase} ${pwdErrs.password ? fieldErr : fieldOk}`}
              {...passwordForm.register("password")}
            />
            {pwdErrs.password ? (
              <p className="text-xs font-medium text-red-600">{pwdErrs.password.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-800" htmlFor="up-pass2">
              Confirmar nueva contraseña <span className="text-red-600">*</span>
            </label>
            <input
              id="up-pass2"
              type="password"
              autoComplete="new-password"
              className={`${fieldBase} ${pwdErrs.confirmPassword ? fieldErr : fieldOk}`}
              {...passwordForm.register("confirmPassword")}
            />
            {pwdErrs.confirmPassword ? (
              <p className="text-xs font-medium text-red-600">{pwdErrs.confirmPassword.message}</p>
            ) : null}
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={confirmDeactivateOpen}
        onClose={closeConfirmDeactivate}
        title="Desactivar usuario"
        closeDisabled={Boolean(togglingId)}
        maxWidthClass="w-full max-w-md"
        animatePanelPop
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={closeConfirmDeactivate}
              disabled={Boolean(togglingId)}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => confirmDeactivate()}
              disabled={Boolean(togglingId)}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60 sm:w-auto"
            >
              {togglingId ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white" aria-hidden /> : null}
              Desactivar
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-zinc-700">
          ¿Seguro que querés desactivar a{" "}
          <span className="font-semibold text-zinc-900">
            {deactivateRow
              ? `${deactivateRow.nombre ?? ""} ${deactivateRow.apellido ?? ""}`.trim() || "este usuario"
              : "este usuario"}
          </span>
          ? No podrá iniciar sesión hasta que lo reactiven.
        </p>
      </Modal>
    </div>
  );
}
