export const apiPaths = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    /** Current session / profile (Bearer). Alias common names: profile, me. */
    me: "/auth/profile",
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
    myList: "/orders/me/list",
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
  },
};
