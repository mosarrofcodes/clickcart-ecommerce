/** @jest-environment node */
import { GET, POST } from "@/app/api/coupons/route";
import { PUT, DELETE } from "@/app/api/coupons/[id]/route";
import { POST as POST_VALIDATE } from "@/app/api/coupons/validate/route";
import { requireAdmin, requireUser } from "@/lib/api";
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

jest.mock("@/lib/api", () => ({
  requireAdmin: jest.fn(),
  requireUser: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    coupon: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    couponUse: { findFirst: jest.fn() },
    cart: { upsert: jest.fn() },
  },
}));

jest.mock("@/lib/cart-service", () => ({
  getOrCreateCart: jest.fn(),
  cartSummary: jest.fn(),
}));

import { getOrCreateCart, cartSummary } from "@/lib/cart-service";

const mockRequireAdmin = requireAdmin as jest.Mock;
const mockRequireUser = requireUser as jest.Mock;
const mockDb = db as unknown as {
  coupon: {
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findUnique: jest.Mock;
  };
  couponUse: { findFirst: jest.Mock };
  cart: { upsert: jest.Mock };
};
const mockGetOrCreateCart = getOrCreateCart as jest.Mock;
const mockCartSummary = cartSummary as jest.Mock;

const jsonRequest = (body: Record<string, unknown>) =>
  new Request("http://localhost/api/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const routeContext = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireAdmin.mockResolvedValue(null);
  mockRequireUser.mockResolvedValue({ userId: "user-1", error: null });
});

describe("GET /api/coupons", () => {
  it("requires admin", async () => {
    mockRequireAdmin.mockResolvedValue({
      status: 403,
      _body: { error: "Forbidden" },
      json: async () => ({}),
    });
    const res = await GET();
    expect(res.status).toBe(403);
    expect(mockDb.coupon.findMany).not.toHaveBeenCalled();
  });

  it("returns the coupon list for admins", async () => {
    mockDb.coupon.findMany.mockResolvedValue([
      { id: "cp-1", code: "SAVE10", _count: { orders: 2 } },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.coupons).toHaveLength(1);
    expect(body.coupons[0].code).toBe("SAVE10");
  });
});

describe("POST /api/coupons", () => {
  it("requires admin", async () => {
    mockRequireAdmin.mockResolvedValue({
      status: 401,
      _body: { error: "Unauthorized" },
      json: async () => ({}),
    });
    const res = await POST(jsonRequest({ code: "SAVE10", type: "PERCENT", value: 10 }));
    expect(res.status).toBe(401);
  });

  it("requires a code", async () => {
    const res = await POST(jsonRequest({ type: "PERCENT", value: 10 }));
    expect(res.status).toBe(400);
  });

  it("rejects an invalid type", async () => {
    const res = await POST(jsonRequest({ code: "SAVE10", type: "FLAT", value: 10 }));
    expect(res.status).toBe(400);
  });

  it("rejects a negative value", async () => {
    const res = await POST(jsonRequest({ code: "SAVE10", type: "PERCENT", value: -1 }));
    expect(res.status).toBe(400);
  });

  it("creates a coupon with an uppercased code", async () => {
    mockDb.coupon.create.mockImplementation(({ data }: { data: unknown }) =>
      Promise.resolve(data),
    );
    const res = await POST(
      jsonRequest({ code: "save10", type: "PERCENT", value: 10, minOrder: 20 }),
    );
    expect(res.status).toBe(201);
    expect(mockDb.coupon.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: "SAVE10", minOrder: 20 }),
      }),
    );
  });

  it("returns 409 for a duplicate code", async () => {
    mockDb.coupon.create.mockRejectedValue({ code: "P2002" });
    const res = await POST(jsonRequest({ code: "SAVE10", type: "PERCENT", value: 10 }));
    expect(res.status).toBe(409);
  });
});

describe("PUT /api/coupons/[id]", () => {
  it("requires admin", async () => {
    mockRequireAdmin.mockResolvedValue({
      status: 401,
      _body: { error: "Unauthorized" },
      json: async () => ({}),
    });
    const res = await PUT(jsonRequest({ active: true }), routeContext("cp-1"));
    expect(res.status).toBe(401);
  });

  it("updates a coupon", async () => {
    mockDb.coupon.update.mockResolvedValue({ id: "cp-1", active: false });
    const res = await PUT(jsonRequest({ active: false }), routeContext("cp-1"));
    expect(res.status).toBe(200);
    expect(mockDb.coupon.update).toHaveBeenCalledWith({
      where: { id: "cp-1" },
      data: expect.objectContaining({ active: false }),
    });
  });

  it("returns 404 for a missing coupon", async () => {
    mockDb.coupon.update.mockRejectedValue({ code: "P2025" });
    const res = await PUT(jsonRequest({ active: true }), routeContext("nope"));
    expect(res.status).toBe(404);
  });

  it("returns 409 for a duplicate code change", async () => {
    mockDb.coupon.update.mockRejectedValue({ code: "P2002" });
    const res = await PUT(jsonRequest({ code: "SAVE10" }), routeContext("cp-1"));
    expect(res.status).toBe(409);
  });
});

describe("DELETE /api/coupons/[id]", () => {
  it("requires admin", async () => {
    mockRequireAdmin.mockResolvedValue({
      status: 403,
      _body: { error: "Forbidden" },
      json: async () => ({}),
    });
    const res = await DELETE(new Request("http://localhost"), routeContext("cp-1"));
    expect(res.status).toBe(403);
  });

  it("deletes a coupon", async () => {
    mockDb.coupon.delete.mockResolvedValue({ id: "cp-1" });
    const res = await DELETE(new Request("http://localhost"), routeContext("cp-1"));
    expect(res.status).toBe(200);
    expect(mockDb.coupon.delete).toHaveBeenCalledWith({ where: { id: "cp-1" } });
  });

  it("returns 404 when the coupon does not exist", async () => {
    mockDb.coupon.delete.mockRejectedValue({ code: "P2025" });
    const res = await DELETE(new Request("http://localhost"), routeContext("nope"));
    expect(res.status).toBe(404);
  });
});

describe("POST /api/coupons/validate", () => {
  it("requires a signed-in user", async () => {
    mockRequireUser.mockResolvedValue({
      userId: null,
      error: {
        status: 401,
        _body: { error: "Unauthorized" },
        json: async () => ({}),
      },
    });
    const res = await POST_VALIDATE(jsonRequest({ code: "SAVE10" }));
    expect(res.status).toBe(401);
  });

  it("returns valid:false for an unknown coupon", async () => {
    mockGetOrCreateCart.mockResolvedValue({ id: "cart-1", items: [] });
    mockCartSummary.mockReturnValue({ id: "cart-1", subtotal: 100 });
    mockDb.coupon.findUnique.mockResolvedValue(null);

    const res = await POST_VALIDATE(jsonRequest({ code: "NOPE" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.error).toBe("Invalid coupon code");
  });

  it("returns the discount for a valid coupon", async () => {
    mockGetOrCreateCart.mockResolvedValue({ id: "cart-1", items: [] });
    mockCartSummary.mockReturnValue({ id: "cart-1", subtotal: 100 });
    mockDb.coupon.findUnique.mockResolvedValue({
      id: "cp-1",
      code: "SAVE10",
      type: "PERCENT",
      value: 10,
      minOrder: 0,
      maxDiscount: null,
      active: true,
      onePerUser: false,
      usageLimit: null,
      timesUsed: 0,
      validFrom: null,
      validUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockDb.couponUse.findFirst.mockResolvedValue(null);

    const res = await POST_VALIDATE(jsonRequest({ code: "SAVE10" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.code).toBe("SAVE10");
    expect(body.discountAmount).toBe(10);
    expect(body.freeShipping).toBe(false);
    expect(body.subtotal).toBe(100);
  });
});