import { environment } from "../config/environment";
import { createApiClient } from "./apiClient";

const productClient = createApiClient(
  environment.api.productServiceUrl
);

export async function getProducts() {
  const response = await productClient.get(
    "/api/v1/products"
  );

  return response.data;
}

export async function getProductById(productId) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  const response = await productClient.get(
    `/api/v1/products/${encodeURIComponent(productId)}`
  );

  return response.data;
}

export async function createProduct(productData) {
  if (!productData) {
    throw new Error("Product data is required.");
  }

  const response = await productClient.post(
    "/api/v1/products",
    productData
  );

  return response.data;
}