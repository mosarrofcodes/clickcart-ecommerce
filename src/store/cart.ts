import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product } from "@/types";
import { useAuthStore } from "@/store/auth";

interface ApiCartItem {
  id: string;
  quantity: number;
  product: Product;
}

interface ApiCart {
  id: string;
  items: ApiCartItem[];
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (product: Product, quantity?: number) => Promise<string | null>;
  removeItem: (productId: string) => Promise<string | null>;
  updateQuantity: (productId: string, quantity: number) => Promise<string | null>;
  clearCart: () => Promise<string | null>;
  mergeFromLocal: () => Promise<boolean>;
  setHasHydrated: (value: boolean) => void;
}

const toStoreItems = (cart: ApiCart): CartItem[] =>
  cart.items.map((item) => ({ ...item.product, quantity: item.quantity }));

const isAuthenticated = () => !!useAuthStore.getState().user?.id;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      addItem: async (product, quantity = 1) => {
        if (isAuthenticated()) {
          const res = await fetch("/api/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id, quantity }),
          });
          const data = await res.json().catch(() => null);
          if (res.ok && data) {
            set({ items: toStoreItems(data as ApiCart) });
            return null;
          }
          if (res.status === 401) {
            set((state) => {
              const existing = state.items.find((i) => i.id === product.id);
              const newQty = (existing?.quantity ?? 0) + quantity;
              return {
                items: existing
                  ? state.items.map((i) =>
                      i.id === product.id ? { ...i, quantity: newQty } : i,
                    )
                  : [...state.items, { ...product, quantity }],
              };
            });
            return null;
          }
          return data?.error ?? "Failed to add to cart";
        }
        const { items } = get();
        const existing = items.find((i) => i.id === product.id);
        const newQty = (existing?.quantity ?? 0) + quantity;
        if (newQty > product.stock) {
          return `Only ${product.stock} units of this item are in stock`;
        }
        set(
          existing
            ? {
                items: items.map((i) =>
                  i.id === product.id ? { ...i, quantity: newQty } : i,
                ),
              }
            : { items: [...items, { ...product, quantity }] },
        );
        return null;
      },
      removeItem: async (productId) => {
        if (isAuthenticated()) {
          const res = await fetch(`/api/cart/items/${productId}`, {
            method: "DELETE",
          });
          const data = await res.json().catch(() => null);
          if (res.ok && data) {
            set({ items: toStoreItems(data as ApiCart) });
            return null;
          }
          return data?.error ?? "Failed to remove item";
        }
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
        return null;
      },
      updateQuantity: async (productId, quantity) => {
        if (quantity < 1) return null;
        const item = get().items.find((i) => i.id === productId);
        if (!item) return null;
        if (quantity > item.stock) {
          return `Only ${item.stock} units of this item are in stock`;
        }
        if (isAuthenticated()) {
          const res = await fetch(`/api/cart/items/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity }),
          });
          const data = await res.json().catch(() => null);
          if (res.ok && data) {
            set({ items: toStoreItems(data as ApiCart) });
            return null;
          }
          return data?.error ?? "Failed to update quantity";
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === productId ? { ...i, quantity } : i,
          ),
        }));
        return null;
      },
      clearCart: async () => {
        if (isAuthenticated()) {
          const res = await fetch("/api/cart", { method: "DELETE" });
          const data = await res.json().catch(() => null);
          if (res.ok && data) {
            set({ items: [] });
            return null;
          }
          return data?.error ?? "Failed to clear cart";
        }
        set({ items: [] });
        return null;
      },
      mergeFromLocal: async () => {
        if (!isAuthenticated()) return false;
        if (typeof window === "undefined") return false;

        const raw = localStorage.getItem("clickcart-cart");
        if (!raw) return false;
        const localItems = (JSON.parse(raw)?.state?.items ?? []) as CartItem[];
        if (localItems.length === 0) return false;

        for (const item of localItems) {
          try {
            const res = await fetch("/api/cart/items", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
            });
            if (!res.ok) return false;
          } catch {
            return false;
          }
        }

        try {
          const res = await fetch("/api/cart");
          const data = await res.json();
          if (res.ok && data) {
            set({ items: toStoreItems(data as ApiCart) });
            localStorage.removeItem("clickcart-cart");
            return true;
          }
        } catch {
          return false;
        }
        return false;
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "clickcart-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: isAuthenticated() ? [] : state.items }), 
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const selectCartCount = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

export const selectCartTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);