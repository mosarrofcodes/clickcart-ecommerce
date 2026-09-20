import { useAuthStore } from "@/store/auth";
import { useCartStore, selectCartCount, selectCartTotal } from "@/store/cart";
import type { Product } from "@/types";

const product: Product = {
  id: "p1",
  title: "Wireless Mouse",
  description: "A great mouse",
  price: 24.99,
  oldPrice: null,
  stock: 10,
  image: "/mouse.jpg",
  brand: "ClickCart",
  rating: 4.5,
  sku: "SKU-1",
  weight: 0.2,
  tags: ["mouse"],
  categoryId: "cat-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  category: {
    id: "cat-1",
    name: "Gadgets",
    slug: "gadgets",
    image: null,
    description: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
};

const serverCart = {
  id: "cart-1",
  subtotal: 49.98,
  items: [
    {
      id: "ci-1",
      quantity: 2,
      variant: null,
      product,
    },
  ],
};

describe("cart store — loadFromServer", () => {
  beforeEach(() => {
    useAuthStore.getState().setUser({
      id: "u1",
      name: "Test User",
      email: "test@example.com",
    });
    useCartStore.setState({ items: [], hasHydrated: true });
    jest.clearAllMocks();
  });

  afterEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it("restores the server cart into the store for authenticated users", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => serverCart,
    }) as unknown as typeof fetch;

    const ok = await useCartStore.getState().loadFromServer();

    expect(ok).toBe(true);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
    expect(useCartStore.getState().items[0].price).toBe(24.99);
  });

  it("keeps the store empty when the user is signed out", async () => {
    useAuthStore.getState().clearAuth();
    global.fetch = jest.fn() as unknown as typeof fetch;

    const ok = await useCartStore.getState().loadFromServer();

    expect(ok).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("selectors aggregate quantity and price", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => serverCart,
    }) as unknown as typeof fetch;

    await useCartStore.getState().loadFromServer();

    const items = useCartStore.getState().items;
    expect(selectCartCount(items)).toBe(2);
    expect(selectCartTotal(items)).toBeCloseTo(49.98);
  });
});