import { environment } from "../config/environment";
import { createApiClient } from "./apiClient";
const cartClient = createApiClient(environment.api.cartServiceUrl);
function requireUserId(userId) {
  if (!userId) throw new Error("Your account profile is not ready yet.");
}
export async function clearBackendCart(userId) {
  requireUserId(userId);
  await cartClient.delete(`/api/v1/carts/${encodeURIComponent(userId)}`);
}
export async function addBackendCartItem(userId, productId, quantity) {
  requireUserId(userId);
  return (
    await cartClient.post(`/api/v1/carts/${encodeURIComponent(userId)}/items`, {
      productId,
      quantity,
    })
  ).data;
}
export async function synchronizeBackendCart(userId, items) {
  requireUserId(userId);
  if (!Array.isArray(items) || items.length === 0)
    throw new Error("Your cart is empty.");
  await clearBackendCart(userId);
  let cart = null;
  for (const item of items)
    cart = await addBackendCartItem(userId, item.productId, item.quantity);
  return cart;
}
