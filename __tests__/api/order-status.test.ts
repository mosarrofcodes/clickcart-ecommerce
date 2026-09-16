/** @jest-environment node */
import { PUT } from "@/app/api/orders/[id]/status/route";
import { requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";
import {
  loadOrderWithItemsAndUser,
  notifyOrderShipped,
  notifyOrderDelivered,
} from "@/lib/notification";

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
  requireAdmin: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    order: { findUnique: jest.fn(), update: jest.fn() },
    payment: { update: jest.fn() },
  },
}));

jest.mock("@/lib/notification", () => ({
  loadOrderWithItemsAndUser: jest.fn(),
  notifyOrderShipped: jest.fn(),
  notifyOrderDelivered: jest.fn(),
}));

const mockRequireAdmin = requireAdmin as jest.Mock;
const mockDb = db as unknown as {
  order: { findUnique: jest.Mock; update: jest.Mock };
  payment: { update: jest.Mock };
};
const mockLoad = loadOrderWithItemsAndUser as jest.Mock;
const mockShipped = notifyOrderShipped as jest.Mock;
const mockDelivered = notifyOrderDelivered as jest.Mock;

const ctx = () => ({ params: Promise.resolve({ id: "oc_1" }) });

const jsonRequest = (body: Record<string, unknown>) =>
  new Request("http://localhost/api/orders/oc_1/status", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const existingOrder = {
  id: "oc_1",
  userId: "user-1",
  status: "PENDING",
  total: 50,
  address: "x",
  phone: "01",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireAdmin.mockResolvedValue(null);
  mockLoad.mockResolvedValue({ user: { id: "user-1", email: "a@b.com", name: "A" } });
});

describe("PUT /api/orders/[id]/status", () => {
  it("rejects non-admin callers", async () => {
    mockRequireAdmin.mockResolvedValue({ status: 403, _body: { error: "Forbidden" }, json: async () => ({}) });

    const res = await PUT(jsonRequest({ status: "SHIPPED" }), ctx());
    expect(res.status).toBe(403);
  });

  it("rejects an invalid status value", async () => {
    mockDb.order.findUnique.mockResolvedValue(existingOrder);

    const res = await PUT(jsonRequest({ status: "TELEPORTED" }), ctx());
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown order", async () => {
    mockDb.order.findUnique.mockResolvedValue(null);

    const res = await PUT(jsonRequest({ status: "SHIPPED" }), ctx());
    expect(res.status).toBe(404);
  });

  it("refuses to change a cancelled order", async () => {
    mockDb.order.findUnique.mockResolvedValue({ ...existingOrder, status: "CANCELLED" });

    const res = await PUT(jsonRequest({ status: "DELIVERED" }), ctx());
    expect(res.status).toBe(400);
  });

  it("updates to SHIPPED and fires the shipping notification", async () => {
    mockDb.order.findUnique.mockResolvedValue(existingOrder);
    mockDb.order.update.mockResolvedValue({ ...existingOrder, status: "SHIPPED", payment: null });

    const res = await PUT(jsonRequest({ status: "SHIPPED" }), ctx());
    expect(res.status).toBe(200);
    expect(mockDb.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "SHIPPED" } }),
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(mockShipped).toHaveBeenCalled();
    expect(mockDelivered).not.toHaveBeenCalled();
  });

  it("completes cash payment when marked DELIVERED and fires delivery notification", async () => {
    mockDb.order.findUnique.mockResolvedValue(existingOrder);
    mockDb.order.update.mockResolvedValue({
      ...existingOrder,
      status: "DELIVERED",
      payment: { id: "pay-1", orderId: "oc_1", status: "PENDING", amount: 50 },
    });

    const res = await PUT(jsonRequest({ status: "DELIVERED" }), ctx());
    expect(res.status).toBe(200);
    expect(mockDb.payment.update).toHaveBeenCalledWith({
      where: { id: "pay-1" },
      data: { status: "COMPLETED" },
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(mockDelivered).toHaveBeenCalled();
  });
});