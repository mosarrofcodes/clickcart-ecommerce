import { NextResponse } from "next/server";
import { db, withDbRetry } from "@/lib/db";
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

  const { productId, quantity = 1, variantId = null } = body;

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

  if (variantId !== null && typeof variantId !== "string") {
    return NextResponse.json({ error: "Invalid variantId" }, { status: 400 });
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let variant = null;
  if (variantId) {
    variant = product.variants.find((v) => v.id === variantId);
    if (!variant) {
      return NextResponse.json(
        { error: "Variant not found for this product" },
        { status: 400 },
      );
    }
  }

  const available = variant ? variant.stock : product.stock;
  const lineKey = variant ? `${productId}::${variantId}` : productId;

  try {
    return await withDbRetry(async () => {
      const cart = getOrCreateCart(userId as string);
      const hydratedCart = await cart;

      const existing = await db.cartItem.findUnique({
        where: {
          cartId_lineKey: { cartId: hydratedCart.id, lineKey },
        },
      });

      const newQuantity = (existing?.quantity ?? 0) + quantity;
      if (newQuantity > available) {
        return NextResponse.json(
          { error: `Only ${available} units of this item are in stock` },
          { status: 400 },
        );
      }

      const cartItems = await db.cartItem.upsert({
        where: {
          cartId_lineKey: { cartId: hydratedCart.id, lineKey },
        },
        create: {
          cartId: hydratedCart.id,
          productId,
          variantId,
          lineKey,
          quantity,
        },
        update: { quantity: newQuantity },
      });
      if (!cartItems) {
        return NextResponse.json(
          { error: "Failed to add item" },
          { status: 500 },
        );
      }

      const updatedCart = getOrCreateCart(userId as string);
      return NextResponse.json(cartSummary(await updatedCart), { status: 201 });
    });
  } catch (err) {
    console.error("Add cart item error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}