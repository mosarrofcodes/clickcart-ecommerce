import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api";
import type { CouponType } from "@prisma/client";

const COUPON_TYPES = new Set<CouponType>(["PERCENT", "FIXED", "FREESHIP"]);

export async function GET() {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  try {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    });

    return NextResponse.json({ coupons });
  } catch (err) {
    console.error("List coupons error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { code, type, value, minOrder, maxDiscount, usageLimit, validFrom, validUntil, active, onePerUser } = body;

  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
  }
  if (typeof type !== "string" || !COUPON_TYPES.has(type as CouponType)) {
    return NextResponse.json({ error: "Invalid coupon type" }, { status: 400 });
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return NextResponse.json({ error: "Value must be a non-negative number" }, { status: 400 });
  }

  const data = {
    code: code.trim().toUpperCase(),
    type: type as CouponType,
    value,
    minOrder: typeof minOrder === "number" && minOrder >= 0 ? minOrder : 0,
    maxDiscount:
      typeof maxDiscount === "number" && maxDiscount > 0 ? maxDiscount : null,
    usageLimit:
      typeof usageLimit === "number" && usageLimit > 0 ? Math.floor(usageLimit) : null,
    onePerUser: onePerUser === true,
    active: active !== false,
    validFrom: typeof validFrom === "string" && validFrom ? new Date(validFrom) : null,
    validUntil: typeof validUntil === "string" && validUntil ? new Date(validUntil) : null,
  };

  try {
    const coupon = await db.coupon.create({ data });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "A coupon with this code already exists" },
        { status: 409 },
      );
    }
    console.error("Create coupon error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}