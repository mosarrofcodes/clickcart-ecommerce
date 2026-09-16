import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/orders/[id]">,
) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const session = await auth();
    const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
    const { id } = await ctx.params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
    });

    if (!order || (order.userId !== userId && !isAdmin)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error("Get order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}