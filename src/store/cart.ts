import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product, ProductVariant } from "@/types";
import { useAuthStore } from "@/store/auth";

interface ApiCartItem {
  id: string;
  quantity: number;
  variant?: ProductVariant | null;
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
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => Promise<string | null>;
  removeItem: (productId: string, variantId?: string | null) => Promise<string | null>;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => Promise<string | null>;
  clearCart: () => Promise<string | null>;
  mergeFromLocal: () => Promise<boolean>;
  loadFromServer: () => Promise<boolean>;
  setHasHydrated: (value: boolean) => void;
}

const toStoreItems = (cart: ApiCart): CartItem[] =>
  cart.items.map((item) => ({
    ...item.product,
    quantity: item.quantity,
    variant: item.variant ?? null,
    price: item.variant ? item.variant.price : item.product.price,
  }));

const itemKey = (productId: string, variantId?: string | null) =>
  variantId ? `v:${variantId}` : `p:${productId}`;

const isAuthenticated = () => !!useAuthStore.getState().user?.id;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      addItem: async (product, quantity = 1, variant) => {
        const available = variant ? variant.stock : product.stock;
        if (isAuthenticated()) {
          const res = await fetch("/api/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: product.id,
              quantity,
              variantId: variant?.id ?? null,
            }),
          });
          const data = await res.json().catch(() => null);
          if (res.ok && data) {
            set({ items: toStoreItems(data as ApiCart) });
            return null;
          }
          if (res.status === 401) {
            const key = itemKey(product.id, variant?.id);
            set((state) => {
              const existing = state.items.find(
                (i) => itemKey(i.id, i.variant?.id) === key,
              );
              const newQty = (existing?.quantity ?? 0) + quantity;
              return {
                items: existing
                  ? state.items.map((i) =>
                      itemKey(i.id, i.variant?.id) === key
                        ? { ...i, quantity: newQty }
                        : i,
                    )
                  : [
                      ...state.items,
                      {
                        ...product,
                        quantity,
                        variant: variant ?? null,
                        price: variant ? variant.price : product.price,
                      },
                    ],
              };
            });
            return null;
          }
          return data?.error ?? "Failed to add to cart";
        }
        const { items } = get();
        const key = itemKey(product.id, variant?.id);
        const existing = items.find(
          (i) => itemKey(i.id, i.variant?.id) === key,
        );
        const newQty = (existing?.quantity ?? 0) + quantity;
        if (newQty > available) {
          return `Only ${available} units of this item are in stock`;
        }
        set(
          existing
            ? {
                items: items.map((i) =>
                  itemKey(i.id, i.variant?.id) === key
                    ? { ...i, quantity: newQty }
                    : i,
                ),
              }
            : {
                items: [
                  ...items,
                  {
                    ...product,
                    quantity,
                    variant: variant ?? null,
                    price: variant ? variant.price : product.price,
                  },
                ],
              },
        );
        return null;
      },
      removeItem: async (productId, variantId) => {
        if (isAuthenticated()) {
          const qs = variantId
            ? `?variantId=${encodeURIComponent(variantId)}`
            : "";
          const res = await fetch(`/api/cart/items/${productId}${qs}`, {
            method: "DELETE",
          });
          const data = await res.json().catch(() => null);
          if (res.ok && data) {
            set({ items: toStoreItems(data as ApiCart) });
            return null;
          }
          return data?.error ?? "Failed to remove item";
        }
        const key = itemKey(productId, variantId);
        set((state) => ({
          items: state.items.filter(
            (item) => itemKey(item.id, item.variant?.id) !== key,
          ),
        }));
        return null;
      },
      updateQuantity: async (productId, quantity, variantId) => {
        if (quantity < 1) return null;
        const key = itemKey(productId, variantId);
        const item = get().items.find(
          (i) => itemKey(i.id, i.variant?.id) === key,
        );
        if (!item) return null;
        if (quantity > item.stock) {
          return `Only ${item.stock} units of this item are in stock`;
        }
        if (isAuthenticated()) {
          const res = await fetch(`/api/cart/items/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity, variantId: variantId ?? null }),
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
            itemKey(i.id, i.variant?.id) === key ? { ...i, quantity } : i,
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
              body: JSON.stringify({
                productId: item.id,
                quantity: item.quantity,
                variantId: item.variant?.id ?? null,
              }),
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
      loadFromServer: async () => {
        if (!isAuthenticated()) return false;
        try {
          const res = await fetch("/api/cart");
          const data = await res.json();
          if (res.ok && data) {
            set({ items: toStoreItems(data as ApiCart) });
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
  items.reduce(
    (total, item) => total + (item.variant ? item.variant.price : item.price) * item.quantity,
    0,
  );