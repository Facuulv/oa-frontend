"use client";

import { Toaster } from "sileo";
import "sileo/styles.css";
import { APP_VIEWPORT_MAX_CLASS } from "@/components/layout/AppViewport";
import { cn } from "@/lib/cn";

export default function ToastProvider() {
  return (
    <div className="sileo-app-toast-frame pointer-events-none fixed inset-x-0 top-0 z-50 flex h-[100dvh] justify-center">
      <div
        className={cn(
          "pointer-events-none relative h-full w-full shrink-0",
          APP_VIEWPORT_MAX_CLASS,
        )}
      >
        <Toaster
          position="top-right"
          offset={{ top: 16, right: 12, left: 12, bottom: 16 }}
          options={{
            duration: 2800,
            roundness: 16,
            autopilot: { expand: 120, collapse: 180 },
          }}
        />
      </div>
    </div>
  );
}
