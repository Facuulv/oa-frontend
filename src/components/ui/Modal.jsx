"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "button[role=\"combobox\"]:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el instanceof HTMLElement && el.offsetParent !== null && !el.hasAttribute("disabled"),
  );
}

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {import("react").ReactNode} props.title
 * @param {import("react").ReactNode} props.children
 * @param {boolean} [props.closeDisabled]
 * @param {import("react").ReactNode} [props.footer] Pie fijo debajo del área con scroll (opcional).
 * @param {string} [props.maxWidthClass] Clases de ancho máximo del panel (default: tarjeta angosta).
 * @param {string} [props.panelClassName] Clases extra en el panel (radios, sombra, etc.).
 * @param {string} [props.maxHeightClass] Altura máxima del panel.
 * @param {boolean} [props.closeOnBackdrop] Si false, no cierra al clic fuera del panel.
 * @param {boolean} [props.animatePanelPop] Animación de entrada un poco más marcada (producto, etc.).
 * @param {string} [props.titleId] id del título para aria-labelledby (default: useId).
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  closeDisabled = false,
  footer = null,
  maxWidthClass = "max-w-sm",
  panelClassName = "",
  maxHeightClass = "max-h-[min(90dvh,calc(100dvh-1.5rem))]",
  closeOnBackdrop = true,
  animatePanelPop = false,
  titleId: titleIdProp,
}) {
  const reactId = useId();
  const titleId = titleIdProp ?? `modal-title-${reactId.replace(/:/g, "")}`;
  const panelRef = useRef(null);
  const previousActiveElement = useRef(null);

  const tryClose = useCallback(() => {
    if (!closeDisabled) onClose();
  }, [closeDisabled, onClose]);

  useEffect(() => {
    if (!isOpen || closeDisabled) return;
    const handler = (e) => {
      if (e.key === "Escape") tryClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, closeDisabled, tryClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement;
    if (prev instanceof HTMLElement) previousActiveElement.current = prev;

    const focusInitial = () => {
      const root = panelRef.current;
      if (!root) return;
      const preferred = root.querySelector("[data-modal-initial-focus]");
      if (preferred instanceof HTMLElement && !preferred.disabled) {
        preferred.focus();
        return;
      }
      const list = getFocusableElements(root);
      const firstContent = list.find((el) => el.getAttribute("data-modal-close") !== "true");
      if (firstContent) firstContent.focus();
      else if (list[0]) list[0].focus();
    };

    const id = window.requestAnimationFrame(() => focusInitial());
    return () => {
      window.cancelAnimationFrame(id);
      const el = previousActiveElement.current;
      if (el && document.contains(el)) el.focus();
    };
  }, [isOpen]);

  const handlePanelKeyDown = (e) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const list = getFocusableElements(panelRef.current);
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) return null;

  const backdropClick = () => {
    if (closeOnBackdrop) tryClose();
  };

  const panelAnim = animatePanelPop ? "modal-panel-pop" : "modal-slide-down";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-3 pt-10 sm:items-center sm:px-4 sm:pb-6 sm:pt-8"
      role="presentation"
    >
      <div
        className={`modal-overlay-enter absolute inset-0 bg-zinc-900/50 backdrop-blur-[2px] ${closeDisabled ? "cursor-not-allowed" : closeOnBackdrop ? "cursor-pointer" : ""}`}
        onClick={backdropClick}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handlePanelKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={`relative flex w-full ${maxWidthClass} ${maxHeightClass} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200/70 sm:rounded-2xl ${panelAnim} ${panelClassName}`.trim()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200/90 bg-white px-4 py-3.5 sm:px-5 sm:py-4">
          <h2 id={titleId} className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-zinc-900 sm:text-lg">
            {title}
          </h2>
          <button
            type="button"
            data-modal-close="true"
            onClick={tryClose}
            disabled={closeDisabled}
            aria-label="Cerrar modal"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-500 outline-none ring-primary transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
          >
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="admin-shell-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-zinc-200/90 bg-zinc-50/90 px-4 py-3 sm:px-5 sm:py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
