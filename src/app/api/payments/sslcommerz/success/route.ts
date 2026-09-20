import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifySslPayment } from "@/lib/sslcommerz";
import { findOrderByTranId } from "@/lib/payment-service";
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
    const order = await findOrderByTranId(tranId);
    const payment = order?.payment;

    if (!order || !payment) {
      return NextResponse.redirect(`${appUrl}/payment/status?result=failed`);
    }

    if (payment.status === "COMPLETED") {
      return NextResponse.redirect(
        `${appUrl}/payment/status?result=success&orderId=${order.id}`,
      );
    }

    if (order.status === "CANCELLED") {
      return NextResponse.redirect(
        `${appUrl}/payment/status?result=failed&orderId=${order.id}`,
      );
    }

    // Amount must match the order exactly.
    if (!(amount > 0) || Math.abs(amount - payment.amount) > 0.01) {
      await db.payment.update({
        where: { orderId: order.id },
        data: { status: "FAILED" },
      });
      return NextResponse.redirect(
        `${appUrl}/payment/status?result=failed&orderId=${order.id}`,
      );
    }

    let verification: Awaited<ReturnType<typeof verifySslPayment>>;
    try {
      verification = await verifySslPayment(valId, amount, tranId);
    } catch (err) {
      console.error(
        "SSLCommerz success verification unavailable; leaving payment PENDING for IPN/reconciliation:",
        err,
      );
      return NextResponse.redirect(
        `${appUrl}/payment/status?result=processing&orderId=${order.id}`,
      );
    }

    const gatewayStatus = String(verification.status ?? "").toUpperCase();
    const isVerified =
      verification.APIConnect === "VALID" || gatewayStatus === "VALID";

    if (!isVerified) {
      await db.payment.update({
        where: { orderId: order.id },
        data: { status: "FAILED" },
      });
      return NextResponse.redirect(
        `${appUrl}/payment/status?result=failed&orderId=${order.id}`,
      );
    }

    const settledAmount = Number(verification.store_amount ?? verification.amount ?? payment.amount);
    if (
      Number.isFinite(settledAmount) &&
      settledAmount > 0 &&
      Math.abs(settledAmount - payment.amount) > 0.01
    ) {
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
      data: {
        status: "COMPLETED",
        transactionId: valId,
        tranId,
      },
    });

    void loadOrderWithItemsAndUser(order.id).then((payload) => {
      if (payload) void notifyPaymentCompleted(payload);
    });

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