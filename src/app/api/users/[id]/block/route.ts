import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/users/[id]/block">,
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

  const isBlocked = Boolean(body.isBlocked);

  const session = await auth();
  if (session?.user?.id === id) {
    return NextResponse.json(
      { error: "You cannot block your own account" },
      { status: 400 },
    );
  }

  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const user = await db.user.update({
      where: { id },
      data: { isBlocked },
      select: { id: true, name: true, email: true, role: true, isBlocked: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Update user block error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}