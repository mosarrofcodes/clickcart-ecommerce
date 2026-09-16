import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";

function normalizeAddressBody(body: Record<string, unknown>) {
  const out: Record<string, string | null> = {};
  const textFields = ["name", "phone", "address", "city", "district"] as const;
  let invalid = false;

  for (const field of textFields) {
    const value = body[field];
    if (typeof value === "string" && value.trim()) {
      out[field] = value.trim();
    } else {
      invalid = true;
      break;
    }
  }
  if (!invalid && body.zipCode != null && typeof body.zipCode !== "string") {
    invalid = true;
  }
  if (!invalid) {
    out.zipCode = typeof body.zipCode === "string" && body.zipCode.trim()
      ? body.zipCode.trim()
      : null;
  }
  return { data: out, invalid };
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/user/addresses/[id]">,
) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const { id } = await ctx.params;

    const existing = await db.address.findFirst({
      where: { id, userId: userId as string },
    });
    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { data, invalid } = normalizeAddressBody(body);
    if (invalid) {
      return NextResponse.json(
        { error: "All address fields are required" },
        { status: 400 },
      );
    }

    const setDefault = body.isDefault === true || existing.isDefault;

    const address = await db.address.update({
      where: { id },
      data: { ...data, isDefault: setDefault },
    });

    if (setDefault) {
      await db.address.updateMany({
        where: { userId: userId as string, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return NextResponse.json({ address });
  } catch (err) {
    console.error("Update address error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/user/addresses/[id]">,
) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const { id } = await ctx.params;

    const existing = await db.address.findFirst({
      where: { id, userId: userId as string },
    });
    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const wasDefault = existing.isDefault;
    await db.address.delete({ where: { id } });

    if (wasDefault) {
      const next = await db.address.findFirst({
        where: { userId: userId as string },
        orderBy: { id: "asc" },
      });
      if (next) {
        await db.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete address error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/user/addresses/[id]">,
) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const { id } = await ctx.params;

    const existing = await db.address.findFirst({
      where: { id, userId: userId as string },
    });
    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (body.isDefault !== true && body.isDefault !== false) {
      return NextResponse.json(
        { error: "isDefault must be a boolean" },
        { status: 400 },
      );
    }

    if (body.isDefault) {
      await db.address.updateMany({
        where: { userId: userId as string, id: { not: id } },
        data: { isDefault: false },
      });
      await db.address.update({ where: { id }, data: { isDefault: true } });
    } else {
      await db.address.update({ where: { id }, data: { isDefault: false } });
    }

    const address = await db.address.findUnique({ where: { id } });
    return NextResponse.json({ address });
  } catch (err) {
    console.error("Update default address error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}