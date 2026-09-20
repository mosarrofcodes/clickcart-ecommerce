import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { getOrCreateCart, cartSummary } from "@/lib/cart-service";
import { findValidCoupon } from "@/lib/coupon-service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rate = checkRateLimit(`coupon-validate:${getClientIp(req)}`, {
    limit: 60,
    windowMs: 10 * 60 * 1000,
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) } },
    );
  }

  const { userId, error } = await requireUser();
  if (error) return error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code : "";

  try {
    const cart = await getOrCreateCart(userId as string);
    const { subtotal } = cartSummary(cart);

    const result = await findValidCoupon(code, userId as string, subtotal);

    if (!result.coupon) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      valid: true,
      code: result.coupon.code,
      type: result.coupon.type,
      discountAmount: result.discount.discountAmount,
      freeShipping: result.discount.freeShipping,
      subtotal,
    });
  } catch (err) {
    console.error("Validate coupon error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}