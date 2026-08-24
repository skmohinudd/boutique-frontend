import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      recordOrder: (order) => set((state) => ({
        orders: [order, ...state.orders.filter((item) => item.orderId !== order.orderId)],
      })),
      getOrder: (orderId) => get().orders.find((order) => order.orderId === orderId) || null,
    }),
    { name: "boutique-orders-v1" },
  ),
);
