import { getInventoryByProductId } from "../../api/inventoryApi";

export async function fetchInventoryByProductId(productId) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  return getInventoryByProductId(productId);
}

export function getStockInformation(inventory) {
  if (!inventory) {
    return {
      available: false,
      quantity: 0,
      label: "Stock unavailable",
    };
  }

  const quantity = Number(
    inventory.sellableQuantity ??
      inventory.availableQuantity ??
      0,
  );

  if (quantity <= 0) {
    return {
      available: false,
      quantity: 0,
      label: "Out of stock",
    };
  }

  if (quantity <= 5) {
    return {
      available: true,
      quantity,
      label: `Only ${quantity} left`,
    };
  }

  return {
    available: true,
    quantity,
    label: "In stock",
  };
}