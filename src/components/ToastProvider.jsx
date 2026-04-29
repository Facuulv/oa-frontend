"use client";

import { Toaster } from "sileo";
import "sileo/styles.css";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      offset={{ top: 16, right: 12, left: 12, bottom: 16 }}
      options={{
        duration: 2800,
        roundness: 16,
        autopilot: { expand: 120, collapse: 180 },
      }}
    />
  );
}
