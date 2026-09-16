import {
  computeShipping,
  cartSummary,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
} from "@/lib/cart-service";
import type { getOrCreateCart } from "@/lib/cart-service";

jest.mock("@/lib/db", () => ({ db: {} }));

type Cart = Awaited<ReturnType<typeof getOrCreateCart>>;

function makeCart(items: { price: number; quantity: number }[]): Cart {
  return {
    id: "cart-1",
    userId: "user-1",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    items: items.map((item, index) => ({
      id: `item-${index}`,
      cartId: "cart-1",
      productId: `product-${index}`,
      quantity: item.quantity,
      product: {
        id: `product-${index}`,
        title: `Product ${index}`,
        description: "desc",
        price: item.price,
        stock: 10,
        image: "x.jpg",
        brand: null,
        rating: 0,
        sku: `SKU-${index}`,
        weight: null,
        tags: [],
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
      },
    })) as Cart["items"],
  };
}

describe("computeShipping", () => {
  it("charges the flat rate below the free-shipping threshold", () => {
    expect(computeShipping(10)).toBe(SHIPPING_COST);
    expect(computeShipping(FREE_SHIPPING_THRESHOLD - 0.01)).toBe(SHIPPING_COST);
  });

  it("is free at or above the threshold", () => {
    expect(computeShipping(FREE_SHIPPING_THRESHOLD)).toBe(0);
    expect(computeShipping(999)).toBe(0);
  });
});

describe("cartSummary", () => {
  it("computes the subtotal of all items", () => {
    const cart = makeCart([
      { price: 10, quantity: 2 },
      { price: 5.5, quantity: 3 },
    ]);
    expect(cartSummary(cart).subtotal).toBe(36.5);
  });

  it("returns zero for an empty cart", () => {
    expect(cartSummary(makeCart([])).subtotal).toBe(0);
  });

  it("rounds the subtotal to two decimal places", () => {
    const cart = makeCart([{ price: 0.1, quantity: 3 }]);
    expect(cartSummary(cart).subtotal).toBe(0.3);
  });
});