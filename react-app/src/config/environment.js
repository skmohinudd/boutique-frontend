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
    environment: import.meta.env.VITE_APP_ENV || "local",
  }),

  api: Object.freeze({
    productServiceUrl: readString(
      import.meta.env.VITE_PRODUCT_API_URL,
      "http://localhost:8080",
    ),

    inventoryServiceUrl: readString(
      import.meta.env.VITE_INVENTORY_API_URL,
      "http://localhost:8081",
    ),

    userServiceUrl: readString(
      import.meta.env.VITE_USER_API_URL,
      "http://localhost:8082",
    ),

    cartServiceUrl: readString(
      import.meta.env.VITE_CART_API_URL,
      "http://localhost:8083",
    ),

    checkoutServiceUrl: readString(
      import.meta.env.VITE_CHECKOUT_API_URL,
      "http://localhost:8086",
    ),

    timeoutMs: readNumber(
      import.meta.env.VITE_API_TIMEOUT_MS,
      10000,
    ),
  }),

  development: Object.freeze({
    userId:
      import.meta.env.VITE_DEMO_USER_ID ||
      "e1aef5d2-a5e1-42f1-8421-8c30bd5207f6",

    cardLast4:
      import.meta.env.VITE_DEMO_CARD_LAST4 ||
      "4242",
  }),

  commerce: Object.freeze({
    defaultCurrency:
      import.meta.env.VITE_DEFAULT_CURRENCY || "USD",
  }),

  features: Object.freeze({
    advertisements: readBoolean(
      import.meta.env.VITE_ENABLE_ADVERTISEMENTS,
      true,
    ),

    recommendations: readBoolean(
      import.meta.env.VITE_ENABLE_RECOMMENDATIONS,
      false,
    ),

    currency: readBoolean(
      import.meta.env.VITE_ENABLE_CURRENCY,
      false,
    ),

    assistant: readBoolean(
      import.meta.env.VITE_ENABLE_ASSISTANT,
      false,
    ),
  }),
});
