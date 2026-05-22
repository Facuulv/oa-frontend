"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useCatalogStore,
  selectProductDetail,
  selectProductDetailLoading,
  selectProductDetailError,
} from "@/store/useCatalogStore";
import { useCartStore } from "@/store/useCartStore";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { useProductPricing } from "@/hooks/product/useProductPricing";
import ImageWithFade from "@/components/ImageWithFade";
import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton";
import PublicPageHeader from "@/components/public/PublicPageHeader";
import ProductDetailShell from "@/components/product/ProductDetailShell";
import ProductDetailActionBar from "@/components/product/ProductDetailActionBar";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import ProductExtrasList from "@/components/product/ProductExtrasList";
import { PLACEHOLDER_PRODUCT_DETAIL } from "@/constants/images";
import {
  PRODUCT_DETAIL_BACK_BUTTON_CLASS,
  PRODUCT_DETAIL_GRID_CLASS,
  PRODUCT_DETAIL_IMAGE_CARD_CLASS,
  PRODUCT_DETAIL_IMAGE_MOBILE_CLASS,
  PRODUCT_DETAIL_MOBILE_BAR_CLASS,
  PRODUCT_DETAIL_SURFACE_CARD_CLASS,
  PROMO_BADGE_CLASS,
  PROMO_STATUS_CARD_CLASS,
  COMBO_SUMMARY_INPUT_CLASS,
} from "@/constants/homeTheme";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/utils/format/price";
import { cn } from "@/lib/cn";
import { AlertCircle, ArrowLeft, Package } from "lucide-react";
import { toast } from "@/lib/toast";

function ProductDetailImage({
  src,
  alt,
  className,
  imageClassName,
  showMobileBack,
  onBack,
}) {
  return (
    <div className={className}>
      <ImageWithFade
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover object-center", imageClassName)}
        loading="eager"
        fetchPriority="high"
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER_PRODUCT_DETAIL;
        }}
      />
      {showMobileBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          className={PRODUCT_DETAIL_BACK_BUTTON_CLASS}
        >
          <ArrowLeft size={20} strokeWidth={2.25} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

function ProductDetailErrorState({ message, onRetry }) {
  return (
    <ProductDetailShell ariaLabel="Error al cargar producto">
      <div className={PROMO_STATUS_CARD_CLASS} role="alert">
        <AlertCircle size={40} className="mx-auto mb-3 text-red-400" aria-hidden />
        <h2 className="text-base font-bold text-foreground">No pudimos cargar el producto</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">{message}</p>
        <div className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white",
              "motion-safe:transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            )}
          >
            Reintentar
          </button>
          <Link
            href="/"
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/20 bg-white px-4 text-sm font-semibold text-primary",
              "motion-safe:transition-colors hover:border-primary/35 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            )}
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </ProductDetailShell>
  );
}

function ProductDetailNotFoundState() {
  return (
    <ProductDetailShell ariaLabel="Producto no encontrado">
      <div className={PROMO_STATUS_CARD_CLASS}>
        <span
          className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden
        >
          <Package size={22} strokeWidth={2.25} />
        </span>
        <h2 className="text-base font-bold tracking-tight text-foreground md:text-lg">
          Producto no encontrado
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-zinc-500">
          Revisá el enlace o explorá otras categorías.
        </p>
        <Link
          href="/"
          className={cn(
            "mx-auto mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white",
            "motion-safe:transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          Ir al inicio
        </Link>
      </div>
    </ProductDetailShell>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const fetchDetail = useCatalogStore((s) => s.fetchProductDetail);
  const product = useCatalogStore((s) => selectProductDetail(s, slug));
  const isLoading = useCatalogStore((s) => selectProductDetailLoading(s, slug));
  const error = useCatalogStore((s) => selectProductDetailError(s, slug));
  const showSkeleton = useDelayedLoading(isLoading);
  const addItem = useCartStore((s) => s.addItem);

  const [selectedExtras, setSelectedExtras] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const pricing = useProductPricing({
    precioBase: product?.precio ?? 0,
    extrasSeleccionados: selectedExtras,
  });

  useEffect(() => {
    fetchDetail(slug);
  }, [fetchDetail, slug]);

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) return prev.filter((e) => e.id !== extra.id);
      return [...prev, { id: extra.id, nombre: extra.nombre, precioExtra: extra.precio }];
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      articuloId: product.id,
      slug: product.slug ?? String(product.id),
      nombre: product.nombre,
      precioBase: product.precio,
      extrasSeleccionados: selectedExtras,
      observaciones,
      cantidad,
      categoria_nombre: product.categoria_nombre,
      imagen_url: product.imagen_url,
    });
    toast.success("Producto agregado al carrito");
    router.back();
  };

  const handleBack = () => router.back();

  if (showSkeleton) return <ProductDetailSkeleton />;

  if (error) {
    return (
      <ProductDetailErrorState
        message={error}
        onRetry={() => fetchDetail(slug, { force: true })}
      />
    );
  }

  if (!isLoading && !product) {
    return <ProductDetailNotFoundState />;
  }

  if (!product) return null;

  const imgSrc =
    getOptimizedImageUrl(product.imagen_url, { preset: "productDetail" }) ||
    PLACEHOLDER_PRODUCT_DETAIL;

  const lineTotal = pricing.total * cantidad;
  const totalFormatted = formatPrice(lineTotal);
  const unitPriceFormatted = formatPrice(pricing.total);
  const headerSubtitle = product.categoria_nombre ?? undefined;

  const mobileHero = (
    <ProductDetailImage
      src={imgSrc}
      alt={product.nombre}
      className={PRODUCT_DETAIL_IMAGE_MOBILE_CLASS}
      showMobileBack
      onBack={handleBack}
    />
  );

  return (
    <ProductDetailShell hero={mobileHero} ariaLabel={product.nombre}>
      <div className="hidden lg:block">
        <PublicPageHeader
          title={product.nombre}
          subtitle={headerSubtitle}
          onBack={handleBack}
          className="mb-4 md:mb-5"
        />
      </div>

      <div className={PRODUCT_DETAIL_GRID_CLASS}>
        <ProductDetailImage
          src={imgSrc}
          alt={product.nombre}
          className={PRODUCT_DETAIL_IMAGE_CARD_CLASS}
        />

        <div className="min-w-0 space-y-5 lg:space-y-6">
          <div className="space-y-2 lg:hidden">
            {product.categoria_nombre ? (
              <span className={PROMO_BADGE_CLASS}>{product.categoria_nombre}</span>
            ) : null}
            <h1 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
              {product.nombre}
            </h1>
            <p className="product-price text-2xl leading-none text-primary">
              {unitPriceFormatted}
            </p>
          </div>

          {product.descripcion ? (
            <div className={PRODUCT_DETAIL_SURFACE_CARD_CLASS}>
              <h2 className="mb-2 text-sm font-bold tracking-tight text-foreground">
                Descripción
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600 whitespace-pre-wrap break-words">
                {product.descripcion}
              </p>
            </div>
          ) : null}

          <ProductExtrasList
            extras={product.extras}
            selectedExtras={selectedExtras}
            onToggle={toggleExtra}
          />

          <div className={PRODUCT_DETAIL_SURFACE_CARD_CLASS}>
            <label
              htmlFor="product-observaciones"
              className="mb-2 block text-sm font-bold tracking-tight text-foreground"
            >
              Observaciones
            </label>
            <textarea
              id="product-observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              maxLength={200}
              placeholder="Algún comentario sobre tu pedido..."
              className={cn(COMBO_SUMMARY_INPUT_CLASS, "h-24 resize-none")}
            />
            <p className="mt-1.5 text-right text-xs tabular-nums text-zinc-400">
              {observaciones.length}/200
            </p>
          </div>

          <ProductPurchasePanel
            cantidad={cantidad}
            onDecrement={() => setCantidad((c) => Math.max(1, c - 1))}
            onIncrement={() => setCantidad((c) => c + 1)}
            unitPriceFormatted={unitPriceFormatted}
            totalFormatted={totalFormatted}
            onAdd={handleAddToCart}
          />
        </div>
      </div>

      <footer className={PRODUCT_DETAIL_MOBILE_BAR_CLASS} aria-label="Agregar al pedido">
        <ProductDetailActionBar
          cantidad={cantidad}
          onDecrement={() => setCantidad((c) => Math.max(1, c - 1))}
          onIncrement={() => setCantidad((c) => c + 1)}
          totalFormatted={totalFormatted}
          onAdd={handleAddToCart}
        />
      </footer>
    </ProductDetailShell>
  );
}
