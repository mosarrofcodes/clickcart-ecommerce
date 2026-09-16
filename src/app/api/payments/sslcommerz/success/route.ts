import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  loadOrderWithItemsAndUser,
  notifyPaymentCompleted,
} from "@/lib/notification";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tranId = searchParams.get("tran_id");
  const valId = searchParams.get("val_id");
  const amount = Number(searchParams.get("amount") ?? 0);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!tranId || !valId) {
    return NextResponse.redirect(`${appUrl}/payment/status?result=failed`);
  }

  try {
    const order = await db.order.findUnique({
      where: { id: tranId },
      include: { payment: true },
    });

    if (!order?.payment || order.payment.status === "COMPLETED") {
      return NextResponse.redirect(
        `${appUrl}/payment/status?result=success&orderId=${tranId}`,
      );
    }

    if (order.status !== "CANCELLED") {
      if (amount > 0 && Math.abs(amount - order.payment.amount) > 0.01) {
        await db.payment.update({
          where: { orderId: order.id },
          data: { status: "FAILED" },
        });
        return NextResponse.redirect(
          `${appUrl}/payment/status?result=failed&orderId=${order.id}`,
        );
      }

      await db.payment.update({
        where: { orderId: order.id },
        data: { status: "COMPLETED", transactionId: valId },
      });

      void loadOrderWithItemsAndUser(order.id).then((payload) => {
        if (payload) void notifyPaymentCompleted(payload);
      });
    }

    return NextResponse.redirect(
      `${appUrl}/payment/status?result=success&orderId=${order.id}`,
    );
  } catch (err) {
    console.error("SSLCommerz success callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/payment/status?result=failed&orderId=${tranId}`,
    );
  }
}