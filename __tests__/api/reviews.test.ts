/** @jest-environment node */
import { POST } from "@/app/api/reviews/route";
import { requireUser } from "@/lib/api";
import { db } from "@/lib/db";
import { recomputeProductRating } from "@/lib/review-service";

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

jest.mock("@/lib/db", () => ({
  db: {
    product: { findUnique: jest.fn() },
    review: { upsert: jest.fn() },
  },
}));

jest.mock("@/lib/review-service", () => ({
  recomputeProductRating: jest.fn(),
}));

const mockRequireUser = requireUser as jest.Mock;
const mockDb = db as unknown as {
  product: { findUnique: jest.Mock };
  review: { upsert: jest.Mock };
};
const mockRecompute = recomputeProductRating as jest.Mock;

const jsonRequest = (body: Record<string, unknown>) =>
  new Request("http://localhost/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue({ userId: "user-1", error: null });
  mockDb.product.findUnique.mockResolvedValue({ id: "p1" });
});

describe("POST /api/reviews", () => {
  it("rejects unauthenticated requests", async () => {
    mockRequireUser.mockResolvedValue({ userId: null, error: { status: 401, _body: {}, json: async () => ({}) } });

    const res = await POST(jsonRequest({ productId: "p1", rating: 5 }));
    expect(res.status).toBe(401);
  });

  it("rejects a missing productId", async () => {
    const res = await POST(jsonRequest({ rating: 5 }));
    expect(res.status).toBe(400);
  });

  it("rejects a rating outside 1-5", async () => {
    const res = await POST(jsonRequest({ productId: "p1", rating: 9 }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when the product does not exist", async () => {
    mockDb.product.findUnique.mockResolvedValue(null);

    const res = await POST(jsonRequest({ productId: "ghost", rating: 4 }));
    expect(res.status).toBe(404);
  });

  it("upserts the review and recomputes the product rating", async () => {
    mockDb.review.upsert.mockResolvedValue({
      id: "r1",
      rating: 5,
      comment: "Great!",
      userId: "user-1",
      productId: "p1",
      user: { id: "user-1", name: "Alice", image: null },
    });

    const res = await POST(jsonRequest({ productId: "p1", rating: 5, comment: "Great!" }));
    expect(res.status).toBe(201);
    expect(mockDb.review.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_productId: { userId: "user-1", productId: "p1" } },
      }),
    );
    expect(mockRecompute).toHaveBeenCalledWith("p1");
  });

  it("trims empty comments to null", async () => {
    mockDb.review.upsert.mockResolvedValue({ id: "r1" });

    await POST(jsonRequest({ productId: "p1", rating: 3, comment: "   " }));
    const call = mockDb.review.upsert.mock.calls[0][0];
    expect(call.update.comment).toBeNull();
  });
});