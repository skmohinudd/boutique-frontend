import { create } from "zustand";
import { persist } from "zustand/middleware";

function getProductId(product) {
  return product.id || product.productId;
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, availableQuantity = 1) => {
        const productId = getProductId(product);

        if (!productId || availableQuantity <= 0) {
          return;
        }

        const existingItem = get().items.find(
          (item) => item.productId === productId,
        );

        if (existingItem) {
          set({
            items: get().items.map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: Math.min(
                      item.quantity + 1,
                      availableQuantity,
                    ),
                    availableQuantity,
                  }
                : item,
            ),
          });

          return;
        }

        set({
          items: [
            ...get().items,
            {
              productId,
              name: product.name,
              price: Number(product.price || 0),
              currency: product.currency || "USD",
              imageUrl: product.imageUrl || product.image,
              quantity: 1,
              availableQuantity,
            },
          ],
        });
      },

      increaseQuantity: (productId) => {
        set({
          items: get().items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + 1,
                    item.availableQuantity,
                  ),
                }
              : item,
          ),
        });
      },

      decreaseQuantity: (productId) => {
        set({
          items: get().items
            .map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item,
            )
            .filter((item) => item.quantity > 0),
        });
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter(
            (item) => item.productId !== productId,
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: "boutique-cart",
    },
  ),
);

export function getCartItemCount(items) {
  return items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
}

export function getCartTotal(items) {
  return items.reduce(
    (total, item) =>
      total + Number(item.price || 0) * item.quantity,
    0,
  );
}