export const apiPaths = {
  /** Registro público de cliente (alias histórico; preferir `auth.register`). */
  clientes: {
    register: "/clientes/register",
  },

  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    register: "/auth/register",
    me: "/auth/me",
  },

  public: {
    categories: "/public/categories",
    products: "/public/products",
    productById: (id) => `/public/products/${encodeURIComponent(id)}`,
    promotions: "/public/promotions",
    couponsValidate: "/public/coupons/validate",
    orders: "/public/orders",
    checkoutPreference: "/public/checkout/preference",
  },

  orders: {
    myList: "/orders/me",
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
    categorias: "/admin/categorias",
    categoriaById: (id) => `/admin/categorias/${encodeURIComponent(id)}`,
    categoriaEstadoById: (id) => `/admin/categorias/${encodeURIComponent(id)}/estado`,
    productos: "/admin/productos",
    productoById: (id) => `/admin/productos/${encodeURIComponent(id)}`,
    productoEstadoById: (id) => `/admin/productos/${encodeURIComponent(id)}/estado`,
  },
};
