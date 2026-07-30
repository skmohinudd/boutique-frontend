import { useQuery } from "@tanstack/react-query";
import {
  fetchProductById,
  fetchProducts,
} from "./productService";

export const productQueryKeys = {
  all: ["products"],
  lists: () => [...productQueryKeys.all, "list"],
  list: (filters = {}) => [
    ...productQueryKeys.lists(),
    filters,
  ],
  details: () => [...productQueryKeys.all, "detail"],
  detail: (productId) => [
    ...productQueryKeys.details(),
    productId,
  ],
};

export function useProducts() {
  return useQuery({
    queryKey: productQueryKeys.list(),
    queryFn: fetchProducts,
  });
}

export function useProduct(productId) {
  return useQuery({
    queryKey: productQueryKeys.detail(productId),
    queryFn: () => fetchProductById(productId),
    enabled: Boolean(productId),
  });
}