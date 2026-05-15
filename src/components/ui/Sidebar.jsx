"use client";

import Link from "next/link";
import {
  ChevronDown,
  Home,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  User,
  LogIn,
  Settings,
  X,
} from "lucide-react";
<<<<<<< Updated upstream
import { useAuthStore, selectIsAuthenticated, selectIsAdmin } from "@/store/useAuthStore";
=======
import { useAuthStore, selectCanAccessAdminPanel, selectIsClienteUser } from "@/store/useAuthStore";
import { useSavedCombosStore, selectSavedCombos } from "@/store/useSavedCombosStore";
>>>>>>> Stashed changes

/**
 * Orden fijo. Se renderizan en dos bloques: los que van antes de la sección
 * "Tus combos" (hasta Promociones inclusive) y los que van después.
 * No mutar ni reordenar en runtime durante el primer render.
 */
const primaryPublicLinks = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/arma-tu-combo", label: "Arma tu combo", icon: Sparkles },
  { href: "/promociones", label: "Promociones", icon: Tag },
];

const secondaryPublicLinks = [
  { href: "/checkout", label: "Mi carrito", icon: ShoppingCart },
];

const authLinks = [
  { href: "/mi-cuenta", label: "Mi cuenta", icon: User },
];

const adminLinks = [
  { href: "/admin", label: "Panel admin", icon: Settings },
];

<<<<<<< Updated upstream
export default function Sidebar({ isOpen, onClose }) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isAdmin = useAuthStore(selectIsAdmin);
=======
export default function Sidebar({ isOpen, onClose, onInstallClick }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hola");
  const [isCombosOpen, setIsCombosOpen] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated && selectIsClienteUser(s));
  const canAccessAdminPanel = useAuthStore(selectCanAccessAdminPanel);
  const savedCombos = useSavedCombosStore(selectSavedCombos);
  const removeCombo = useSavedCombosStore((s) => s.removeCombo);

  const isLinkActive = (href) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));
  const isCombosSectionActive = pathname?.startsWith("/arma-tu-combo");

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setGreeting("Buenos días");
    else if (hour >= 12 && hour < 20) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");
  }, []);
>>>>>>> Stashed changes

  const showClienteSession = mounted && isAuthenticated;

  return (
    <aside
<<<<<<< Updated upstream
      className={`absolute left-0 top-0 z-40 h-full w-64 bg-white shadow-xl transition-transform duration-[400ms] ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-lg font-bold text-primary">OA!</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {publicLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <Icon size={18} className="text-gray-400" />
              {label}
            </Link>
          ))}

          <hr className="my-2" />

          {isAuthenticated ? (
            <>
              {authLinks.map(({ href, label, icon: Icon }) => (
=======
      className={`fixed left-0 top-0 z-50 h-full w-[17.5rem] max-w-[85vw] transform-gpu border-r border-white/10 bg-zinc-950 shadow-2xl transition-transform duration-200 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="px-5 pt-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-lg font-semibold text-white">OA! Bebidas</p>
                <p className="text-xs text-zinc-100">Un mundo de bebidas</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-1.5 text-white transition-colors duration-200 hover:border-white/20"
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-xs text-zinc-100">{greeting} 👋</p>
              <p className="text-sm font-medium text-zinc-100">¿Qué vas a tomar hoy?</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-between px-5 pb-5 pt-4">
          <nav className="space-y-2 overflow-y-auto px-1">
            {primaryPublicLinks.map(({ href, label, icon: Icon }) => {
              const isActive = isLinkActive(href);
              return (
>>>>>>> Stashed changes
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
<<<<<<< Updated upstream
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <Icon size={18} className="text-gray-400" />
                  {label}
                </Link>
              ))}
              {isAdmin &&
                adminLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/5"
                  >
                    <Icon size={18} className="text-primary" />
                    {label}
                  </Link>
                ))}
            </>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <LogIn size={18} className="text-gray-400" />
              Iniciar sesión
            </Link>
          )}
        </nav>
=======
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                      : "bg-white/[0.02] text-white hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors duration-200 ${
                      isActive
                        ? "border-red-500/30 bg-red-700 text-white"
                        : "border-white/10 bg-white/[0.02] text-white group-hover:border-white/20"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <span>{label}</span>
                </Link>
              );
            })}

            {mounted && (
              <div className="border-t border-white/10 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCombosOpen((open) => !open)}
                  aria-expanded={isCombosOpen}
                  aria-controls="sidebar-tus-combos-panel"
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors duration-200 ${
                    isCombosSectionActive
                      ? "bg-red-600 font-medium text-white shadow-lg shadow-red-900/20"
                      : isCombosOpen
                        ? "bg-white/[0.02] font-bold text-white hover:bg-white/5"
                        : "bg-white/[0.02] font-medium text-white hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 ${
                      isCombosSectionActive
                        ? "border-red-500/30 bg-red-700 text-white"
                        : "border-white/10 bg-white/[0.02] text-white group-hover:border-white/20"
                    }`}
                  >
                    <Sparkles size={16} />
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-left text-white ${
                      isCombosOpen ? "font-bold" : "font-medium"
                    }`}
                  >
                    Tus combos
                  </span>
                  <ChevronDown
                    size={18}
                    strokeWidth={2.25}
                    className={`shrink-0 text-white transition-transform duration-200 ${
                      isCombosOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>

                {isCombosOpen && (
                  <div
                    id="sidebar-tus-combos-panel"
                    className="mt-1 max-h-52 overflow-y-auto rounded-xl border border-white/5 bg-black/20 py-1"
                  >
                    {savedCombos.length === 0 ? (
                      <p className="px-4 py-3 text-xs font-medium leading-relaxed text-zinc-100">
                        No tenés combos guardados
                      </p>
                    ) : (
                      <ul className="space-y-0.5 px-1.5 py-1">
                        {savedCombos.map((combo) => {
                          const displayName =
                            combo.name?.trim() || combo.label || "Mi Combo Custom";
                          return (
                            <li
                              key={combo.id}
                              className="flex items-center gap-1 rounded-lg hover:bg-white/5"
                            >
                              <Link
                                href={`/arma-tu-combo?combo=${encodeURIComponent(combo.id)}`}
                                onClick={onClose}
                                title={displayName}
                                className="min-w-0 flex-1 truncate px-2.5 py-2 text-sm font-medium text-white transition-colors hover:text-[#C1121F]"
                              >
                                {displayName}
                              </Link>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeCombo(combo.id);
                                }}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#C1121F] transition-colors hover:bg-[#C1121F]/20 hover:text-white"
                                aria-label={`Eliminar ${displayName}`}
                              >
                                <Trash2 size={14} strokeWidth={2} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {secondaryPublicLinks.map(({ href, label, icon: Icon }) => {
              const isActive = isLinkActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                      : "bg-white/[0.02] text-white hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors duration-200 ${
                      isActive
                        ? "border-red-500/30 bg-red-700 text-white"
                        : "border-white/10 bg-white/[0.02] text-white group-hover:border-white/20"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <span>{label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => {
                onClose();
                onInstallClick?.();
              }}
              className="group flex w-full items-center gap-3 rounded-2xl border border-red-500/25 bg-zinc-900/70 px-3 py-3 text-left text-sm font-medium text-red-200 transition-colors duration-200 hover:border-red-400/40 hover:bg-zinc-900"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300">
                <Download size={16} />
              </span>
              Instalar app
            </button>
          </nav>

          <div className="mt-4 space-y-2 border-t border-white/10 px-1 pt-4">
            {showClienteSession ? (
              <>
                {authLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white hover:bg-white/5"
                  >
                    <Icon size={16} className="text-white" />
                    <span>{label}</span>
                  </Link>
                ))}
                {canAccessAdminPanel &&
                  adminLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white hover:bg-white/5"
                    >
                      <Icon size={16} className="text-white" />
                      <span>{label}</span>
                    </Link>
                  ))}
              </>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white hover:bg-white/5"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-white">
                  <LogIn size={16} />
                </span>
                <span>Iniciar sesión</span>
              </Link>
            )}
          </div>
        </div>
>>>>>>> Stashed changes
      </div>
    </aside>
  );
}
