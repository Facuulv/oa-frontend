<<<<<<< HEAD
import { cn } from "@/lib/cn";

/**
 * Ancho máximo legado del “teléfono” / columna (~480px).
 * Sigue usándose en barras `fixed`, toasts, etc., hasta migrar esos puntos al nuevo layout.
 */
export const APP_VIEWPORT_MAX_CLASS = "max-w-[480px]";

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
=======
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export const APP_VIEWPORT_MAX_CLASS = "max-w-[480px]";

>>>>>>> sacha
function innerMaxWidthClass(variant) {
  if (variant === "public" || variant === "admin" || variant === "auth") {
    return "max-w-none";
  }
  return APP_VIEWPORT_MAX_CLASS;
}

<<<<<<< HEAD
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
        "flex min-h-[100dvh] w-full justify-center bg-background text-foreground",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex w-full min-h-[100dvh] flex-col",
          innerMaxWidthClass(variant),
          innerClassName,
=======
export default function AppViewport({ children, className, innerClassName, variant }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mientras se hidrata, mostramos un fondo blanco liso para que no haya mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className={cn("flex min-h-[100dvh] w-full justify-center bg-white text-zinc-900", className)}>
      <div
        className={cn(
          "relative flex w-full min-h-[100dvh] flex-col overflow-hidden",
          innerMaxWidthClass(variant),
          innerClassName
>>>>>>> sacha
        )}
      >
        {children}
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> sacha
