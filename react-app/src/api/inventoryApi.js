import { environment } from "../config/environment";
import { createApiClient } from "./apiClient";

const inventoryClient = createApiClient(
  environment.api.inventoryServiceUrl
);

export async function getInventoryByProductId(productId) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  try {
    const response = await inventoryClient.get(
      `/api/v1/inventory/${encodeURIComponent(productId)}`
    );

    return response.data;
  } catch (error) {
    if (error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function createInventory(inventoryData) {
  if (!inventoryData) {
    throw new Error("Inventory data is required.");
  }

  const response = await inventoryClient.post(
    "/api/v1/inventory",
    inventoryData
  );

  return response.data;
}