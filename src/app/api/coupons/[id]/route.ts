import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api";
import type { CouponType } from "@prisma/client";

const COUPON_TYPES = new Set<CouponType>(["PERCENT", "FIXED", "FREESHIP"]);

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: Request, context: RouteContext) {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { code, type, value, minOrder, maxDiscount, usageLimit, validFrom, validUntil, active, onePerUser } = body;

  if (code !== undefined && (typeof code !== "string" || !code.trim())) {
    return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
  }
  if (type !== undefined && (typeof type !== "string" || !COUPON_TYPES.has(type as CouponType))) {
    return NextResponse.json({ error: "Invalid coupon type" }, { status: 400 });
  }
  if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
    return NextResponse.json({ error: "Value must be a non-negative number" }, { status: 400 });
  }

  const data: Record<string, unknown> = {
    ...(code && { code: String(code).trim().toUpperCase() }),
    type:
      type && COUPON_TYPES.has(type as CouponType)
        ? (type as CouponType)
        : undefined,
    value: typeof value === "number" ? value : undefined,
    minOrder: typeof minOrder === "number" && minOrder >= 0 ? minOrder : undefined,
    maxDiscount: typeof maxDiscount === "number" && maxDiscount > 0 ? maxDiscount : null,
    usageLimit: typeof usageLimit === "number" && usageLimit > 0 ? Math.floor(usageLimit) : null,
    validFrom: typeof validFrom === "string" && validFrom ? new Date(validFrom) : null,
    validUntil: typeof validUntil === "string" && validUntil ? new Date(validUntil) : null,
    onePerUser: typeof onePerUser === "boolean" ? onePerUser : undefined,
    active: typeof active === "boolean" ? active : undefined,
  };

  for (const key of Object.keys(data)) {
    if (data[key] === undefined) delete data[key];
  }

  try {
    const coupon = await db.coupon.update({ where: { id }, data });
    return NextResponse.json({ coupon });
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "A coupon with this code already exists" },
        { status: 409 },
      );
    }
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    console.error("Update coupon error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  const { id } = await context.params;

  try {
    await db.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    console.error("Delete coupon error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}