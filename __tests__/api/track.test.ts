/** @jest-environment node */
import { POST } from "@/app/api/track/route";
import { db } from "@/lib/db";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      _body: body,
      json: async () => body,
    }),
  },
}));

jest.mock("@/lib/db", () => ({
  db: { order: { findFirst: jest.fn() } },
}));

const mockDb = db as unknown as { order: { findFirst: jest.Mock } };

const jsonRequest = (body: Record<string, unknown>) =>
  new Request("http://localhost/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/track", () => {
  beforeEach(() => jest.clearAllMocks());

  it("requires an order ID", async () => {
    const res = await POST(jsonRequest({ phone: "01700000000" }));
    expect(res.status).toBe(400);
  });

  it("requires a phone number", async () => {
    const res = await POST(jsonRequest({ orderId: "order-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when no order matches", async () => {
    mockDb.order.findFirst.mockResolvedValue(null);
    const res = await POST(
      jsonRequest({ orderId: "order-1", phone: "01700000000" }),
    );
    expect(res.status).toBe(404);
  });

  it("normalizes +880 phone numbers and returns tracking data", async () => {
    mockDb.order.findFirst.mockResolvedValue({
      id: "order-1",
      status: "SHIPPED",
      total: 1500,
      payment: { method: "SSLCOMMERZ" },
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    });

    const res = await POST(
      jsonRequest({ orderId: "order-1", phone: "+8801700000000" }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.statusLabel).toBe("On the way to you");
    expect(body.paymentMethod).toBe("SSLCOMMERZ");
    expect(mockDb.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-1", phone: "01700000000" },
      }),
    );
  });
});