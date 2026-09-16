import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  loadOrderWithItemsAndUser,
  notifyPaymentCompleted,
} from "@/lib/notification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const status = String(body.get("status") ?? "");
    const tranId = String(body.get("tran_id") ?? "");
    const valId = String(body.get("val_id") ?? "");
    const amount = Number(body.get("amount") ?? 0);

    if (!tranId) {
      return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: tranId },
      include: { payment: true },
    });

    if (!order?.payment) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status === "CANCELLED" || order.payment.status === "COMPLETED") {
      return NextResponse.json({ ok: true });
    }

    if (status === "VALID" && valId && amount > 0) {
      if (Math.abs(amount - order.payment.amount) > 0.01) {
        await db.payment.update({
          where: { orderId: order.id },
          data: { status: "FAILED" },
        });
      } else {
        await db.payment.update({
          where: { orderId: order.id },
          data: { status: "COMPLETED", transactionId: valId },
        });
        void loadOrderWithItemsAndUser(order.id).then((payload) => {
          if (payload) void notifyPaymentCompleted(payload);
        });
      }
    } else if (status === "FAILED" || status === "CANCELLED") {
      await db.payment.update({
        where: { orderId: order.id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("SSLCommerz IPN error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}