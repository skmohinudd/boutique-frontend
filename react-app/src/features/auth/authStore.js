import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createUser, updateUser } from "../../api/userApi";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      accounts: [],

      register: async ({ username, firstName, lastName, email, phoneNumber, country, password }) => {
        const normalizedEmail = normalizeEmail(email);
        if (get().accounts.some((account) => account.email === normalizedEmail)) {
          throw new Error("An account with this email already exists in this browser.");
        }

        const created = await createUser({
          email: normalizedEmail,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim(),
          cognitoSub: `web-local-${crypto.randomUUID()}`,
        });

        const account = {
          id: created.id,
          username: username.trim(),
          firstName: created.firstName,
          lastName: created.lastName,
          email: created.email,
          phoneNumber: created.phoneNumber || phoneNumber.trim(),
          country: country.trim(),
          passwordHash: await hashPassword(password),
          createdAt: created.createdAt || new Date().toISOString(),
        };

        set((state) => ({
          accounts: [...state.accounts, account],
          currentUser: account,
        }));
        return account;
      },

      login: async ({ email, password }) => {
        const normalizedEmail = normalizeEmail(email);
        const passwordHash = await hashPassword(password);
        const account = get().accounts.find(
          (candidate) => candidate.email === normalizedEmail && candidate.passwordHash === passwordHash,
        );
        if (!account) {
          throw new Error("Invalid email or password. Register first on this browser if this is your first visit.");
        }
        set({ currentUser: account });
        return account;
      },

      logout: () => set({ currentUser: null }),

      updateProfile: async ({ username, firstName, lastName, phoneNumber, country }) => {
        const current = get().currentUser;
        if (!current) throw new Error("You must be signed in.");

        const updated = await updateUser(current.id, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim(),
        });
        const merged = {
          ...current,
          username: username.trim(),
          firstName: updated.firstName,
          lastName: updated.lastName,
          phoneNumber: updated.phoneNumber || "",
          country: country.trim(),
        };

        set((state) => ({
          currentUser: merged,
          accounts: state.accounts.map((account) => account.id === merged.id ? merged : account),
        }));
        return merged;
      },
    }),
    {
      name: "boutique-auth-v1",
      partialize: (state) => ({ currentUser: state.currentUser, accounts: state.accounts }),
    },
  ),
);

