import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api";
import { ORDER_STATUS_STEPS, type OrderStatus } from "@/lib/order-status";
import {
  loadOrderWithItemsAndUser,
  notifyOrderShipped,
  notifyOrderDelivered,
} from "@/lib/notification";

const VALID_STATUSES = new Set<string>([
  ...ORDER_STATUS_STEPS,
  "CANCELLED",
]);

export async function PUT(
  req: Request,
  ctx: RouteContext<"/api/orders/[id]/status">,
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

  const status = String(body.status ?? "").toUpperCase() as OrderStatus;
  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (existing.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Cannot change status of a cancelled order" },
      { status: 400 },
    );
  }

  try {
    const order = await db.order.update({
      where: { id },
      data: { status },
      include: { payment: true },
    });

    if (status === "DELIVERED" && order.payment?.status === "PENDING") {
      await db.payment.update({
        where: { id: order.payment.id },
        data: { status: "COMPLETED" },
      });
    }

    void loadOrderWithItemsAndUser(id).then((payload) => {
      if (!payload) return;
      if (status === "SHIPPED") void notifyOrderShipped(payload);
      if (status === "DELIVERED") void notifyOrderDelivered(payload);
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}