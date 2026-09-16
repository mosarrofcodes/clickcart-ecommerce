import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";
import {
  loadOrderWithItemsAndUser,
  notifyOrderCancelled,
} from "@/lib/notification";

const CANCELLABLE = new Set(["PENDING", "CONFIRMED"]);

export async function PUT(
  _req: NextRequest,
  ctx: RouteContext<"/api/orders/[id]/cancel">,
) {
  const { userId, error } = await requireUser();
  if (error) return error;

  const { id } = await ctx.params;

  try {
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const session = await auth();
    const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

    if (order.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!CANCELLABLE.has(order.status)) {
      return NextResponse.json(
        { error: "This order can no longer be cancelled" },
        { status: 400 },
      );
    }

    const updated = await db.$transaction([
      db.order.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: { items: true },
      }),
      ...order.items.map((item) =>
        db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        }),
      ),
    ]);

    void loadOrderWithItemsAndUser(id).then((payload) => {
      if (payload) void notifyOrderCancelled(payload);
    });

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error("Cancel order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}