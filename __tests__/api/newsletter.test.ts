/** @jest-environment node */
import { POST } from "@/app/api/newsletter/route";
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
  db: { newsletterSubscriber: { upsert: jest.fn() } },
}));

const mockDb = db as unknown as {
  newsletterSubscriber: { upsert: jest.Mock };
};

const jsonRequest = (body: Record<string, unknown>) =>
  new Request("http://localhost/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/newsletter", () => {
  beforeEach(() => jest.clearAllMocks());

  it("rejects an invalid email", async () => {
    const res = await POST(jsonRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
    expect(mockDb.newsletterSubscriber.upsert).not.toHaveBeenCalled();
  });

  it("normalizes and upserts a valid email", async () => {
    mockDb.newsletterSubscriber.upsert.mockResolvedValue({ id: "s1" });
    const res = await POST(jsonRequest({ email: "  User@Example.COM " }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockDb.newsletterSubscriber.upsert).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
      update: {},
      create: { email: "user@example.com" },
    });
  });
});