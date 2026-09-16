import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/payments/sslcommerz/status/[orderId]">) {
  const { userId, error } = await requireUser();
  if (error) return error;

  const { orderId } = await ctx.params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order || order.userId !== userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.id,
    orderStatus: order.status,
    paymentStatus: order.payment?.status ?? "PENDING",
    method: order.payment?.method ?? null,
    transactionId: order.payment?.transactionId ?? null,
    amount: order.total,
  });
}