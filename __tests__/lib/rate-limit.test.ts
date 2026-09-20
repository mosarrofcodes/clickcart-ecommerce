import {
  checkRateLimit,
  getClientIp,
  isHoneypot,
  resetRateLimits,
} from "@/lib/rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    delete process.env.RATE_LIMIT_DISABLED;
    resetRateLimits();
  });

  afterAll(() => {
    process.env.RATE_LIMIT_DISABLED = "true";
  });

  describe("checkRateLimit", () => {
    it("allows requests within the limit", () => {
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit("test", { limit: 5, windowMs: 60_000 });
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(5 - i - 1);
      }
    });

    it("blocks requests after the limit is exceeded", () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit("test", { limit: 5, windowMs: 60_000 });
      }
      const blocked = checkRateLimit("test", { limit: 5, windowMs: 60_000 });
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfterMs).toBeGreaterThan(0);
    });

    it("tracks identifiers independently", () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit("user-a", { limit: 5, windowMs: 60_000 });
      }
      expect(checkRateLimit("user-a", { limit: 5, windowMs: 60_000 }).allowed).toBe(false);
      expect(checkRateLimit("user-b", { limit: 5, windowMs: 60_000 }).allowed).toBe(true);
    });

    it("resets the window after it expires", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-01-01T00:00:00Z"));

      for (let i = 0; i < 5; i++) {
        checkRateLimit("test", { limit: 5, windowMs: 60_000 });
      }
      expect(checkRateLimit("test", { limit: 5, windowMs: 60_000 }).allowed).toBe(false);

      jest.setSystemTime(new Date("2026-01-01T00:01:00Z"));
      expect(checkRateLimit("test", { limit: 5, windowMs: 60_000 }).allowed).toBe(true);

      jest.useRealTimers();
    });

    it("is disabled when RATE_LIMIT_DISABLED is set", () => {
      process.env.RATE_LIMIT_DISABLED = "true";
      for (let i = 0; i < 100; i++) {
        expect(checkRateLimit("test", { limit: 5, windowMs: 60_000 }).allowed).toBe(true);
      }
    });
  });

  describe("getClientIp", () => {
    const requestWithHeaders = (
      headers: Record<string, string>,
    ): Request =>
      ({
        headers: { get: (name: string) => headers[name] ?? null },
      }) as unknown as Request;

    it("parses the first x-forwarded-for entry", () => {
      expect(
        getClientIp(requestWithHeaders({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" })),
      ).toBe("1.2.3.4");
    });

    it("falls back to x-real-ip", () => {
      expect(
        getClientIp(requestWithHeaders({ "x-real-ip": "9.9.9.9" })),
      ).toBe("9.9.9.9");
    });

    it("returns unknown when no headers are present", () => {
      expect(getClientIp(requestWithHeaders({}))).toBe("unknown");
    });
  });

  describe("isHoneypot", () => {
    it("returns true when the honeypot field is filled", () => {
      expect(isHoneypot({ website: "https://spam.example" })).toBe(true);
    });

    it("returns false when the honeypot field is empty or missing", () => {
      expect(isHoneypot({})).toBe(false);
      expect(isHoneypot({ website: "" })).toBe(false);
      expect(isHoneypot({ website: "   " })).toBe(false);
    });
  });

  describe("resetRateLimits", () => {
    it("clears all tracked buckets", () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit("test", { limit: 5, windowMs: 60_000 });
      }
      expect(checkRateLimit("test", { limit: 5, windowMs: 60_000 }).allowed).toBe(false);
      resetRateLimits();
      expect(checkRateLimit("test", { limit: 5, windowMs: 60_000 }).allowed).toBe(true);
    });
  });
});