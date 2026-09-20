/** @jest-environment node */
import { calculateCouponDiscount, findValidCoupon } from "@/lib/coupon-service";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: {
    coupon: { findUnique: jest.fn() },
    couponUse: { findFirst: jest.fn() },
  },
}));

const mockDb = db as unknown as {
  coupon: { findUnique: jest.Mock };
  couponUse: { findFirst: jest.Mock };
};

const baseCoupon = {
  id: "cp-1",
  code: "SAVE10",
  type: "PERCENT" as const,
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
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("calculateCouponDiscount", () => {
  it("computes a percentage discount", () => {
    const result = calculateCouponDiscount(
      { type: "PERCENT", value: 10, maxDiscount: null },
      100,
    );
    expect(result).toEqual({ discountAmount: 10, freeShipping: false });
  });

  it("caps a percentage discount at maxDiscount", () => {
    const result = calculateCouponDiscount(
      { type: "PERCENT", value: 10, maxDiscount: 5 },
      100,
    );
    expect(result.discountAmount).toBe(5);
  });

  it("never discounts more than the subtotal", () => {
    const result = calculateCouponDiscount(
      { type: "PERCENT", value: 50, maxDiscount: null },
      10,
    );
    expect(result.discountAmount).toBe(5);
  });

  it("computes a fixed amount discount", () => {
    const result = calculateCouponDiscount(
      { type: "FIXED", value: 20, maxDiscount: null },
      100,
    );
    expect(result.discountAmount).toBe(20);
    expect(result.freeShipping).toBe(false);
  });

  it("caps a fixed discount at the subtotal", () => {
    const result = calculateCouponDiscount(
      { type: "FIXED", value: 150, maxDiscount: null },
      100,
    );
    expect(result.discountAmount).toBe(100);
  });

  it("returns free shipping for FREESHIP coupons", () => {
    const result = calculateCouponDiscount(
      { type: "FREESHIP", value: 0, maxDiscount: null },
      100,
    );
    expect(result).toEqual({ discountAmount: 0, freeShipping: true });
  });
});

describe("findValidCoupon", () => {
  it("rejects an empty code", async () => {
    const result = await findValidCoupon(" ", "user-1", 100);
    expect(result).toEqual({ coupon: null, error: "Coupon code is required" });
    expect(mockDb.coupon.findUnique).not.toHaveBeenCalled();
  });

  it("normalizes the code to uppercase before lookup", async () => {
    mockDb.coupon.findUnique.mockResolvedValue(null);
    await findValidCoupon("  save10 ", "user-1", 100);
    expect(mockDb.coupon.findUnique).toHaveBeenCalledWith({
      where: { code: "SAVE10" },
    });
  });

  it("rejects an unknown code", async () => {
    mockDb.coupon.findUnique.mockResolvedValue(null);
    const result = await findValidCoupon("NOPE", "user-1", 100);
    expect(result).toEqual({ coupon: null, error: "Invalid coupon code" });
  });

  it("rejects an inactive coupon", async () => {
    mockDb.coupon.findUnique.mockResolvedValue({ ...baseCoupon, active: false });
    const result = await findValidCoupon("SAVE10", "user-1", 100);
    expect(result).toMatchObject({ coupon: null, error: expect.stringMatching(/no longer active/) });
  });

  it("rejects a coupon that has not started yet", async () => {
    mockDb.coupon.findUnique.mockResolvedValue({
      ...baseCoupon,
      validFrom: new Date(Date.now() + 86_400_000),
    });
    const result = await findValidCoupon("SAVE10", "user-1", 100);
    expect(result).toMatchObject({ coupon: null, error: expect.stringMatching(/not active yet/) });
  });

  it("rejects an expired coupon", async () => {
    mockDb.coupon.findUnique.mockResolvedValue({
      ...baseCoupon,
      validUntil: new Date(Date.now() - 86_400_000),
    });
    const result = await findValidCoupon("SAVE10", "user-1", 100);
    expect(result).toMatchObject({ coupon: null, error: expect.stringMatching(/expired/) });
  });

  it("rejects a coupon that hit its usage limit", async () => {
    mockDb.coupon.findUnique.mockResolvedValue({
      ...baseCoupon,
      usageLimit: 5,
      timesUsed: 5,
    });
    const result = await findValidCoupon("SAVE10", "user-1", 100);
    expect(result).toMatchObject({ coupon: null, error: expect.stringMatching(/usage limit/) });
  });

  it("rejects a one-per-user coupon already used by the customer", async () => {
    mockDb.coupon.findUnique.mockResolvedValue({
      ...baseCoupon,
      onePerUser: true,
    });
    mockDb.couponUse.findFirst.mockResolvedValue({
      id: "use-1",
      couponId: "cp-1",
      userId: "user-1",
    });
    const result = await findValidCoupon("SAVE10", "user-1", 100);
    expect(mockDb.couponUse.findFirst).toHaveBeenCalled();
    expect(result).toMatchObject({ coupon: null, error: expect.stringMatching(/already used/) });
  });

  it("rejects a coupon below the minimum order", async () => {
    mockDb.coupon.findUnique.mockResolvedValue({
      ...baseCoupon,
      minOrder: 50,
    });
    const result = await findValidCoupon("SAVE10", "user-1", 20);
    expect(result).toMatchObject({ coupon: null, error: expect.stringMatching(/Minimum order of ৳50\.00 required/) });
  });

  it("returns the coupon and computed discount when valid", async () => {
    mockDb.coupon.findUnique.mockResolvedValue(baseCoupon);
    mockDb.couponUse.findFirst.mockResolvedValue(null);

    const result = await findValidCoupon("SAVE10", "user-1", 100);
    expect(result.coupon).toEqual(baseCoupon);
    if (result.coupon) {
      expect(result.discount).toEqual({
        discountAmount: 10,
        freeShipping: false,
      });
    }
  });
});