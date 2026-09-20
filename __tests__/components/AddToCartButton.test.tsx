import { render, screen, fireEvent } from "@testing-library/react";
import AddToCartButton from "@/components/product/AddToCartButton";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";

jest.mock("@/store/cart", () => ({
  useCartStore: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockStore = useCartStore as unknown as jest.Mock;

const product: Product = {
  id: "p1",
  title: "Keyboard",
  description: "Mechanical",
  price: 39,
  oldPrice: null,
  stock: 5,
  image: "/kb.jpg",
  brand: "KeyCo",
  rating: 4,
  sku: "SKU-KB",
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
};

describe("AddToCartButton", () => {
  it("adds the product to the cart", () => {
    const addItem = jest.fn().mockResolvedValue(null);
    mockStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ addItem }),
    );

    render(<AddToCartButton product={product} />);
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(addItem).toHaveBeenCalledWith(product, 1, undefined);
  });

  it("is disabled for out-of-stock products", () => {
    mockStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ addItem: jest.fn() }),
    );

    render(<AddToCartButton product={{ ...product, stock: 0 }} />);
    expect(screen.getByRole("button", { name: /out of stock/i })).toBeDisabled();
  });
});