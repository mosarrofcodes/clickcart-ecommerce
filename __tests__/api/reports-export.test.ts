/** @jest-environment node */
import { GET } from "@/app/api/admin/reports/export/route";
import { requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";

jest.mock("next/server", () => {
  class MockNextResponse {
    body: unknown;
    status: number;
    headers: Record<string, string>;
    constructor(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = init?.headers ?? {};
    }
    static json(body: unknown, init?: { status?: number }) {
      return new MockNextResponse(body, init);
    }
    async json() {
      return this.body;
    }
  }
  class MockNextRequest {
    nextUrl: { searchParams: URLSearchParams };
    constructor(url: string) {
      this.nextUrl = { searchParams: new URL(url).searchParams };
    }
  }
  return { NextResponse: MockNextResponse, NextRequest: MockNextRequest };
});

jest.mock("@/lib/api", () => ({ requireAdmin: jest.fn() }));

jest.mock("@/lib/db", () => ({
  db: {
    order: { findMany: jest.fn() },
    product: { findMany: jest.fn() },
    user: { findMany: jest.fn() },
  },
}));

const mockRequireAdmin = requireAdmin as jest.Mock;
const mockDb = db as unknown as {
  order: { findMany: jest.Mock };
  product: { findMany: jest.Mock };
  user: { findMany: jest.Mock };
};

const request = (type: string) =>
  ({
    nextUrl: { searchParams: new URLSearchParams({ type }) },
  }) as never;

const csvBody = (res: { body: unknown }) => res.body as unknown as string;
const header = (res: { headers: unknown }, name: string) =>
  (res.headers as unknown as Record<string, string>)[name];

describe("GET /api/admin/reports/export", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue(null);
  });

  it("blocks non-admins", async () => {
    const forbidden = { status: 403 };
    mockRequireAdmin.mockResolvedValue(forbidden);
    const res = await GET(request("orders"));
    expect(res).toBe(forbidden);
    expect(mockDb.order.findMany).not.toHaveBeenCalled();
  });

  it("rejects unknown export types", async () => {
    const res = await GET(request("bogus"));
    expect(res.status).toBe(400);
  });

  it("exports orders as CSV with escaped values", async () => {
    mockDb.order.findMany.mockResolvedValue([
      {
        id: "o1",
        createdAt: new Date("2026-01-01"),
        status: "DELIVERED",
        phone: "01700000000",
        district: "Dhaka",
        subtotal: 1000,
        shipping: 60,
        discount: 0,
        total: 1060,
        _count: { items: 2 },
        payment: { method: "COD", status: "PENDING" },
      },
    ]);

    const res = await GET(request("orders"));
    const csv = csvBody(res);

    expect(res.status).toBe(200);
    expect(header(res, "Content-Disposition")).toContain("clickcart-orders.csv");
    expect(csv.split("\r\n")[0]).toContain("Order ID");
    expect(csv).toContain("o1");
    expect(csv).toContain("1060");
  });

  it("exports products as CSV", async () => {
    mockDb.product.findMany.mockResolvedValue([
      {
        id: "p1",
        title: 'Wireless "Pro" Mouse',
        sku: "SKU-1",
        category: { name: "Accessories" },
        brand: "ClickCart",
        price: 2500,
        oldPrice: 3000,
        stock: 10,
        rating: 4.5,
        _count: { variants: 2 },
      },
    ]);

    const res = await GET(request("products"));
    const csv = csvBody(res);

    expect(header(res, "Content-Disposition")).toContain("clickcart-products.csv");
    expect(csv).toContain('"Wireless ""Pro"" Mouse"');
    expect(csv).toContain("Accessories");
  });
});