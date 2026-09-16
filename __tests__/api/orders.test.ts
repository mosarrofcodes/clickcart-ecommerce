/** @jest-environment node */
import { POST } from "@/app/api/orders/route";
import { requireUser } from "@/lib/api";
import { db } from "@/lib/db";
import { findValidCoupon } from "@/lib/coupon-service";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      _body: body,
      json: async () => body,
    }),
  },
}));

jest.mock("@/lib/api", () => ({
  requireUser: jest.fn(),
}));

jest.mock("@/lib/coupon-service", () => ({
  findValidCoupon: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    cart: { upsert: jest.fn() },
    product: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    order: { create: jest.fn() },
    coupon: { update: jest.fn() },
    couponUse: { create: jest.fn() },
    cartItem: { deleteMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock("@/lib/notification", () => ({
  notifyOrderPlaced: jest.fn(),
  lowStockAlerts: jest.fn(),
}));

const mockRequireUser = requireUser as jest.Mock;
const mockFindValidCoupon = findValidCoupon as jest.Mock;
const mockDb = db as unknown as {
  cart: { upsert: jest.Mock };
  product: { findMany: jest.Mock; updateMany: jest.Mock };
  order: { create: jest.Mock };
  coupon: { update: jest.Mock };
  couponUse: { create: jest.Mock };
  cartItem: { deleteMany: jest.Mock };
  $transaction: jest.Mock;
};

const jsonRequest = (body: Record<string, unknown>) =>
  new Request("http://localhost/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const cartWith = (items: { productId: string; quantity: number; price: number }[]) => ({
  id: "cart-1",
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  items: items.map((item) => ({
    id: `ci-${item.productId}`,
    cartId: "cart-1",
    productId: item.productId,
    quantity: item.quantity,
    product: { title: `Product ${item.productId}`, price: item.price },
  })),
});

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue({ userId: "user-1", error: null });
});

describe("POST /api/orders", () => {
  it("rejects unauthenticated requests", async () => {
    mockRequireUser.mockResolvedValue({
      userId: null,
      error: { status: 401, _body: { error: "Unauthorized" }, json: async () => ({}) },
    });

    const res = await POST(jsonRequest({ address: "x", phone: "01", paymentMethod: "cash_on_delivery" }));
    expect(res.status).toBe(401);
  });

  it("rejects an unknown payment method", async () => {
    const res = await POST(jsonRequest({ address: "x", phone: "01", paymentMethod: "credit_card" }));
    expect(res.status).toBe(400);
  });

  it("requires a shipping address and phone number", async () => {
    const noAddress = await POST(jsonRequest({ phone: "01700000000", paymentMethod: "cash_on_delivery" }));
    expect(noAddress.status).toBe(400);

    const noPhone = await POST(jsonRequest({ address: "Dhaka", paymentMethod: "cash_on_delivery" }));
    expect(noPhone.status).toBe(400);
  });

  it("returns 400 when the cart is empty", async () => {
    mockDb.cart.upsert.mockResolvedValue(cartWith([]));

    const res = await POST(
      jsonRequest({ address: "Dhaka", phone: "01700000000", paymentMethod: "cash_on_delivery" }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects when stock is insufficient", async () => {
    mockDb.cart.upsert.mockResolvedValue(cartWith([{ productId: "p1", quantity: 3, price: 10 }]));
    mockDb.product.findMany.mockResolvedValue([{ id: "p1", stock: 2 }]);

    const res = await POST(
      jsonRequest({ address: "Dhaka", phone: "01700000000", paymentMethod: "cash_on_delivery" }),
    );
    expect(res.status).toBe(400);
  });

  it("creates an order with payment and returns 201", async () => {
    const orderFixture = {
      id: "oc_123",
      userId: "user-1",
      status: "PENDING",
      total: 24.99,
      address: "House 1, Dhaka",
      phone: "01700000000",
      items: [{ id: "i1", productId: "p1", quantity: 1, price: 20, product: { title: "Headphones" } }],
      payment: {
        id: "pay-1",
        orderId: "oc_123",
        method: "cash_on_delivery",
        status: "PENDING",
        amount: 24.99,
        transactionId: null,
      },
      user: { id: "user-1", email: "a@b.com", name: "Alice" },
    };

    mockDb.cart.upsert.mockResolvedValue(cartWith([{ productId: "p1", quantity: 1, price: 20 }]));
    mockDb.product.findMany.mockResolvedValue([{ id: "p1", stock: 10 }]);
    mockDb.order.create.mockResolvedValue(orderFixture);
    mockDb.$transaction.mockImplementation((ops: unknown[]) => Promise.all(ops as Promise<unknown>[]));
    mockDb.product.updateMany.mockResolvedValue({ count: 1 });
    mockDb.cartItem.deleteMany.mockResolvedValue({ count: 1 });

    const res = await POST(
      jsonRequest({ address: "House 1, Dhaka", phone: "01700000000", paymentMethod: "cash_on_delivery" }),
    );
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.id).toBe("oc_123");
    expect(body.total).toBe(24.99);
    expect(body.payment.method).toBe("cash_on_delivery");
    expect(mockDb.product.updateMany).toHaveBeenCalled();
  });

  it("applies a valid coupon and persists it on the order", async () => {
    const orderFixture = {
      id: "oc_456",
      userId: "user-1",
      status: "PENDING",
      total: 24.99 + 4.99 - 3,
      address: "House 1, Dhaka",
      phone: "01700000000",
      items: [{ id: "i1", productId: "p1", quantity: 1, price: 20, product: { title: "Headphones" } }],
      payment: { id: "pay-2", method: "cash_on_delivery", status: "PENDING", amount: 10 },
      user: { id: "user-1", email: "a@b.com", name: "Alice" },
    };

    mockDb.cart.upsert.mockResolvedValue(cartWith([{ productId: "p1", quantity: 1, price: 20 }]));
    mockDb.product.findMany.mockResolvedValue([{ id: "p1", stock: 10 }]);
    mockDb.order.create.mockResolvedValue(orderFixture);
    mockDb.coupon.update.mockResolvedValue({ id: "cp-1", timesUsed: 1 });
    mockDb.couponUse.create.mockResolvedValue({ id: "use-1" });
    mockFindValidCoupon.mockResolvedValue({
      coupon: { id: "cp-1", code: "SAVE10" },
      discount: { discountAmount: 3, freeShipping: false },
    });
    mockDb.$transaction.mockImplementation((ops: unknown[]) => Promise.all(ops as Promise<unknown>[]));
    mockDb.product.updateMany.mockResolvedValue({ count: 1 });
    mockDb.cartItem.deleteMany.mockResolvedValue({ count: 1 });

    const res = await POST(
      jsonRequest({
        address: "House 1, Dhaka",
        phone: "01700000000",
        paymentMethod: "cash_on_delivery",
        couponCode: "SAVE10",
      }),
    );
    expect(res.status).toBe(201);

    expect(mockDb.coupon.update).toHaveBeenCalledWith({
      where: { id: "cp-1" },
      data: { timesUsed: { increment: 1 } },
    });
    expect(mockDb.couponUse.create).toHaveBeenCalledWith({
      data: { couponId: "cp-1", userId: "user-1" },
    });
    expect(mockFindValidCoupon).toHaveBeenCalledWith(
      "SAVE10",
      "user-1",
      20,
    );

    const orderData = mockDb.order.create.mock.calls[0][0].data;
    expect(orderData.couponId).toBe("cp-1");
    expect(orderData.discount).toBe(3);
    expect(orderData.total).toBe(21.99);
  });

  it("rejects an invalid coupon", async () => {
    mockDb.cart.upsert.mockResolvedValue(cartWith([{ productId: "p1", quantity: 1, price: 20 }]));
    mockFindValidCoupon.mockResolvedValue({
      coupon: null,
      error: "This coupon has expired",
    });

    const res = await POST(
      jsonRequest({
        address: "House 1, Dhaka",
        phone: "01700000000",
        paymentMethod: "cash_on_delivery",
        couponCode: "EXPIRED",
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("This coupon has expired");
    expect(mockDb.order.create).not.toHaveBeenCalled();
    expect(mockDb.$transaction).not.toHaveBeenCalled();
  });
});