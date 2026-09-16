import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/types";
import { useAuthStore } from "@/store/auth";

interface WishlistState {
  items: Product[];
  hasHydrated: boolean;
  loadFromServer: () => Promise<boolean>;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  mergeFromLocal: () => Promise<boolean>;
  setHasHydrated: (value: boolean) => void;
}

const isAuthenticated = () => !!useAuthStore.getState().user?.id;

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      loadFromServer: async () => {
        if (!isAuthenticated()) return false;
        try {
          const res = await fetch("/api/wishlist");
          const data = await res.json();
          if (res.ok && data?.items) {
            set({ items: data.items as Product[] });
            return true;
          }
        } catch {
          return false;
        }
        return false;
      },

      addItem: async (product) => {
        if (isAuthenticated()) {
          try {
            const res = await fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: product.id }),
            });
            if (res.ok) {
              await get().loadFromServer();
              return;
            }
            if (res.status !== 401) return;
          } catch {
            return;
          }
        }
        if (get().isInWishlist(product.id)) return;
        set((state) => ({ items: [product, ...state.items] }));
      },

      removeItem: async (productId) => {
        if (isAuthenticated()) {
          try {
            const res = await fetch(`/api/wishlist/${productId}`, {
              method: "DELETE",
            });
            if (res.ok) {
              await get().loadFromServer();
              return;
            }
            if (res.status !== 401) return;
          } catch {
            return;
          }
        }
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      isInWishlist: (productId) =>
        get().items.some((item) => item.id === productId),

      mergeFromLocal: async () => {
        if (!isAuthenticated()) return false;
        if (typeof window === "undefined") return false;

        const raw = localStorage.getItem("clickcart-wishlist");
        if (!raw) return false;
        const localItems = (JSON.parse(raw)?.state?.items ?? []) as Product[];
        if (localItems.length === 0) return false;

        for (const item of localItems) {
          try {
            const res = await fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: item.id }),
            });
            if (!res.ok) return false;
          } catch {
            return false;
          }
        }

        const ok = await get().loadFromServer();
        if (ok) {
          localStorage.removeItem("clickcart-wishlist");
        }
        return ok;
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "clickcart-wishlist",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: isAuthenticated() ? [] : state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const selectWishlistCount = (items: Product[]) => items.length;