/** PUT/GET email de recuperación (admin). */
export const ADMIN_CONFIG_EMAIL_RECUPERACION_PATH =
  "/admin/configuracion/email-recuperacion";

export const apiPaths = {
  /** Registro público de cliente (alias histórico; preferir `auth.register`). */
  clientes: {
    register: "/clientes/register",
    me: "/clientes/me",
    combos: "/clientes/me/combos",
    comboById: (id) => `/clientes/me/combos/${encodeURIComponent(id)}`,
  },

  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    register: "/auth/register",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },

  public: {
    categories: "/public/categories",
    products: "/public/productos",
    productById: (id) => `/public/productos/${encodeURIComponent(id)}`,
    promotions: "/public/promotions",
    couponsValidate: "/public/coupons/validate",
    orders: "/public/orders",
    cartaEstado: "/public/carta/estado",
    cartaConfig: "/public/carta/config",
  },

  orders: {
    myList: "/orders/me",
    myDetail: (id) => `/orders/me/${encodeURIComponent(id)}`,
    updateStatus: (id) => `/orders/${encodeURIComponent(id)}/status`,
    list: "/orders",
  },

  manager: {
    products: "/products",
    productById: (id) => `/products/${encodeURIComponent(id)}`,
    categories: "/categories",
    categoryById: (id) => `/categories/${encodeURIComponent(id)}`,
    promotions: "/promotions",
    promotionById: (id) => `/promotions/${encodeURIComponent(id)}`,
    coupons: "/coupons",
    couponById: (id) => `/coupons/${encodeURIComponent(id)}`,
  },

  admin: {
    dashboard: "/admin/dashboard",
    settings: "/admin/settings",
    uploadImagen: "/admin/upload-imagen",
    categorias: "/admin/categorias",
    categoriaById: (id) => `/admin/categorias/${encodeURIComponent(id)}`,
    categoriaEstadoById: (id) => `/admin/categorias/${encodeURIComponent(id)}/estado`,
    productos: "/admin/productos",
    productoById: (id) => `/admin/productos/${encodeURIComponent(id)}`,
    productoEstadoById: (id) => `/admin/productos/${encodeURIComponent(id)}/estado`,
    /** Combos: productos `tipo_producto = PROMOCION` + `productos_componentes`. */
    promocionesProducto: "/admin/promociones-producto",
    promocionProductoById: (id) => `/admin/promociones-producto/${encodeURIComponent(id)}`,
    promocionProductoEstadoById: (id) => `/admin/promociones-producto/${encodeURIComponent(id)}/estado`,
    /** Personal del panel (`usuarios` en backend). Base `/users`. */
    usuarios: "/users",
    usuariosMe: "/users/me",
    usuariosMePassword: "/users/me/password",
    usuarioById: (id) => `/users/${encodeURIComponent(id)}`,
    usuarioPasswordById: (id) => `/users/${encodeURIComponent(id)}/password`,
    configuracion: "/admin/configuracion",
    configuracionCarta: "/admin/configuracion/carta",
    configuracionHorariosDia: "/admin/configuracion/horarios/dia",
    configuracionWhatsapp: "/admin/configuracion/whatsapp",
    configuracionEmailRecuperacion: ADMIN_CONFIG_EMAIL_RECUPERACION_PATH,
  },
};
