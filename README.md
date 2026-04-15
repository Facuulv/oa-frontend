# OA! — Frontend

## Descripción general

**OA!** es el frontend de la plataforma digital para un local de bebidas. Esta aplicación ofrece catálogo, carrito y flujo de compra orientado al e-commerce, junto con vistas de administración para gestionar catálogo, promociones, cupones y pedidos. Está construida con **Next.js (App Router)** y consume un **API REST** externo configurado por variables de entorno.

## Objetivo del sistema

Centralizar la experiencia de compra online del negocio (descubrimiento de productos, promociones, cupones, puntos de fidelidad donde aplique el backend), el registro e inicio de sesión, y las herramientas operativas para el staff, manteniendo el frontend desacoplado del backend mediante una URL base configurable.

## Funcionalidades principales

- **Catálogo y búsqueda**: inicio, categorías dinámicas (`/categoria/[slug]`), detalle de producto (`/producto/[slug]`), búsqueda.
- **Promociones**: página pública de promociones.
- **Carrito y checkout**: carrito persistido, checkout, finalización y página de resultado (integración con preferencias de pago según el backend; en configuración figuran flags para Mercado Pago, efectivo, delivery y retiro).
- **Cuenta de usuario**: registro, login y área **Mi cuenta** (pedidos y perfil según APIs disponibles).
- **Administración** (`/admin/*`): dashboard, productos, categorías, promociones, cupones y pedidos (acceso restringido por middleware según rol en el token).
- **PWA**: `manifest.json` e iconos en `public/` (metadatos en el layout raíz).
- **Horarios del local**: flag para activar validación de horarios (la lógica de consulta al backend está preparada para evolucionar; ver sección de consideraciones).

## Stack tecnológico

| Área | Tecnología |
|------|------------|
| Framework | [Next.js](https://nextjs.org/) **16.1.6** (App Router) |
| UI | [React](https://react.dev/) **19.2.3**, [Tailwind CSS](https://tailwindcss.com/) **4** |
| Peticiones HTTP | [Axios](https://axios-http.com/) **1.x** |
| Estado global | [Zustand](https://github.com/pmndrs/zustand) **5** (con `persist` donde aplica) |
| Formularios y validación | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/), [@hookform/resolvers](https://github.com/react-hook-form/resolvers) |
| Estilos utilitarios | `clsx`, `tailwind-merge`, `class-variance-authority` |
| Iconos y feedback | `lucide-react`, `react-icons`, notificaciones con [Sonner](https://sonner.emilkowal.ski/) |
| Carrusel | `embla-carousel-react` |
| Lint | ESLint **9** con `eslint-config-next` |

## Requisitos previos

- **Node.js** en versión compatible con Next.js 16 (se recomienda **Node.js 20 LTS o superior**).
- **npm** (el proyecto incluye `package-lock.json`; también puede usarse un gestor compatible).
- Backend de OA! accesible en red (local o desplegado) con CORS y rutas alineadas a las definidas en el cliente (ver [Integración con backend](#integración-con-backend)).

## Instalación

Desde la raíz del repositorio:

```bash
git clone <url-del-repositorio>
cd oa_app
npm install
```

No subas archivos `.env` reales al repositorio: contienen o pueden contener datos sensibles y entornos específicos. Usá `.env.example` como plantilla y mantené `.env` / `.env.local` solo en tu máquina o en el proveedor de deploy de forma segura.

## Configuración del entorno

1. Copiá el archivo de ejemplo:

   ```bash
   cp .env.example .env.local
   ```

   En Windows (PowerShell):

   ```powershell
   Copy-Item .env.example .env.local
   ```

2. Editá `.env.local` y completá al menos **`NEXT_PUBLIC_API_BASE_URL`** con la URL de tu API (sin barra final obligatoria; el cliente normaliza la URL).

3. Ajustá el resto de variables según la tabla de la siguiente sección.

Next.js carga por defecto `.env.local` en desarrollo; para otros archivos (`.env`, `.env.production`) consultá la [documentación oficial de variables de entorno](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables).

## Variables de entorno

Todas las variables usadas por el código del frontend son **prefijo `NEXT_PUBLIC_`**, por lo que se incluyen en el bundle del cliente.

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | **Sí** (para llamadas API reales) | URL base del backend (ej. `http://localhost:4000`). Sin ella, `axios` queda sin `baseURL` y funciones que exigen base (p. ej. `requireApiBaseUrl()`) fallan. |
| `NEXT_PUBLIC_ENABLE_STORE_HOURS_VALIDATION` | No | Si vale exactamente `true`, se considera activa la rama de validación de horarios en `useStoreStatus`. Cualquier otro valor o ausencia equivale a desactivado. |
| `NEXT_PUBLIC_APP_URL` | No | URL pública de esta aplicación Next. Definida en `app.config.js` con valor por defecto `http://localhost:3000`. **Nota:** al momento de escribir este README no hay otros módulos que consuman `appConfig.url`; conviene definirla en producción para enlaces canónicos o usos futuros. |

Además, en tiempo de ejecución Node expone `NODE_ENV` (`development` / `production`); el cliente usa `development` para logs extra de errores de API.

## Ejemplo de `.env.example`

El repositorio incluye `.env.example`. Contenido de referencia y significado de cada línea:

```env
# URL pública de esta app (Next). Usada en app.config; por defecto http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# URL base del backend de OA!
# Ejemplo local: http://localhost:4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Habilitar validación de horarios del negocio (true/false)
NEXT_PUBLIC_ENABLE_STORE_HOURS_VALIDATION=false
```

**Importante:** el archivo **`.env`**, **`.env.local`** y variantes locales **no deben subirse a GitHub**. Ya están ignorados en `.gitignore`.

## Scripts disponibles

Definidos en `package.json`:

| Script | Comando | Descripción |
|--------|---------|-------------|
| Desarrollo | `npm run dev` | Arranca Next.js en **http://localhost:3000** (`next dev -p 3000`). |
| Producción (compilar) | `npm run build` | Genera el build optimizado (`next build`). |
| Producción (servir) | `npm start` | Sirve el build con `next start` (ejecutar después de `build`). |
| Lint | `npm run lint` | Ejecuta ESLint según `eslint.config.mjs`. |

## Estructura del proyecto

```
oa_app/
├── public/                 # Estáticos (manifest PWA, iconos)
├── docs/                   # Documentación auxiliar del repo
├── src/
│   ├── app/                # App Router: layouts, páginas y rutas
│   │   ├── layout.jsx      # Layout raíz (fuentes, Toaster, AuthSessionProvider)
│   │   ├── globals.css
│   │   ├── (public)/       # Rutas tienda: home, categorías, producto, checkout, etc.
│   │   ├── (auth)/         # Login y registro
│   │   └── admin/          # Panel administrativo
│   ├── components/         # Componentes UI y de dominio (navbar, checkout, catálogo…)
│   ├── config/             # app.config.js, apiPaths.js
│   ├── constants/
│   ├── hooks/              # Hooks (auth, checkout, producto, store status…)
│   ├── lib/                # Utilidades (cn, imágenes, scroll, mappers)
│   ├── services/           # Capa de API (axios): auth, catálogo, admin, pedidos, promos
│   ├── store/              # Zustand: auth, carrito, catálogo
│   └── utils/              # API (baseUrl, errores, logs), auth (token, JWT), checkout
├── eslint.config.mjs
├── jsconfig.json           # Alias `@/*` → `./src/*`
├── next.config.mjs         # Imágenes remotas (Cloudinary, Unsplash, HTTP/HTTPS)
├── package.json
└── postcss.config.mjs
```

## Arquitectura general del frontend

- **Routing**: Next.js App Router con grupos de rutas `(public)` y `(auth)`, rutas dinámicas `[slug]`, y segmento `admin/`.
- **Estado global**: **Zustand** — `useAuthStore` (sesión y usuario, persistido parcialmente), `useCartStore` (carrito en `localStorage` con clave configurable en `app.config`), `useCatalogStore` (caché de catálogo con TTL en memoria).
- **Cliente HTTP**: instancia única **Axios** (`src/services/apiClient.js`) con `baseURL` desde `app.config`, timeout 15 s, cabecera JSON e **interceptor** que adjunta `Authorization: Bearer <token>` si existe.
- **Token**: guardado en **`localStorage`** y replicado en **cookie** (misma clave que en constantes) para que el **middleware** de Next pueda leer la sesión en el servidor en rutas `/admin/*`. `AuthSessionProvider` sincroniza token → cookie y refresca el perfil tras hidratar Zustand.
- **Autenticación y guards**: el **middleware** (`src/middleware.js`) protege `/admin/*`: redirige a `/login` si no hay token; si el JWT (parseo best-effort del payload, sin verificar firma en el edge) no indica rol admin, redirige al inicio con `error=forbidden`. Los **401** en API disparan el evento personalizado `auth:unauthorized` para que la UI reaccione.
- **Formularios**: React Hook Form + Zod en flujos que lo requieran (checkout, auth, etc.).
- **UI**: componentes propios con Tailwind; modales, sidebar, skeletons de carga.
- **Imágenes**: `next/image` con dominios permitidos en `next.config.mjs`; helper `buildImageUrl` concatena rutas relativas del API con la base configurada cuando corresponde.

## Integración con backend

- La **URL base** del API es **`NEXT_PUBLIC_API_BASE_URL`**, leída en `src/config/app.config.js` y aplicada en `apiClient` e imágenes relativas.
- Los paths relativos están centralizados en **`src/config/apiPaths.js`**, por ejemplo:
  - **Auth**: `/auth/login`, `/auth/register`, `/auth/profile`
  - **Público**: categorías, productos, promociones, validación de cupones, órdenes, preferencia de checkout
  - **Usuario**: listado de pedidos del cliente, actualización de estado
  - **Manager/admin API**: CRUD de productos, categorías, promociones, cupones; endpoints bajo `/admin/...` para dashboard y settings
- El backend debe exponer las mismas rutas (o un proxy compatible) y habilitar **CORS** para el origen del frontend (p. ej. `http://localhost:3000` en desarrollo).
- La **autorización real** de cada operación debe implementarse en el servidor; el middleware del frontend es solo una capa UX basada en el token.

## Ejecución en desarrollo

```bash
npm run dev
```

La aplicación queda en **http://localhost:3000**. Asegurate de tener el backend corriendo y `NEXT_PUBLIC_API_BASE_URL` apuntando a él.

## Build y despliegue

```bash
npm run build
npm start
```

- **Build**: `next build` genera la salida en `.next/`.
- **Arranque en producción**: `next start` (por defecto puerto **3000** si no se configura `PORT` en el entorno).

Variables `NEXT_PUBLIC_*` deben estar definidas **en el momento del build** en la plataforma de CI/CD o hosting (Vercel, Docker, etc.), porque se inyectan en el cliente en tiempo de compilación.

**Imágenes remotas**: `next.config.mjs` declara `remotePatterns` para Cloudinary, Unsplash y patrones genéricos http/https; si el backend sirve imágenes desde otro host, puede ser necesario ampliar esa configuración.

## Buenas prácticas / consideraciones

- No commitear **`.env`**, **`.env.local`** ni secretos; usar secretos del proveedor de deploy.
- Mantener **alineados** `apiPaths.js` y el contrato del backend al evolucionar la API.
- El parseo de rol en middleware es **indicativo**; no sustituye controles en API.
- **Horarios**: con `NEXT_PUBLIC_ENABLE_STORE_HOURS_VALIDATION=true`, el hook está preparado para conectar un endpoint de horarios; revisá `useStoreStatus` antes de asumir cierre automático en producción.
- **Inconsistencia resuelta en repo**: `NEXT_PUBLIC_APP_URL` existía en código pero no en `.env.example`; el ejemplo fue actualizado para reflejar el código.

## Problemas comunes / troubleshooting

| Síntoma | Posible causa | Qué revisar |
|---------|----------------|-------------|
| Errores de red o `baseURL` vacío | API no configurada | `NEXT_PUBLIC_API_BASE_URL` en `.env.local` y reinicio de `npm run dev` |
| CORS bloqueado | Origen del front no permitido en el API | Configuración CORS del backend; URL y puerto exactos |
| `/admin` redirige a login | Sin cookie/token | Iniciar sesión; comprobar que `setToken` ejecutó (localStorage + cookie) |
| Imágenes rotas desde el API | Host no permitido en Next Image | `next.config.mjs` → `images.remotePatterns` |
| 401 repetidos | Token expirado o inválido | Cerrar sesión y volver a loguear; revisar respuestas del `/auth/profile` |

## Mejoras futuras

- Seguimiento de **delivery en tiempo real** (WebSockets o SSE) cuando el backend lo soporte.
- Integración completa de **horarios de tienda** con endpoint dedicado.
- Uso explícito de **`NEXT_PUBLIC_APP_URL`** en metadatos, enlaces absolutos o integraciones (OAuth callbacks, etc.).
- Tests automatizados (e2e / component) y pipeline CI.

## Autor / notas finales

Proyecto **OA!** — frontend privado del sistema. Para dudas sobre contratos de API o entornos, coordinar con el equipo del backend y la documentación interna en `docs/` si existe.

---

*README generado a partir de la estructura y dependencias reales del repositorio (`package.json`, `next.config.mjs`, `src/`).*
