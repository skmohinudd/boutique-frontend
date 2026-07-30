import { getProductById, getProducts } from "../../api/productApi";

function extractProducts(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
}

export async function fetchProducts() {
  const response = await getProducts();

  return extractProducts(response);
}

export async function fetchProductById(productId) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  return getProductById(productId);
}