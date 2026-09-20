import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Order placed — awaiting confirmation",
  CONFIRMED: "Order confirmed",
  PROCESSING: "Being packed at our warehouse",
  SHIPPED: "On the way to you",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { orderId, phone } = body;
  if (typeof orderId !== "string" || !orderId.trim()) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }
  if (typeof phone !== "string" || !phone.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  try {
    const order = await db.order.findFirst({
      where: {
        id: orderId.trim(),
        phone: phone.trim().replace(/^\+?880/, "0").replace(/\s+/g, ""),
      },
      select: {
        id: true,
        status: true,
        total: true,
        payment: { select: { method: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "No order found with that ID and phone number" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] ?? order.status,
      total: order.total,
      paymentMethod: order.payment?.method ?? null,
      placedAt: order.createdAt,
      lastUpdated: order.updatedAt,
    });
  } catch (err) {
    console.error("Track order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}