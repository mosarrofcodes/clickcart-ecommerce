import { db } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { COUPON_TYPE_LABELS } from "@/lib/store-config";
import type { Coupon } from "@prisma/client";

export { COUPON_TYPE_LABELS };

export interface CouponDiscount {
  discountAmount: number;
  freeShipping: boolean;
}

const round2 = (n: number) => Number(n.toFixed(2));

export function calculateCouponDiscount(
  coupon: Pick<Coupon, "type" | "value" | "maxDiscount">,
  subtotal: number,
): CouponDiscount {
  if (coupon.type === "FREESHIP") {
    return { discountAmount: 0, freeShipping: true };
  }

  const raw =
    coupon.type === "PERCENT"
      ? subtotal * (coupon.value / 100)
      : coupon.value;

  const discountAmount = round2(
    Math.min(raw, coupon.maxDiscount ?? raw, subtotal),
  );

  return { discountAmount, freeShipping: false };
}

export async function findValidCoupon(
  code: string,
  userId: string,
  subtotal: number,
): Promise<
  | { coupon: Coupon; discount: CouponDiscount }
  | { coupon: null; error: string }
> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { coupon: null, error: "Coupon code is required" };
  }

  const coupon = await db.coupon.findUnique({
    where: { code: normalized },
  });

  if (!coupon) {
    return { coupon: null, error: "Invalid coupon code" };
  }
  if (!coupon.active) {
    return { coupon: null, error: "This coupon is no longer active" };
  }

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) {
    return { coupon: null, error: "This coupon is not active yet" };
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    return { coupon: null, error: "This coupon has expired" };
  }
  if (coupon.usageLimit != null && coupon.timesUsed >= coupon.usageLimit) {
    return { coupon: null, error: "This coupon has reached its usage limit" };
  }
  if (coupon.onePerUser) {
    const used = await db.couponUse.findFirst({
      where: { couponId: coupon.id, userId },
    });
    if (used) {
      return { coupon: null, error: "You have already used this coupon" };
    }
  }
  if (subtotal < coupon.minOrder) {
    return {
      coupon: null,
      error: `Minimum order of ${formatMoney(coupon.minOrder)} required`,
    };
  }

  return { coupon, discount: calculateCouponDiscount(coupon, subtotal) };
}