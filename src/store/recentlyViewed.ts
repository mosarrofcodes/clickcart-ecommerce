import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/types";

interface RecentlyViewedState {
  items: Product[];
  add: (product: Product) => void;
  clear: () => void;
}

const MAX_ITEMS = 8;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      add: (product) =>
        set((state) => ({
          items: [
            product,
            ...state.items.filter((i) => i.id !== product.id),
          ].slice(0, MAX_ITEMS),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "clickcart-recently-viewed",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);