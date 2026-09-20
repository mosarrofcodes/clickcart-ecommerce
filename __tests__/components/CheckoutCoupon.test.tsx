import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CheckoutPage from "@/app/(routes)/checkout/page";

jest.mock("next/image", () => {
  function ImageMock({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />;
  }
  ImageMock.displayName = "Image";
  return ImageMock;
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const clearCartMock = jest.fn();

jest.mock("@/store/cart", () => ({
  useCartStore: (selector: (state: unknown) => unknown) =>
    selector({
      items: [
        {
          id: "p1",
          title: "Headphones",
          price: 99.99,
          quantity: 1,
          image: "/headphones.jpg",
        },
      ],
      hasHydrated: true,
      clearCart: clearCartMock,
    }),
  selectCartTotal: (items: { price: number; quantity: number }[]) =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe("CheckoutPage coupon input", () => {
  it("applies a valid coupon and shows the discount", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: "SAVE10",
        discountAmount: 10,
        freeShipping: false,
        subtotal: 99.99,
      }),
    });

    render(<CheckoutPage />);

    fireEvent.change(screen.getByPlaceholderText("Coupon code"), {
      target: { value: "save10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(screen.getByText(/Coupon "SAVE10" applied — ৳10\.00 off/)).toBeInTheDocument();
    });
    expect(screen.getByText("-৳10.00")).toBeInTheDocument();
  });

  it("shows an error for an invalid coupon", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Invalid coupon code." }),
    });

    render(<CheckoutPage />);

    fireEvent.change(screen.getByPlaceholderText("Coupon code"), {
      target: { value: "NOPE" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid coupon code.")).toBeInTheDocument();
    });
  });
});