"use client";



import { memo } from "react";

import { Trash2 } from "lucide-react";

import ImageWithFade from "@/components/ImageWithFade";

import ProductQuantityStepper from "@/components/product/ProductQuantityStepper";

import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";

import { CHECKOUT_ITEM_CARD_CLASS, PUBLIC_PRESSABLE_CLASS } from "@/constants/homeTheme";

import { getOptimizedImageUrl } from "@/lib/imageUtils";

import { cn } from "@/lib/cn";

import { formatPrice } from "@/utils/format/price";

import { getItemUnitPrice } from "@/store/useCartStore";



function CheckoutItemCard({ item, onUpdateQuantity, onRemove }) {

  const imgSrc =

    getOptimizedImageUrl(item.imagen_url, { preset: "checkoutLine" }) || PLACEHOLDER_PRODUCT_CARD;

  const unitPrice = getItemUnitPrice(item);

  const cantidad = item.cantidad ?? 1;



  return (

    <article className={CHECKOUT_ITEM_CARD_CLASS}>

      <div className="flex gap-3">

        <ImageWithFade

          src={imgSrc}

          alt={item.nombre}

          className="h-[5.25rem] w-[5.25rem] shrink-0 rounded-xl object-cover object-center bg-gradient-to-br from-zinc-50 to-zinc-100"

          onError={(e) => {

            e.currentTarget.src = PLACEHOLDER_PRODUCT_CARD;

          }}

        />



        <div className="min-w-0 flex-1">

          <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">

            {item.nombre}

          </p>

          {item.extrasSeleccionados?.length > 0 && (

            <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-zinc-500">

              {item.extrasSeleccionados.map((e) => e.nombre).join(", ")}

            </p>

          )}

          <p className="product-price mt-1.5 text-base leading-none text-primary">

            {formatPrice(unitPrice * cantidad)}

          </p>

          {cantidad > 1 ? (

            <p className="mt-0.5 text-xs text-zinc-500">{formatPrice(unitPrice)} c/u</p>

          ) : null}

        </div>

      </div>



      <div className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-100/90 pt-3">

        <ProductQuantityStepper

          quantity={cantidad}

          onDecrement={() => onUpdateQuantity(item.id, cantidad - 1)}

          onIncrement={() => onUpdateQuantity(item.id, cantidad + 1)}

          decrementDisabled={false}

        />

        <button

          type="button"

          onClick={() => onRemove(item.id)}

          aria-label="Eliminar producto"

          className={cn(

            PUBLIC_PRESSABLE_CLASS,

            "inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-zinc-500",

            "transition-colors hover:bg-red-50 hover:text-red-600",

            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",

          )}

        >

          <Trash2 size={16} strokeWidth={2.25} aria-hidden />

          <span className="sr-only sm:not-sr-only sm:inline">Eliminar</span>

        </button>

      </div>

    </article>

  );

}



export default memo(CheckoutItemCard);

