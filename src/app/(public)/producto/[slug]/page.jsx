"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCatalogStore, selectProductDetail, selectProductDetailLoading, selectProductDetailError } from "@/store/useCatalogStore";
import { useCartStore } from "@/store/useCartStore";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { useProductPricing } from "@/hooks/product/useProductPricing";
import ImageWithFade from "@/components/ImageWithFade";
import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton";
import { PLACEHOLDER_PRODUCT_DETAIL } from "@/constants/images";
import { buildImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/utils/format/price";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { toast } from "sonner";

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

  if (showSkeleton) return <ProductDetailSkeleton />;

  if (error) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button
          type="button"
          onClick={() => fetchDetail(slug, { force: true })}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!product) return null;

  const imgSrc = buildImageUrl(product.imagen_url) || PLACEHOLDER_PRODUCT_DETAIL;

  return (
    <div className="pb-24">
      <div className="relative">
        <ImageWithFade
          src={imgSrc}
          alt={product.nombre}
          className="h-60 w-full object-cover"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_PRODUCT_DETAIL; }}
        />
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-lg font-bold text-gray-800">{product.nombre}</h1>
        <p className="product-price mt-1 text-xl text-primary">{formatPrice(pricing.total * cantidad)}</p>

        {product.descripcion && (
          <p className="mt-3 text-sm text-gray-600">{product.descripcion}</p>
        )}

        {product.extras?.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Extras</h3>
            <div className="space-y-2">
              {product.extras.map((extra) => {
                const isSelected = selectedExtras.some((e) => e.id === extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => toggleExtra(extra)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3 text-sm transition ${
                      isSelected ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                  >
                    <span className="text-gray-700">{extra.nombre}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">+{formatPrice(extra.precio)}</span>
                      {isSelected && <Check size={16} className="text-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-5">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Observaciones
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            maxLength={200}
            placeholder="Algún comentario sobre tu pedido..."
            className="h-20 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-primary"
          />
          <p className="text-right text-xs text-gray-400">{observaciones.length}/200</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1">
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              className="h-7 w-7 text-center text-gray-500 transition hover:text-gray-700"
            >
              -
            </button>
            <span className="w-6 text-center text-sm font-bold">{cantidad}</span>
            <button
              type="button"
              onClick={() => setCantidad((c) => c + 1)}
              className="h-7 w-7 text-center text-gray-500 transition hover:text-gray-700"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:brightness-110"
          >
            <Plus size={16} />
            Agregar {formatPrice(pricing.total * cantidad)}
          </button>
        </div>
      </div>
    </div>
  );
}
