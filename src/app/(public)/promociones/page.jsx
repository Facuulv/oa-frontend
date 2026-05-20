"use client";

import Link from "next/link";
import { AlertCircle, RotateCcw, Tag } from "lucide-react";
import { useEffect } from "react";
import {
  useCatalogStore,
  selectPromotions,
  selectPromotionsLoading,
  selectPromotionsError,
} from "@/store/useCatalogStore";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import PromoCard from "@/components/catalog/PromoCard";
import PromocionesSkeleton from "@/components/skeletons/PromocionesSkeleton";
import PublicPageHeader from "@/components/public/PublicPageHeader";
import {
  PROMO_CONTENT_CLASS,
  PROMO_LIST_GRID_CLASS,
  PROMO_PAGE_CLASS,
  PROMO_SECTION_CLASS,
  PROMO_STATUS_CARD_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

const PAGE_TITLE = "Promociones";
const PAGE_SUBTITLE = "Descuentos y packs que no te podés perder";

function PromocionesShell({ children, busy = false }) {
  return (
    <div className={PROMO_PAGE_CLASS}>
      <div className={PROMO_CONTENT_CLASS}>
        <section
          className={PROMO_SECTION_CLASS}
          aria-label={PAGE_TITLE}
          aria-busy={busy || undefined}
        >
          <PublicPageHeader title={PAGE_TITLE} subtitle={PAGE_SUBTITLE} className="mb-4 md:mb-5" />
          {children}
        </section>
      </div>
    </div>
  );
}

function PromocionesEmptyState() {
  return (
    <div className={PROMO_STATUS_CARD_CLASS}>
      <span
        className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
        aria-hidden
      >
        <Tag size={22} strokeWidth={2.25} />
      </span>
      <h2 className="text-base font-bold tracking-tight text-foreground md:text-lg">
        No hay promociones disponibles
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-zinc-500">
        Volvé a revisar más tarde o explorá nuestros productos.
      </p>
      <div className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
        <Link
          href="/"
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white",
            "motion-safe:transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          Ir al inicio
        </Link>
        <Link
          href="/catalogo"
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/20 bg-white px-4 text-sm font-semibold text-primary",
            "motion-safe:transition-colors hover:border-primary/35 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}

function PromocionesErrorState({ message, onRetry }) {
  return (
    <div className={PROMO_STATUS_CARD_CLASS} role="alert">
      <AlertCircle size={40} className="mx-auto mb-3 text-red-400" aria-hidden />
      <h2 className="text-base font-bold text-foreground">No pudimos cargar las promociones</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          "mx-auto mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white",
          "motion-safe:transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        )}
      >
        <RotateCcw size={14} aria-hidden />
        Reintentar
      </button>
    </div>
  );
}

export default function PromocionesPage() {
  const fetchPromotions = useCatalogStore((s) => s.fetchPromotions);
  const promotions = useCatalogStore(selectPromotions);
  const isLoading = useCatalogStore(selectPromotionsLoading);
  const error = useCatalogStore(selectPromotionsError);
  const showSkeleton = useDelayedLoading(isLoading);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  if (showSkeleton) {
    return (
      <PromocionesShell busy>
        <p className="sr-only">Cargando promociones…</p>
        <PromocionesSkeleton />
      </PromocionesShell>
    );
  }

  if (error) {
    return (
      <PromocionesShell>
        <PromocionesErrorState
          message={error}
          onRetry={() => fetchPromotions({ force: true })}
        />
      </PromocionesShell>
    );
  }

  return (
    <PromocionesShell>
      {promotions.length > 0 ? (
        <div className={PROMO_LIST_GRID_CLASS}>
          {promotions.map((p) => (
            <PromoCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <PromocionesEmptyState />
      )}
    </PromocionesShell>
  );
}
