import { useLayoutEffect, useRef } from "react";

/** `AdminAppShell`: el scroll real del panel vive en este `main`, no en `window`. */
const ADMIN_MAIN_SELECTOR = "main.admin-shell-scroll";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** ease-out cubic: arranque suave, frena al llegar */
function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/**
 * Anima `scrollTop` del contenedor (más fluido y consistente que `scrollBy({ behavior: 'smooth' })` en `overflow` anidado).
 * @param {HTMLElement} scroller
 * @param {number} targetTop
 * @param {number} durationMs
 */
function animateScrollTop(scroller, targetTop, durationMs) {
  const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  const clampedTarget = clamp(targetTop, 0, maxScroll);
  const start = scroller.scrollTop;
  const change = clampedTarget - start;
  if (Math.abs(change) < 1) return;

  const t0 = performance.now();

  function frame(now) {
    if (!scroller.isConnected) return;
    const linear = clamp((now - t0) / durationMs, 0, 1);
    scroller.scrollTop = start + change * easeOutCubic(linear);
    if (linear < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/**
 * Lleva el ancla del listado al borde superior visible del área scroll del admin.
 * Usa animación propia sobre `main.scrollTop` para una subida suave y predecible.
 *
 * @param {HTMLElement | null} el
 * @param {{ smooth?: boolean }} [opts]
 */
export function scrollAdminListTopIntoView(el, { smooth = true } = {}) {
  if (!el || typeof el.getBoundingClientRect !== "function") return;

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const behavior = reduced || !smooth ? "auto" : "smooth";
  /** ~ `scroll-mt-4` en las listas */
  const topGapPx = 12;

  const run = () => {
    if (!el.isConnected) return;

    const main = el.closest(ADMIN_MAIN_SELECTOR) || el.closest("main");
    if (main) {
      const elRect = el.getBoundingClientRect();
      const mainRect = main.getBoundingClientRect();
      const delta = elRect.top - mainRect.top - topGapPx;
      if (Math.abs(delta) < 3) return;

      const targetTop = main.scrollTop + delta;

      if (reduced || !smooth) {
        const maxScroll = Math.max(0, main.scrollHeight - main.clientHeight);
        main.scrollTop = clamp(targetTop, 0, maxScroll);
        return;
      }

      const durationMs = clamp(320 + Math.abs(delta) * 0.35, 360, 720);
      animateScrollTop(main, targetTop, durationMs);
      return;
    }

    el.scrollIntoView({ behavior, block: "start" });
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
}

/**
 * Scroll al inicio del listado al cambiar de página.
 *
 * - `waitForRefresh: true`: espera fin de `listRefreshing` (fetch) y recién ahí hace scroll (doble rAF + `main`).
 * - `waitForRefresh: false`: mismo scroll al cambiar `page` (categorías en cliente).
 */
export function useScrollListTopOnPagination({
  listRef,
  page,
  waitForRefresh = false,
  listRefreshing = false,
  loadingInitial = false,
  loadError = null,
}) {
  const prevPageRef = useRef(page);
  const prevRefreshingRef = useRef(listRefreshing);
  const pendingScrollRef = useRef(false);

  useLayoutEffect(() => {
    if (loadingInitial || loadError) {
      prevRefreshingRef.current = listRefreshing;
      return;
    }

    const el = listRef.current;
    if (!el) {
      prevRefreshingRef.current = listRefreshing;
      return;
    }

    const pageChanged = prevPageRef.current !== page;
    if (pageChanged) {
      pendingScrollRef.current = true;
      prevPageRef.current = page;
    }

    let shouldScroll = false;

    if (!waitForRefresh) {
      prevRefreshingRef.current = listRefreshing;
      if (pageChanged && pendingScrollRef.current) {
        pendingScrollRef.current = false;
        shouldScroll = true;
      }
    } else {
      const refreshEnded = prevRefreshingRef.current && !listRefreshing;
      prevRefreshingRef.current = listRefreshing;

      if (pendingScrollRef.current && refreshEnded) {
        pendingScrollRef.current = false;
        shouldScroll = true;
      }
    }

    if (!shouldScroll) return;

    scrollAdminListTopIntoView(el, { smooth: true });
  }, [page, listRefreshing, waitForRefresh, loadingInitial, loadError]);
}
