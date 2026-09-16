import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { getOrCreateCart, cartSummary } from "@/lib/cart-service";

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/cart/items/[productId]">,
) {
  const { userId, error } = await requireUser();
  if (error) return error;

  const { productId } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { quantity } = body;

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

  if (quantity > product.stock) {
    return NextResponse.json(
      { error: `Only ${product.stock} units of this item are in stock` },
      { status: 400 },
    );
  }

  try {
    const cart = getOrCreateCart(userId as string);
    const hydratedCart = await cart;

    const result = await db.cartItem.updateMany({
      where: { cartId: hydratedCart.id, productId },
      data: { quantity },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Item not in cart" }, { status: 404 });
    }

    const updatedCart = getOrCreateCart(userId as string);
    return NextResponse.json(cartSummary(await updatedCart));
  } catch (err) {
    console.error("Update cart item error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/cart/items/[productId]">,
) {
  const { userId, error } = await requireUser();
  if (error) return error;

  const { productId } = await ctx.params;

  try {
    const cart = getOrCreateCart(userId as string);
    const hydratedCart = await cart;

    const result = await db.cartItem.deleteMany({
      where: { cartId: hydratedCart.id, productId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Item not in cart" }, { status: 404 });
    }

    const updatedCart = getOrCreateCart(userId as string);
    return NextResponse.json(cartSummary(await updatedCart));
  } catch (err) {
    console.error("Remove cart item error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}