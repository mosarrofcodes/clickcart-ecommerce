import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { findOrderByTranId } from "@/lib/payment-service";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tranId = searchParams.get("tran_id");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let orderId = tranId ?? "";
  if (tranId) {
    try {
      const order = await findOrderByTranId(tranId);
      if (order?.payment) {
        orderId = order.id;
        if (order.payment.status === "PENDING") {
          await db.payment.update({
            where: { orderId: order.id },
            data: { status: "FAILED" },
          });
        }
      }
    } catch (err) {
      console.error("SSLCommerz fail callback error:", err);
    }
  }

  return NextResponse.redirect(
    `${appUrl}/payment/status?result=failed&orderId=${orderId}`,
  );
}