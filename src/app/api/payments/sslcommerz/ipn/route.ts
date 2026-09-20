import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifySslPayment, verifyIpnSignature } from "@/lib/sslcommerz";
import { findOrderByTranId } from "@/lib/payment-service";
import {
  loadOrderWithItemsAndUser,
  notifyPaymentCompleted,
} from "@/lib/notification";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const params = new URLSearchParams();
    form.forEach((value, key) => params.set(key, String(value)));

    const status = String(params.get("status") ?? "").toUpperCase();
    const tranId = String(params.get("tran_id") ?? "");
    const valId = String(params.get("val_id") ?? "");
    const amount = Number(params.get("amount") ?? 0);

    if (!tranId) {
      return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
    }

    const order = await findOrderByTranId(tranId);

    if (!order?.payment) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "CANCELLED" || order.payment.status === "COMPLETED") {
      return NextResponse.json({ ok: true });
    }

    const signature = verifyIpnSignature(params);
    if (!signature.valid) {
      console.warn(
        `SSLCommerz IPN signature failed (${signature.method}) for tran ${tranId}`,
      );
    }

    if (status === "VALID" && valId) {
      if (Math.abs(amount - order.payment.amount) > 0.01) {
        await db.payment.update({
          where: { orderId: order.id },
          data: { status: "FAILED" },
        });
        return NextResponse.json({ ok: true });
      }

      let verified = false;
      let settledAmount = amount;
      try {
        const verification = await verifySslPayment(valId, amount, tranId);
        const gatewayStatus = String(verification.status ?? "").toUpperCase();
        verified =
          verification.APIConnect === "VALID" || gatewayStatus === "VALID";
        const gatewayAmount = Number(
          verification.store_amount ?? verification.amount ?? amount,
        );
        if (Number.isFinite(gatewayAmount) && gatewayAmount > 0) {
          settledAmount = gatewayAmount;
        }
      } catch (err) {
        console.error(
          "SSLCommerz IPN val_id check failed; falling back to signature:",
          err,
        );
      }

      // Authoritative sources only: live val_id check OR valid gateway signature.
      if (verified || signature.valid) {
        if (Math.abs(settledAmount - order.payment.amount) > 0.01) {
          await db.payment.update({
            where: { orderId: order.id },
            data: { status: "FAILED" },
          });
          return NextResponse.json({ ok: true });
        }

        await db.payment.update({
          where: { orderId: order.id },
          data: { status: "COMPLETED", transactionId: valId, tranId },
        });
        void loadOrderWithItemsAndUser(order.id).then((payload) => {
          if (payload) void notifyPaymentCompleted(payload);
        });
      } else {
        await db.payment.update({
          where: { orderId: order.id },
          data: { status: "FAILED" },
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