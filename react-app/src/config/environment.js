function removeTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function readString(value, fallbackValue) {
  const resolvedValue = value?.trim() || fallbackValue;

  return removeTrailingSlash(resolvedValue);
}

function readNumber(value, fallbackValue) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : fallbackValue;
}

function readBoolean(value, fallbackValue = false) {
  if (value === undefined || value === null || value === "") {
    return fallbackValue;
  }

  return String(value).toLowerCase() === "true";
}

export const environment = Object.freeze({
  app: Object.freeze({
    name: import.meta.env.VITE_APP_NAME || "Boutique",
    environment: import.meta.env.VITE_APP_ENV || "local"
  }),

  api: Object.freeze({
    productServiceUrl: readString(
      import.meta.env.VITE_PRODUCT_API_URL,
      "http://localhost:8080"
    ),

    inventoryServiceUrl: readString(
      import.meta.env.VITE_INVENTORY_API_URL,
      "http://localhost:8081"
    ),

    cartServiceUrl: readString(
      import.meta.env.VITE_CART_API_URL,
      "http://localhost:8082"
    ),

    checkoutServiceUrl: readString(
      import.meta.env.VITE_CHECKOUT_API_URL,
      "http://localhost:8083"
    ),

    timeoutMs: readNumber(
      import.meta.env.VITE_API_TIMEOUT_MS,
      5000
    )
  }),

  commerce: Object.freeze({
    defaultCurrency:
      import.meta.env.VITE_DEFAULT_CURRENCY || "USD"
  }),

  features: Object.freeze({
    advertisements: readBoolean(
      import.meta.env.VITE_ENABLE_ADVERTISEMENTS,
      true
    ),

    recommendations: readBoolean(
      import.meta.env.VITE_ENABLE_RECOMMENDATIONS,
      false
    ),

    currency: readBoolean(
      import.meta.env.VITE_ENABLE_CURRENCY,
      false
    ),

    assistant: readBoolean(
      import.meta.env.VITE_ENABLE_ASSISTANT,
      false
    )
  })
});