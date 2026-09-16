import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "@/components/product/ProductCard";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";

jest.mock("@/store/cart", () => ({
  useCartStore: jest.fn(),
}));

jest.mock("@/components/product/WishlistButton", () => {
  function WishlistButtonMock() {
    return <div data-testid="wishlist-btn" />;
  }
  WishlistButtonMock.displayName = "WishlistButton";
  return WishlistButtonMock;
});

jest.mock("next/image", () => {
  function ImageMock({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />;
  }
  ImageMock.displayName = "Image";
  return ImageMock;
});

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockStore = useCartStore as unknown as jest.Mock;

const product: Product = {
  id: "p1",
  title: "Wireless Mouse",
  description: "A great mouse",
  price: 24.99,
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

afterEach(() => {
  jest.clearAllMocks();
});

describe("ProductCard", () => {
  it("renders the product title, price and category", () => {
    mockStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ addItem: jest.fn() }),
    );

    render(<ProductCard product={product} />);

    expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();
    expect(screen.getByText("$24.99")).toBeInTheDocument();
    expect(screen.getByText("Gadgets")).toBeInTheDocument();
  });

  it("adds the product to the cart on button click", () => {
    const addItem = jest.fn().mockResolvedValue(null);
    mockStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ addItem }),
    );

    render(<ProductCard product={product} />);

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(addItem).toHaveBeenCalledWith(product);
  });

  it("disables the button and shows Out of Stock when stock is zero", () => {
    mockStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ addItem: jest.fn() }),
    );

    render(<ProductCard product={{ ...product, stock: 0 }} />);

    const button = screen.getByRole("button", { name: /out of stock/i });
    expect(button).toBeDisabled();
  });
});