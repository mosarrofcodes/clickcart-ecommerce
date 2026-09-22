import { safeCallbackUrl } from "@/lib/callback-url";

describe("safeCallbackUrl", () => {
  it("returns null for empty or missing values", () => {
    expect(safeCallbackUrl(null)).toBeNull();
    expect(safeCallbackUrl(undefined)).toBeNull();
    expect(safeCallbackUrl("")).toBeNull();
  });

  it("allows safe internal paths", () => {
    expect(safeCallbackUrl("/checkout")).toBe("/checkout");
    expect(safeCallbackUrl("/orders/abc123")).toBe("/orders/abc123");
    expect(safeCallbackUrl("/")).toBe("/");
  });

  it("rejects external URLs and protocol-relative values", () => {
    expect(safeCallbackUrl("https://evil.example")).toBeNull();
    expect(safeCallbackUrl("//evil.example")).toBeNull();
    expect(safeCallbackUrl("javascript:alert(1)")).toBeNull();
    expect(safeCallbackUrl("ftp://evil.example")).toBeNull();
  });

  it("rejects host-smuggling values", () => {
    expect(safeCallbackUrl("/\\evil.example")).toBeNull();
    expect(safeCallbackUrl("/\\/evil.example")).toBeNull();
  });
});