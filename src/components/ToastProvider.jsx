"use client";

import { DEFAULT_TOAST_DURATION } from "@/lib/toast";
import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      closeButton
      richColors
      theme="light"
      toastOptions={{ duration: DEFAULT_TOAST_DURATION }}
      offset={{ top: 20, right: 16 }}
      mobileOffset={{
        top: "calc(12px + env(safe-area-inset-top, 0px))",
        right: "calc(12px + env(safe-area-inset-right, 0px))",
      }}
      gap={10}
    />
  );
}
