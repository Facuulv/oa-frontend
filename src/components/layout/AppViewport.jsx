import { cn } from "@/lib/cn";

/**
 * Ancho máximo legado del “teléfono” / columna (~480px).
 * Sigue usándose en barras `fixed`, toasts, etc., hasta migrar esos puntos al nuevo layout.
 */
export const APP_VIEWPORT_MAX_CLASS = "max-w-[480px]";
export const APP_VIEWPORT_MIN_HEIGHT_CLASS = "min-h-[100dvh]";

/**
 * @typedef {"public" | "admin" | "auth"} AppViewportVariant
 */

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {string} [props.innerClassName]
 * @param {AppViewportVariant} [props.variant] Sin definir = mismo ancho máximo que antes (`APP_VIEWPORT_MAX_CLASS`).
 */
function innerMaxWidthClass(variant) {
  if (variant === "public" || variant === "admin" || variant === "auth") {
    return "max-w-none";
  }
  return APP_VIEWPORT_MAX_CLASS;
}

/**
 * Marco exterior (chrome) + columna mobile-first.
 * `variant` ajusta el ancho máximo de la columna; el aspecto concreto (surface, admin…) va en `innerClassName`.
 */
export default function AppViewport({
  children,
  className,
  innerClassName,
  variant,
}) {
  return (
    <div
      className={cn(
        `flex ${APP_VIEWPORT_MIN_HEIGHT_CLASS} w-full justify-center bg-background text-foreground`,
        className,
      )}
    >
      <div
        className={cn(
          `relative flex w-full ${APP_VIEWPORT_MIN_HEIGHT_CLASS} flex-col`,
          innerMaxWidthClass(variant),
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
