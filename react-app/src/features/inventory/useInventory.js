import { useQuery } from "@tanstack/react-query";
import { fetchInventoryByProductId } from "./inventoryService";

export const inventoryQueryKeys = {
  all: ["inventory"],
  detail: (productId) => [
    ...inventoryQueryKeys.all,
    productId,
  ],
};

export function useInventory(productId) {
  return useQuery({
    queryKey: inventoryQueryKeys.detail(productId),
    queryFn: () => fetchInventoryByProductId(productId),
    enabled: Boolean(productId),
    staleTime: 15_000,
  });
}