import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api";

const VALID_ROLES = new Set(["CUSTOMER", "ADMIN"]);

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/users/[id]/role">,
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const role = String(body.role ?? "").toUpperCase();
  if (!VALID_ROLES.has(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const user = await db.user.update({
      where: { id },
      data: { role: role as "CUSTOMER" | "ADMIN" },
      select: { id: true, name: true, email: true, role: true, isBlocked: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Duplicate value" }, { status: 409 });
    }
    console.error("Update user role error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}