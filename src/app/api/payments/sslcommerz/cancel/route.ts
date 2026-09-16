import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tranId = searchParams.get("tran_id");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (tranId) {
    try {
      const order = await db.order.findUnique({
        where: { id: tranId },
        include: { payment: true },
      });
      if (order?.payment && order.payment.status === "PENDING") {
        await db.payment.update({
          where: { orderId: order.id },
          data: { status: "FAILED" },
        });
      }
    } catch (err) {
      console.error("SSLCommerz cancel callback error:", err);
    }
  }

  return NextResponse.redirect(
    `${appUrl}/payment/status?result=cancelled&orderId=${tranId ?? ""}`,
  );
}