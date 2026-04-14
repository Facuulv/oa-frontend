# Auditoría de chalito_carta para OA!

> Referencia para la clonación y migración del nuevo proyecto OA!
> Fecha: 2026-04-11

---

## Stack original (chalito_carta)

| Aspecto | Tecnología |
|---|---|
| Framework | Next.js 16, App Router, React 19, JavaScript |
| State | Zustand (persist middleware para carrito) |
| Styling | Tailwind CSS v4 (PostCSS, sin tailwind.config) + CSS custom |
| HTTP | Axios (apiClient) + fetch nativo (pedidos/MercadoPago) |
| Forms | react-hook-form + zod en deps (no usados en checkout, validación manual) |
| Carousel | embla-carousel-react |
| Icons | lucide-react + react-icons |
| Toasts | sonner |
| Fonts | Anton + Lato (Google Fonts) |

---

## 1. Componentes reutilizables directos

Copiar sin cambios al nuevo proyecto:

| Componente | Path | Descripción |
|---|---|---|
| `ImageWithFade` | `src/components/ImageWithFade.jsx` | Imagen con fade-in al cargar. 100% genérico. |
| `ProductObservaciones` | `src/components/product/ProductObservaciones.jsx` | Textarea con contador de caracteres. Parametrizar maxLength. |
| `HomeSkeleton` | `src/components/skeletons/HomeSkeleton.jsx` | Skeleton del home. |
| `ProductCardSkeleton` | `src/components/skeletons/ProductCardSkeleton.jsx` | Skeleton de card de producto. |
| `ProductoDetalleSkeleton` | `src/components/skeletons/ProductoDetalleSkeleton.jsx` | Skeleton de detalle de producto. |
| `CheckoutRemoveItemModal` | `src/components/checkout/CheckoutRemoveItemModal.jsx` | Modal genérico de confirmación de borrado. |

---

## 2. Componentes reutilizables con refactor

| Componente | Qué cambiar | Esfuerzo |
|---|---|---|
| `AppShell` | Extraer colores (`blue-900`), max-width 480px, texto "Ver mi pedido", gradiente. Agregar soporte auth/admin. | Medio |
| `Navbar` | Quitar logo El Chalito hardcodeado, colores. Hacer logo configurable. Agregar botón login/avatar. | Medio |
| `Sidebar` | Descartar contenido (Instagram, WhatsApp, Google Maps, horarios). Conservar estructura animada + portal. | Alto |
| `CategoryCard` | Solo cambiar URL pattern si se necesita. Ya es bastante genérico. | Bajo |
| `ProductListItemCard` | Cambiar URL pattern `/producto/`. Revisar campos del modelo. | Bajo |
| `HeroSlider` | Quitar texto fallback "Carta Chalito". Ya acepta `images` como prop. | Bajo |
| `PresentationSelector` | Modelo simple/doble/triple no aplica a bebidas. Adaptar a tamaños (250ml/500ml/1L) o packs. Conservar patrón UI. | Alto |
| `PersonalizationSection` | Quitar lógica de "Papas fritas" cross-sell. Conservar patrón de extras colapsable. | Medio |
| `ProductAddToCartFooter` | Quitar texto "Estamos cerrados". Cambiar colores `#ffd082`. Conservar patrón de footer fijo. | Bajo |
| `CheckoutItemCard` | Quitar lógica `isHamburguesas` / `splitExtrasForHamburguesa`. Conservar estructura de card. | Medio |
| `CheckoutCategoryGroup` | Genérico, cambio mínimo. | Bajo |
| `CheckoutFooter` | Cambiar color `#88e1f2`. Resto genérico. | Bajo |
| `CheckoutEmptyState` | Cambiar textos "Ir a la carta" → "Ir al catálogo". | Bajo |
| `CustomerSection` | Cambiar colores `#21243d`. Formulario genérico. | Bajo |
| `DeliverySection` | Cambiar colores. Simplificar si OA! es solo retiro. | Medio |
| `PaymentSection` | Revisar métodos de pago para OA!. Cambiar colores. | Medio |
| `ScheduleSection` | Cambiar colores. Estructura reutilizable. | Bajo |
| `OrderSummaryFooter` | Cambiar colores `#88e1f2`. Resumen colapsable muy bien hecho. | Bajo |

---

## 3. Stores (Zustand)

### useCarritoStore — ALTA reutilización

**Path:** `src/store/useCarritoStore.js`

Incluye: addItem, removeItem, updateQuantity, clearCart, persistencia localStorage, búsqueda integrada, selectores (selectCartTotal, selectCartItems).

**Cambios para OA!:**
- Key de persistencia: `"chalito-carrito"` → `"oa-carrito"`
- Quitar `isStoreOpen()` del guard en `addItem`
- Modelo de item adaptable: `precioBase`, `extrasSeleccionados`, `cantidad`, `subtotal` sirven para bebidas

### useCatalogStore — ALTA reutilización

**Path:** `src/store/useCatalogStore.js`

Muy bien arquitectado:
- Cache por sección con TTL de 5 min
- Deduplicación de requests (inflight map)
- Estados por sección (idle/loading/success/error)
- Selectores tipados

**Cambios:** solo adaptar los mappers importados si el modelo de datos cambia.

---

## 4. Hooks

| Hook | Reutilización | Cambios |
|---|---|---|
| `useDelayedLoading` | Directo | Ninguno. Utility anti-flicker genérico. |
| `useStoreStatus` | Con refactor | Cambiar lógica de horarios (leer desde backend o config). |
| `useCheckoutSubmit` | Con refactor | Adaptar payload/endpoints. Agregar lógica de cupones. |
| `useProductPricing` | Con refactor | Quitar modelo simple/doble/triple. Conservar patrón de cálculo reactivo con useMemo. |
| `useProductCategoryFlags` | **Descartar** | 100% acoplado a categorías de comida (hamburguesas, empanadas, etc). |
| `useAddToCartFromDetail` | Con refactor alto | Quitar lógica simple/doble/triple + papas cross-sell. Conservar patrón de agregar con extras. |

---

## 5. Services

| Service | Reutilización | Cambios |
|---|---|---|
| `apiClient.js` | Directo | Cambiar env var y path base (`/carta-publica` → `/api/v1`). Agregar interceptor de auth token. |
| `catalogService.js` | Directo | Cambiar endpoints si el backend difiere. CRUD estándar. |
| `pedidosPublicosService.js` | Con refactor | Conservar patrones. Agregar auth headers. Adaptar payload. |

---

## 6. Lib / Utils

### Copiar directo

| Archivo | Path | Descripción |
|---|---|---|
| `formatPrice` | `src/utils/format/price.js` | `Intl.NumberFormat("es-AR")` |
| `imageUtils` | `src/lib/imageUtils.js` | `buildImageUrl` genérico |
| `scrollLock` | `src/lib/scrollLock.js` | Lock/unlock body scroll |
| `cartItem` | `src/utils/cart/cartItem.js` | Helpers `getItemName`, `getItemQuantity` |
| `images` | `src/constants/images.js` | Placeholders SVG inline |
| `resetAfterApprovedPayment` | `src/utils/checkout/resetAfterApprovedPayment.js` | Limpieza post-pago aprobado |

### Con refactor

| Archivo | Cambios |
|---|---|
| `catalogMapper.js` | Adaptar campos para modelo de bebidas |
| `checkoutValidations.js` | Genérico en nombre/tel/email/dirección. Adaptar monto efectivo. Agregar cupones. |
| `checkoutPayload.js` | Adaptar estructura de payload al backend de OA! |
| `montoConCuantoAbonaRules.js` | Útil si OA! acepta efectivo |

### Descartar

| Archivo | Razón |
|---|---|
| `storeSchedule.js` | Horarios hardcodeados de El Chalito |
| `storeHoursConfig.js` | Bypass de horarios específico |
| `paymentInfo.js` | Datos bancarios de El Chalito (alias, CVU, titular) |
| `categoryImages.js` | Mapeo hardcodeado de imágenes por categoría de comida |
| `checkoutDisplay.js` | Lógica de "Hacela doble/triple" y hamburguesas |

---

## 7. Páginas / flujos a conservar

| Flujo | Path | Notas |
|---|---|---|
| Home | `src/app/page.jsx` | Hero slider + grid categorías + banner estado. Agregar sección promos. |
| Categoría | `src/app/categoria/[slug]/page.jsx` | Listado con skeleton, error, retry. Casi genérico. |
| Producto detalle | `src/app/producto/[slug]/page.jsx` | Refactor alto: quitar presentaciones food-specific. Conservar imagen + extras + obs + footer. |
| Checkout (carrito) | `src/app/checkout/page.jsx` | Items agrupados, modal borrado, footer total. Conservar completo. |
| Checkout finalizar | `src/app/checkout/finalizar/page.jsx` | Formulario por secciones. Conservar estructura. |
| Checkout resultado | `src/app/checkout/resultado/page.jsx` | Polling estado MercadoPago. Muy útil si OA! usa MP. |
| Búsqueda | `src/app/buscar/page.jsx` | Búsqueda client-side sobre productos cacheados. |

---

## 8. Piezas a descartar definitivamente

- **Lógica de categorías de comida:** `useProductCategoryFlags` (hamburguesas, empanadas, sandwiches, papas)
- **Modelo presentaciones:** simple/doble/triple en `PresentationSelector`, `useProductPricing`, `useAddToCartFromDetail`
- **Cross-sell de papas:** en `PersonalizationSection` y `useAddToCartFromDetail`
- **Horarios hardcodeados:** `SCHEDULE` en `storeSchedule.js`
- **Branding El Chalito:** logo, colores (`blue-900`, `#21243d`, `#88e1f2`, `#ffd082`, `#ff7c7c`), fuentes, Google Maps, Instagram, WhatsApp
- **Datos de pago:** `paymentInfo.js`
- **Imágenes hero:** `HERO_IMAGES` con fotos de comida
- **`checkoutDisplay.js`:** lógica "Hacela doble" / hamburguesas

---

## 9. Estructura destino para OA!

```
oa_app/
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service worker
│   └── icons/                        # PWA icons (192, 512)
│
├── src/
│   ├── app/
│   │   ├── layout.jsx                # Root layout (fonts, Toaster, PWA meta)
│   │   ├── globals.css               # Tailwind + animaciones + clases custom
│   │   │
│   │   ├── (public)/                 # Route group: área pública
│   │   │   ├── layout.jsx            # AppShell (navbar + cart bar + sidebar)
│   │   │   ├── page.jsx              # Home: promos + categorías
│   │   │   ├── buscar/page.jsx
│   │   │   ├── categoria/[slug]/page.jsx
│   │   │   ├── producto/[slug]/page.jsx
│   │   │   ├── promociones/page.jsx
│   │   │   ├── mis-pedidos/page.jsx
│   │   │   └── checkout/
│   │   │       ├── page.jsx
│   │   │       ├── finalizar/page.jsx
│   │   │       └── resultado/page.jsx
│   │   │
│   │   ├── (auth)/                   # Route group: autenticación
│   │   │   ├── login/page.jsx
│   │   │   └── registro/page.jsx
│   │   │
│   │   └── admin/                    # Área privada (protegida por middleware)
│   │       ├── layout.jsx            # Admin layout (sidebar, header)
│   │       ├── page.jsx              # Dashboard
│   │       ├── productos/page.jsx    # CRUD productos
│   │       ├── categorias/page.jsx   # CRUD categorías
│   │       ├── pedidos/page.jsx      # Gestionar pedidos
│   │       ├── promociones/page.jsx  # Cupones y promos
│   │       └── stock/page.jsx        # Control de stock
│   │
│   ├── components/
│   │   ├── ui/                       # Button, Modal, Sidebar, Input, Badge
│   │   ├── catalog/                  # CategoryCard, ProductCard, ProductDetail, HeroSlider
│   │   ├── cart/                     # CartItemCard, CartFooter, CartEmptyState
│   │   ├── checkout/                 # CustomerSection, DeliverySection, PaymentSection, etc.
│   │   ├── auth/                     # LoginForm, RegisterForm, AuthGuard
│   │   ├── admin/                    # AdminTable, AdminProductForm, AdminOrderCard
│   │   ├── promotions/              # PromoCard, CouponInput, PromoSlider
│   │   └── skeletons/
│   │
│   ├── store/
│   │   ├── useCartStore.js           # Basado en useCarritoStore
│   │   ├── useCatalogStore.js        # Reutilizar (cache + dedup + TTL)
│   │   ├── useAuthStore.js           # NUEVO
│   │   └── useAdminStore.js          # NUEVO
│   │
│   ├── hooks/
│   │   ├── useDelayedLoading.js
│   │   ├── useStoreStatus.js
│   │   ├── useAuth.js                # NUEVO
│   │   ├── useCheckoutSubmit.js
│   │   └── useProductPricing.js
│   │
│   ├── services/
│   │   ├── apiClient.js              # + interceptor auth token
│   │   ├── catalogService.js
│   │   ├── ordersService.js
│   │   ├── authService.js            # NUEVO
│   │   ├── promoService.js           # NUEVO
│   │   └── adminService.js           # NUEVO
│   │
│   ├── lib/
│   │   ├── imageUtils.js
│   │   ├── scrollLock.js
│   │   └── mappers/catalogMapper.js
│   │
│   ├── utils/
│   │   ├── format/price.js
│   │   ├── cart/cartItem.js
│   │   ├── checkout/
│   │   └── auth/                     # NUEVO
│   │
│   ├── config/
│   │   └── app.config.js             # Config centralizada (nombre, colores, features)
│   │
│   └── constants/images.js
│
├── middleware.js                      # Auth guard para /admin y rutas protegidas
├── next.config.mjs
└── package.json
```

---

## 10. Dependencias sugeridas

### Mantener de chalito_carta

- `next`, `react`, `react-dom`
- `zustand`
- `axios`
- `sonner`
- `lucide-react`
- `embla-carousel-react`
- `tailwindcss`, `@tailwindcss/postcss`
- `clsx`, `tailwind-merge`
- `zod`, `react-hook-form`, `@hookform/resolvers` (usarlos de verdad en OA!)

### Agregar para OA!

- `next-pwa` o `@serwist/next` (PWA)
- `next-auth` o auth custom (autenticación)
- `@tanstack/react-table` (tablas admin)
- `date-fns` (fechas en admin/pedidos)

---

## 11. Resumen de reutilización

| Categoría | % estimado |
|---|---|
| Reutilizable directo o con refactor bajo | ~60% |
| Refactor medio/alto (adaptar modelo, quitar lógica food-specific) | ~25% |
| Descartar (branding, horarios, lógica de comida) | ~15% |

**Piezas más valiosas:** `useCarritoStore`, `useCatalogStore`, flujo checkout completo, `apiClient`, `catalogService`, skeletons, layout patterns.

**Más costoso de crear desde cero:** auth, admin panel, PWA, promociones/cupones.
