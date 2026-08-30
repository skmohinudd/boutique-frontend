import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncCurrentUser, updateUser } from "../../api/userApi";

const prettyName = (email) => {
  const base = String(email || "Shopper")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim();
  return base ? base.replace(/\b\w/g, (c) => c.toUpperCase()) : "Shopper";
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      profileStatus: "idle",
      profileError: "",

      setSignedOut: () =>
        set({ currentUser: null, profileStatus: "idle", profileError: "" }),

      // The backend derives Cognito sub/email from the verified JWT and returns or creates one stable Boutique profile.
      syncFromCognito: async (claims) => {
        const sub = claims?.sub;
        const email = claims?.email;
        if (!sub || !email) {
          throw new Error(
            "Your sign-in did not return the required account information.",
          );
        }

        set({ profileStatus: "loading", profileError: "" });

        try {
          const display = claims.given_name || prettyName(email);
          const user = await syncCurrentUser({
            email,
            firstName: claims.given_name || display,
            lastName: claims.family_name || "Customer",
            phoneNumber: claims.phone_number || "",
            cognitoSub: sub,
          });

          const merged = {
            ...user,
            cognitoSub: sub,
            email: user.email || email,
          };

          set({ currentUser: merged, profileStatus: "ready", profileError: "" });
          return merged;
        } catch (error) {
          const message = error.message || "Unable to load your account profile.";
          set({ profileStatus: "error", profileError: message });
          throw error;
        }
      },

      updateProfile: async (changes) => {
        const current = get().currentUser;
        if (!current?.id) {
          throw new Error("Your account profile is not ready yet.");
        }

        const updated = await updateUser(current.id, {
          firstName: String(changes.firstName || "").trim(),
          lastName: String(changes.lastName || "").trim(),
          phoneNumber: String(changes.phoneNumber || "").trim(),
        });

        const merged = {
          ...current,
          ...updated,
          country: changes.country || current.country || "India",
        };

        set({ currentUser: merged });
        return merged;
      },
    }),
    {
      name: "boutique-account-v2",
      partialize: (state) => ({ currentUser: state.currentUser }),
    },
  ),
);
