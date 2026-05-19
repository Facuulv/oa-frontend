const appConfig = {
  name: "OA!",
  shortName: "OA!",
  description: "Tu tienda online",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  theme: {
    primary: "#C1121F",
    primaryDark: "#A10E19",
    primaryLight: "#D6454F",
    accent: "#f59e0b",
    accentLight: "#fbbf24",
    background: "#f5f5f5",
    surface: "#ffffff",
    text: "#1f2937",
    textSecondary: "#6b7280",
    error: "#ef4444",
    success: "#22c55e",
  },

  features: {
    storeHoursValidation: process.env.NEXT_PUBLIC_ENABLE_STORE_HOURS_VALIDATION === "true",
    cashPayment: true,
    delivery: true,
    pickup: true,
    promotions: true,
    coupons: true,
  },

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
    timeout: 15000,
  },

  cart: {
    storageKey: "oa-carrito",
  },

  savedCombos: {
    storageKey: "tus_combos",
    maxItems: 10,
  },

  pwa: {
    themeColor: "#C1121F",
    backgroundColor: "#f5f5f5",
  },
};

export default appConfig;
