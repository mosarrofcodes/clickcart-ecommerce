import {
  formatMoney,
  orderConfirmationEmail,
  shippingNotificationEmail,
  paymentReceiptEmail,
  type OrderEmailContext,
} from "@/lib/email-templates";

const ctx: OrderEmailContext = {
  orderId: "oc_123",
  customerName: "Sadia Rahman",
  items: [
    { title: "Wireless Mouse", quantity: 2, price: 12.5 },
    { title: "Keyboard", quantity: 1, price: 30 },
  ],
  subtotal: 55,
  shipping: 0,
  discount: 5.5,
  total: 49.5,
  address: "House 12, Road 5, Dhaka",
  phone: "01712345678",
};

describe("formatMoney", () => {
  it("formats numbers as taka (BDT) with two decimals", () => {
    expect(formatMoney(9)).toBe("৳9.00");
    expect(formatMoney(49.5)).toBe("৳49.50");
  });
});

describe("email templates", () => {
  it("renders the order confirmation with order id, items and total", () => {
    const html = orderConfirmationEmail(ctx);
    expect(html).toContain("#oc_123");
    expect(html).toContain("Sadia Rahman");
    expect(html).toContain("Wireless Mouse");
    expect(html).toContain("৳25.00");
    expect(html).toContain("৳49.50");
    expect(html).toContain("Free");
  });

  it("renders the shipping notification", () => {
    const html = shippingNotificationEmail(ctx);
    expect(html).toContain("#oc_123");
    expect(html).toContain("has shipped");
    expect(html).toContain("House 12, Road 5, Dhaka");
  });

  it("renders the payment receipt", () => {
    const html = paymentReceiptEmail(ctx);
    expect(html).toContain("#oc_123");
    expect(html).toContain("Payment received");
    expect(html).toContain("৳49.50");
  });

  it("mentions the discount in emails that show it", () => {
    expect(orderConfirmationEmail(ctx)).toContain("-৳5.50");
  });
});