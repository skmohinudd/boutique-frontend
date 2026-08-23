import { create } from "zustand";
import { persist } from "zustand/middleware";

const emptyAddress = {
  fullName: "",
  email: "",
  phone: "",
  country: "India",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

export const useShippingStore = create(
  persist(
    (set) => ({
      address: emptyAddress,
      setAddress: (address) => set({ address }),
      clearAddress: () => set({ address: emptyAddress }),
    }),
    { name: "boutique-shipping-v1" },
  ),
);
