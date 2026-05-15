"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export const APP_VIEWPORT_MAX_CLASS = "max-w-[480px]";

function innerMaxWidthClass(variant) {
  if (variant === "public" || variant === "admin" || variant === "auth") {
    return "max-w-none";
  }
  return APP_VIEWPORT_MAX_CLASS;
}

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
        )}
      >
        {children}
      </div>
    </div>
  );
}