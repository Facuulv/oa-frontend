import { cn } from "@/lib/cn";

/**
 * Ancho máximo del “teléfono” / columna OA! (público, admin, auth).
 * Usar también en barras `fixed` alineadas al marco.
 */
export const APP_VIEWPORT_MAX_CLASS = "max-w-[480px]";

/**
 * Marco exterior (chrome) + columna centrada mobile-first.
 * Las variantes visuales (surface vs admin) van en `innerClassName`.
 */
export default function AppViewport({ children, className, innerClassName }) {
  return (
    <div
      className={cn(
        "flex min-h-[100dvh] w-full justify-center bg-background text-foreground",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex w-full min-h-[100dvh] flex-col",
          APP_VIEWPORT_MAX_CLASS,
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
