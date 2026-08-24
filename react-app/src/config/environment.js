function clean(value) {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}
function asNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function asBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
}
function apiUrl(value, localFallback, serviceName) {
  const configured = clean(value);
  if (configured) return configured;
  if (import.meta.env.PROD)
    throw new Error(
      `${serviceName} API URL is missing from the build configuration.`,
    );
  return localFallback;
}

const defaultOrigin =
  typeof window === "undefined"
    ? "http://localhost:5173"
    : window.location.origin;
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || "";
const region = import.meta.env.VITE_COGNITO_REGION || "us-east-1";

export const environment = Object.freeze({
  app: Object.freeze({
    name: import.meta.env.VITE_APP_NAME || "Boutique",
    environment: import.meta.env.VITE_APP_ENV || "dev",
  }),
  api: Object.freeze({
    productServiceUrl: apiUrl(
      import.meta.env.VITE_PRODUCT_API_URL,
      "/product-api",
      "Product",
    ),
    inventoryServiceUrl: apiUrl(
      import.meta.env.VITE_INVENTORY_API_URL,
      "/inventory-api",
      "Inventory",
    ),
    userServiceUrl: apiUrl(
      import.meta.env.VITE_USER_API_URL,
      "/user-api",
      "User",
    ),
    cartServiceUrl: apiUrl(
      import.meta.env.VITE_CART_API_URL,
      "/cart-api",
      "Cart",
    ),
    orderServiceUrl: apiUrl(
      import.meta.env.VITE_ORDER_API_URL,
      "/order-api",
      "Order",
    ),
    paymentServiceUrl: apiUrl(
      import.meta.env.VITE_PAYMENT_API_URL,
      "/payment-api",
      "Payment",
    ),
    checkoutServiceUrl: apiUrl(
      import.meta.env.VITE_CHECKOUT_API_URL,
      "/checkout-api",
      "Checkout",
    ),
    shippingServiceUrl: apiUrl(
      import.meta.env.VITE_SHIPPING_API_URL,
      "/shipping-api",
      "Shipping",
    ),
    timeoutMs: asNumber(import.meta.env.VITE_API_TIMEOUT_MS, 15000),
  }),
  commerce: Object.freeze({
    defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY || "USD",
  }),
  auth: Object.freeze({
    region,
    userPoolId,
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || "",
    domain: clean(import.meta.env.VITE_COGNITO_DOMAIN || ""),
    authority: userPoolId
      ? `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`
      : "",
    redirectUri:
      import.meta.env.VITE_COGNITO_REDIRECT_URI || `${defaultOrigin}/`,
    logoutUri: import.meta.env.VITE_COGNITO_LOGOUT_URI || `${defaultOrigin}/`,
    scope: import.meta.env.VITE_COGNITO_SCOPE || "openid email",
  }),
  features: Object.freeze({
    advertisements: asBool(import.meta.env.VITE_ENABLE_ADVERTISEMENTS, true),
    recommendations: asBool(import.meta.env.VITE_ENABLE_RECOMMENDATIONS, true),
  }),
});
