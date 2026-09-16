import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { getOrCreateCart, computeShipping } from "@/lib/cart-service";
import { findValidCoupon } from "@/lib/coupon-service";
import {
  notifyOrderPlaced,
  lowStockAlerts,
} from "@/lib/notification";

const ALLOWED_PAYMENT_METHODS = new Set([
  "cash_on_delivery",
  "sslcommerz",
]);

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const orders = await db.order.findMany({
      where: { userId: userId as string },
      include: {
        items: {
          take: 1,
          select: { product: { select: { id: true, image: true, title: true } } },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        itemCount: order._count.items,
        previewImage: order.items[0]?.product.image ?? null,
        previewTitle: order.items[0]?.product.title ?? null,
      })),
    });
  } catch (err) {
    console.error("List orders error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId, error } = await requireUser();
  if (error) return error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { address, phone, paymentMethod, couponCode } = body;

  if (typeof address !== "string" || !address.trim()) {
    return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
  }
  if (typeof phone !== "string" || !phone.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }
  if (
    typeof paymentMethod !== "string" ||
    !ALLOWED_PAYMENT_METHODS.has(paymentMethod)
  ) {
    return NextResponse.json(
      { error: "Payment method is not available yet" },
      { status: 400 },
    );
  }

  try {
    const cart = getOrCreateCart(userId as string);
    const hydrated = await cart;

    if (hydrated.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const totalIssued = hydrated.items
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const subtotal = Number(totalIssued.toFixed(2));

    let discountAmount = 0;
    let freeShipping = false;
    let couponId: string | null = null;
    if (couponCode) {
      const result = await findValidCoupon(
        couponCode as string,
        userId as string,
        subtotal,
      );
      if (!result.coupon) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      couponId = result.coupon.id;
      discountAmount = result.discount.discountAmount;
      freeShipping = result.discount.freeShipping;
    }

    const shipping = freeShipping ? 0 : computeShipping(subtotal);
    const total = Number((subtotal + shipping - discountAmount).toFixed(2));

    const products = await db.product.findMany({
      where: { id: { in: hydrated.items.map((item) => item.productId) } },
    });
    const stockMap = new Map(products.map((p) => [p.id, p.stock]));
    for (const item of hydrated.items) {
      if ((stockMap.get(item.productId) ?? 0) < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product.title}` },
          { status: 400 },
        );
      }
    }

    const created = await db.$transaction([
      db.order.create({
        data: {
          userId: userId as string,
          status: "PENDING",
          address: address.trim(),
          phone: phone.trim(),
          total,
          couponId,
          discount: discountAmount,
          items: {
            create: hydrated.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
          payment: {
            create: { method: paymentMethod, status: "PENDING", amount: total },
          },
        },
        include: {
          items: { include: { product: true } },
          payment: true,
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      ...hydrated.items.map((item) =>
        db.product.updateMany({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
      ...(couponId
        ? [
            db.coupon.update({
              where: { id: couponId },
              data: { timesUsed: { increment: 1 } },
            }),
            db.couponUse.create({
              data: { couponId, userId: userId as string },
            }),
          ]
        : []),
      db.cartItem.deleteMany({ where: { cartId: hydrated.id } }),
    ]);

    const { user, ...orderData } = created[0];

    void notifyOrderPlaced({
      id: orderData.id,
      total: orderData.total,
      address: orderData.address,
      phone: orderData.phone,
      items: orderData.items.map((i) => ({
        quantity: i.quantity,
        price: i.price,
        title: i.product.title,
      })),
      user,
    });
    void lowStockAlerts();

    return NextResponse.json(
      {
        id: orderData.id,
        status: orderData.status,
        total: orderData.total,
        items: orderData.items,
        payment: orderData.payment,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}