import { create } from "zustand";

interface UIState {
  cartDrawerOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  wishlistOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
  setCartDrawerOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setWishlistOpen: (open: boolean) => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  cartDrawerOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  wishlistOpen: false,
  openCartDrawer: () => set({ cartDrawerOpen: true }),
  closeCartDrawer: () => set({ cartDrawerOpen: false }),
  toggleCartDrawer: () =>
    set((state) => ({ cartDrawerOpen: !state.cartDrawerOpen })),
  setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
  setWishlistOpen: (open) => set({ wishlistOpen: open }),
  closeAll: () =>
    set({
      cartDrawerOpen: false,
      mobileMenuOpen: false,
      searchOpen: false,
      wishlistOpen: false,
    }),
}));