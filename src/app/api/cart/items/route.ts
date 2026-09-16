import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { getOrCreateCart, cartSummary } from "@/lib/cart-service";

export async function POST(req: Request) {
  const { userId, error } = await requireUser();
  if (error) return error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { productId, quantity = 1 } = body;

  if (typeof productId !== "string" || !productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 },
    );
  }

  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      { error: "quantity must be a positive integer" },
      { status: 400 },
    );
  }

  const product = await db.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const cart = getOrCreateCart(userId as string);
    const hydratedCart = await cart;

    const existing = await db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: hydratedCart.id,
          productId,
        },
      },
    });

    const newQuantity = (existing?.quantity ?? 0) + quantity;
    if (newQuantity > product.stock) {
      return NextResponse.json(
        { error: `Only ${product.stock} units of this item are in stock` },
        { status: 400 },
      );
    }

    await db.cartItem.upsert({
      where: {
        cartId_productId: { cartId: hydratedCart.id, productId },
      },
      create: { cartId: hydratedCart.id, productId, quantity },
      update: { quantity: newQuantity },
    });

    const updatedCart = getOrCreateCart(userId as string);
    return NextResponse.json(cartSummary(await updatedCart), { status: 201 });
  } catch (err) {
    console.error("Add cart item error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}