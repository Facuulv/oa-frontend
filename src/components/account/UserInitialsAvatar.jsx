import { getUserInitials } from "@/utils/account/userDisplay";

const SIZE_STYLES = {
  nav: "h-[26px] w-[26px] text-[10px] rounded-full",
  md: "h-12 w-12 text-sm rounded-2xl",
  lg: "h-16 w-16 text-lg rounded-2xl",
};

const VARIANT_STYLES = {
  nav: "bg-primary-dark font-bold text-white ring-2 ring-white/85 shadow-[0_2px_10px_rgba(0,0,0,0.28)]",
  surface:
    "bg-gradient-to-br from-primary-dark to-primary font-bold text-white ring-2 ring-white/20 shadow-lg shadow-primary/25",
  muted: "bg-white/10 font-semibold text-white ring-1 ring-white/20",
};

/**
 * Avatar minimalista con iniciales (sin imagen de perfil).
 */
export default function UserInitialsAvatar({
  user,
  size = "md",
  variant = size === "nav" ? "nav" : "surface",
  className = "",
  showSessionDot = false,
}) {
  const initials = getUserInitials(user);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center select-none ${SIZE_STYLES[size] ?? SIZE_STYLES.md} ${VARIANT_STYLES[variant] ?? VARIANT_STYLES.surface} ${className}`}
      aria-hidden
    >
      {initials}
      {showSessionDot && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-primary"
          aria-hidden
        />
      )}
    </span>
  );
}
