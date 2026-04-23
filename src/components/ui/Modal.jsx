"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, closeDisabled = false }) {
  useEffect(() => {
    if (!isOpen || closeDisabled) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose, closeDisabled]);

  if (!isOpen) return null;

  const tryClose = () => {
    if (!closeDisabled) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-5 sm:px-4 sm:py-8">
      <div
        className={`absolute inset-0 bg-black/40 ${closeDisabled ? "cursor-not-allowed" : ""}`}
        onClick={tryClose}
        aria-hidden={closeDisabled}
      />
      <div className="modal-slide-down relative flex max-h-[min(85dvh,calc(100dvh-2.5rem))] w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:rounded-lg">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="pr-2 text-base font-semibold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={tryClose}
            disabled={closeDisabled}
            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>
        <div className="admin-shell-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
