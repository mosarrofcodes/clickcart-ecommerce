import { NextResponse } from "next/server";
import { db, withDbRetry } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { getOrCreateCart, cartSummary } from "@/lib/cart-service";

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    return await withDbRetry(async () => {
      const cart = getOrCreateCart(userId as string);
      return NextResponse.json(cartSummary(await cart));
    });
  } catch (err) {
    console.error("Get cart error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    return await withDbRetry(async () => {
      const cart = await db.cart.findUnique({
        where: { userId: userId as string },
      });

      if (cart) {
        await db.cartItem.deleteMany({ where: { cartId: cart.id } });
        await db.cart.delete({ where: { id: cart.id } });
      }

      const emptyCart = getOrCreateCart(userId as string);
      return NextResponse.json(cartSummary(await emptyCart));
    });
  } catch (err) {
    console.error("Clear cart error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}