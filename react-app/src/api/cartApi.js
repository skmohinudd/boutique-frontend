import { environment } from "../config/environment";
import { createApiClient } from "./apiClient";

const cartClient = createApiClient(
  environment.api.cartServiceUrl,
);

function requireUserId(userId) {
  if (!userId) {
    throw new Error("A development user ID is required.");
  }
}

export async function clearBackendCart(userId) {
  requireUserId(userId);

  await cartClient.delete(
    `/api/v1/carts/${encodeURIComponent(userId)}`,
  );
}

export async function addBackendCartItem(
  userId,
  productId,
  quantity,
) {
  requireUserId(userId);

  const response = await cartClient.post(
    `/api/v1/carts/${encodeURIComponent(userId)}/items`,
    {
      productId,
      quantity,
    },
  );

  return response.data;
}

export async function synchronizeBackendCart(
  userId,
  items,
) {
  requireUserId(userId);

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cannot synchronize an empty cart.");
  }

  // The React cart is currently the local UI source of truth.
  // Rebuild the backend cart immediately before checkout.
  await clearBackendCart(userId);

  let cart = null;

  for (const item of items) {
    cart = await addBackendCartItem(
      userId,
      item.productId,
      item.quantity,
    );
  }

  return cart;
}
