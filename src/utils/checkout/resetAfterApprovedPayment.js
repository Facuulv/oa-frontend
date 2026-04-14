import appConfig from "@/config/app.config";

export function resetAfterApprovedPayment(clearCartFn) {
  if (typeof clearCartFn === "function") {
    clearCartFn();
  }
  try {
    sessionStorage.removeItem("oa-checkout-form");
    localStorage.removeItem(appConfig.cart.storageKey);
  } catch {
    // silent fail in SSR or restricted storage
  }
}
