/**
 * @jest-environment node
 */
import {
  turnstileEnabled,
  verifyTurnstileToken,
  verifyTurnstile,
} from "@/lib/turnstile";

describe("turnstile", () => {
  const realFetch = global.fetch;

  afterEach(() => {
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    global.fetch = realFetch;
  });

  describe("turnstileEnabled", () => {
    it("is false when keys are missing", () => {
      expect(turnstileEnabled()).toBe(false);
    });

    it("is false when only the secret is set", () => {
      process.env.TURNSTILE_SECRET_KEY = "secret";
      expect(turnstileEnabled()).toBe(false);
    });

    it("is true when both keys are set", () => {
      process.env.TURNSTILE_SECRET_KEY = "1x00000000000000000000AA";
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000BB";
      expect(turnstileEnabled()).toBe(true);
    });
  });

  describe("verifyTurnstileToken", () => {
    it("returns true immediately when disabled", async () => {
      await expect(verifyTurnstileToken("anything")).resolves.toBe(true);
    });

    it("returns false for a missing or blank token when enabled", async () => {
      process.env.TURNSTILE_SECRET_KEY = "1x00000000000000000000AA";
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000BB";
      await expect(verifyTurnstileToken(undefined)).resolves.toBe(false);
      await expect(verifyTurnstileToken("")).resolves.toBe(false);
      await expect(verifyTurnstileToken("   ")).resolves.toBe(false);
    });

    it("returns true when siteverify reports success", async () => {
      process.env.TURNSTILE_SECRET_KEY = "1x00000000000000000000AA";
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000BB";
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, "error-codes": [] }),
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      await expect(verifyTurnstileToken("token")).resolves.toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("returns false when siteverify rejects the token", async () => {
      process.env.TURNSTILE_SECRET_KEY = "1x00000000000000000000AA";
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000BB";
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          "error-codes": ["invalid-input-response"],
        }),
      }) as unknown as typeof fetch;

      await expect(verifyTurnstileToken("bad-token")).resolves.toBe(false);
    });

    it("returns false when siteverify responds with a non-OK status", async () => {
      process.env.TURNSTILE_SECRET_KEY = "1x00000000000000000000AA";
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000BB";
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }) as unknown as typeof fetch;

      await expect(verifyTurnstileToken("token")).resolves.toBe(false);
    });

    it("returns false when the siteverify call throws", async () => {
      process.env.TURNSTILE_SECRET_KEY = "1x00000000000000000000AA";
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000BB";
      global.fetch = jest
        .fn()
        .mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

      await expect(verifyTurnstileToken("token")).resolves.toBe(false);
    });
  });

  describe("verifyTurnstile (body helper)", () => {
    it("reads the captchaToken out of the request body", async () => {
      process.env.TURNSTILE_SECRET_KEY = "1x00000000000000000000AA";
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000BB";
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      }) as unknown as typeof fetch;

      await expect(verifyTurnstile({ captchaToken: "abc" })).resolves.toBe(true);
    });

    it("returns true when disabled regardless of the body", async () => {
      await expect(verifyTurnstile({})).resolves.toBe(true);
      await expect(verifyTurnstile({ captchaToken: "token" })).resolves.toBe(true);
    });
  });
});