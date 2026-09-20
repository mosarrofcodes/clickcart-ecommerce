import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { initSslSession, generateTranId } from "@/lib/sslcommerz";

export async function POST(req: NextRequest) {
  const { userId, error } = await requireUser();
  if (error) return error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { orderId, paymentMethod } = body;
  if (typeof orderId !== "string" || !orderId.trim()) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const order = await db.order.findUnique({
      where: { id: orderId.trim() },
      include: {
        payment: true,
        items: { include: { product: true } },
        user: { select: { id: true, email: true, name: true } },
      },
    });

    if (!order || order.userId !== userId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const payment = order.payment;
    if (
      !payment ||
      (payment.method !== "sslcommerz" && payment.method !== "bkash") ||
      !["PENDING", "FAILED"].includes(payment.status)
    ) {
      return NextResponse.json(
        { error: "Order payment is not retryable" },
        { status: 400 },
      );
    }
    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Order is cancelled" },
        { status: 400 },
      );
    }

    const isBkash =
      paymentMethod === "bkash" || payment.method === "bkash";

    // Fresh tran_id per attempt so gateway retries never collide.
    // Persist it first so callbacks can locate this order.
    const tranId = generateTranId();
    await db.payment.update({
      where: { orderId: order.id },
      data: { tranId },
    });

    const result = await initSslSession({
      total_amount: Number(order.total.toFixed(2)),
      currency: "BDT",
      tran_id: tranId,
      success_url: `${appUrl}/api/payments/sslcommerz/success`,
      fail_url: `${appUrl}/api/payments/sslcommerz/fail`,
      cancel_url: `${appUrl}/api/payments/sslcommerz/cancel`,
      ipn_url: `${appUrl}/api/payments/sslcommerz/ipn`,
      product_name: order.items
        .map((item) => item.product.title)
        .join(", ")
        .slice(0, 500),
      product_category: "Ecommerce",
      product_profile: "general",
      cus_name: order.user.name || order.phone,
      cus_email: order.user.email,
      cus_add1: order.address.slice(0, 300),
      cus_city: order.city || "Dhaka",
      cus_state: order.city || "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: order.phone,
      payment_method: isBkash ? "bkash" : undefined,
    });

    if (result.status !== "SUCCESS" || !result.GatewayPageURL) {
      return NextResponse.json(
        { error: result.failedreason ?? "Failed to initialize payment" },
        { status: 502 },
      );
    }

    await db.payment.update({
      where: { orderId: order.id },
      data: { sessionKey: result.sessionkey ?? null },
    });

    return NextResponse.json({
      gatewayPageURL: result.GatewayPageURL,
      sessionKey: result.sessionkey,
    });
  } catch (err) {
    console.error("SSLCommerz init error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}