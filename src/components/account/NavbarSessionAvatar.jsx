import { User } from "lucide-react";
import UserInitialsAvatar from "@/components/account/UserInitialsAvatar";

/** Shell compartido nav: mismo tamaño/posición guest y autenticado. */
const NAV_AVATAR_SHELL =
  "relative inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ring-2 ring-white/85 shadow-[0_2px_10px_rgba(0,0,0,0.28)]";

/**
 * Avatar de sesión para la navbar pública (mobile + desktop).
 * Guest: círculo translúcido con icono user. Auth: iniciales + punto verde.
 */
export default function NavbarSessionAvatar({ isAuthenticated, user }) {
  if (isAuthenticated) {
    return <UserInitialsAvatar user={user} size="nav" showSessionDot />;
  }

  return (
    <span
      className={`${NAV_AVATAR_SHELL} navbar-account-guest-avatar bg-primary-dark text-white`}
      aria-hidden
    >
      <User size={13} strokeWidth={2.5} className="text-white" />
    </span>
  );
}
