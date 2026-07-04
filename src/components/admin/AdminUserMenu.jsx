"use client";

import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/cn";

const ROLE_LABEL = {
  ADMIN: "Administrador",
  ENCARGADO: "Encargado",
  VENDEDOR: "Vendedor",
};

function userDisplayName(user) {
  const full = [user?.nombre, user?.apellido].filter(Boolean).join(" ").trim();
  if (full) return full;
  const name = (user?.nombre ?? user?.name ?? "").trim();
  return name || "Admin";
}

function userInitials(user) {
  const name = userDisplayName(user);
  if (!name || name === "Admin") return "A";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function userRoleLabel(user) {
  const rol = user?.rol ?? user?.role;
  if (!rol) return "Administrador";
  return ROLE_LABEL[rol] ?? String(rol).replace(/_/g, " ");
}

/**
 * Menú de usuario del panel admin (estilo Chalito): trigger ghost en navbar + dropdown.
 */
export default function AdminUserMenu({ user, compact = false, onLogout }) {
  const displayName = userDisplayName(user);
  const roleLabel = userRoleLabel(user);
  const email = user?.email ?? "";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-w-0 items-center rounded-xl text-left transition-colors duration-200",
            "hover:bg-zinc-100 active:bg-zinc-100",
            compact ? "gap-1 p-1" : "gap-2 px-2 py-1.5 sm:gap-3",
          )}
          aria-label="Menú de cuenta"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-semibold text-zinc-800"
            aria-hidden
          >
            {userInitials(user)}
          </span>

          {!compact ? (
            <div className="hidden min-w-0 text-left sm:block">
              <p className="truncate text-sm font-semibold leading-tight text-zinc-900">{displayName}</p>
              <span className="mt-1 inline-flex h-5 max-w-full items-center truncate rounded-full border border-zinc-200 bg-white px-2 text-xs text-zinc-500">
                {roleLabel}
              </span>
            </div>
          ) : null}

          <ChevronDown
            className={cn(
              "shrink-0 text-zinc-400",
              compact ? "h-4 w-4" : "hidden h-4 w-4 sm:block",
            )}
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="px-2 py-2 font-normal">
          <p className="truncate text-sm font-medium leading-none text-zinc-900">{displayName}</p>
          {email ? <p className="mt-1 truncate text-xs font-normal text-zinc-500">{email}</p> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/perfil" className="cursor-pointer text-zinc-800">
            <User className="mr-2 h-4 w-4 shrink-0" aria-hidden />
            Mi perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4 shrink-0" aria-hidden />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
