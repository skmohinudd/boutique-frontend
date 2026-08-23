function clean(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}
function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function bool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
}
function apiUrl(value, localFallback, serviceName) {
  const configured = clean(value);
  if (configured) return configured;
  if (import.meta.env.PROD) {
    throw new Error(`${serviceName} API URL is missing from the deployed build configuration.`);
  }
  return localFallback;
}

export const environment = Object.freeze({
  app: Object.freeze({
    name: import.meta.env.VITE_APP_NAME || "Boutique",
    environment: import.meta.env.VITE_APP_ENV || "dev",
  }),
  api: Object.freeze({
    productServiceUrl: apiUrl(import.meta.env.VITE_PRODUCT_API_URL, "/product-api", "Product"),
    inventoryServiceUrl: apiUrl(import.meta.env.VITE_INVENTORY_API_URL, "/inventory-api", "Inventory"),
    userServiceUrl: apiUrl(import.meta.env.VITE_USER_API_URL, "/user-api", "User"),
    cartServiceUrl: apiUrl(import.meta.env.VITE_CART_API_URL, "/cart-api", "Cart"),
    orderServiceUrl: apiUrl(import.meta.env.VITE_ORDER_API_URL, "/order-api", "Order"),
    paymentServiceUrl: apiUrl(import.meta.env.VITE_PAYMENT_API_URL, "/payment-api", "Payment"),
    checkoutServiceUrl: apiUrl(import.meta.env.VITE_CHECKOUT_API_URL, "/checkout-api", "Checkout"),
    shippingServiceUrl: apiUrl(import.meta.env.VITE_SHIPPING_API_URL, "/shipping-api", "Shipping"),
    timeoutMs: number(import.meta.env.VITE_API_TIMEOUT_MS, 15000),
  }),
  development: Object.freeze({ cardLast4: import.meta.env.VITE_DEMO_CARD_LAST4 || "4242" }),
  commerce: Object.freeze({ defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY || "USD" }),
  auth: Object.freeze({
    mode: import.meta.env.VITE_AUTH_MODE || "local",
    region: import.meta.env.VITE_COGNITO_REGION || "",
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || "",
  }),
  features: Object.freeze({
    advertisements: bool(import.meta.env.VITE_ENABLE_ADVERTISEMENTS, false),
    recommendations: bool(import.meta.env.VITE_ENABLE_RECOMMENDATIONS, false),
    currency: bool(import.meta.env.VITE_ENABLE_CURRENCY, false),
    assistant: bool(import.meta.env.VITE_ENABLE_ASSISTANT, false),
  }),
});

