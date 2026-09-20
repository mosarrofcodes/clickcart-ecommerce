import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { getOrCreateCart, cartSummary } from "@/lib/cart-service";

type VariantLessRouteContext = { params: Promise<{ productId: string }> };

async function getContext(
  req: NextRequest,
  ctx: VariantLessRouteContext,
): Promise<{ productId: string; variantId: string | null }> {
  const { productId } = await ctx.params;
  const url = new URL(req.url);
  const variantId = url.searchParams.get("variantId");
  return { productId, variantId };
}

export async function PUT(
  req: NextRequest,
  ctx: VariantLessRouteContext,
) {
  const { userId, error } = await requireUser();
  if (error) return error;

  const { productId, variantId } = await getContext(req, ctx);

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

  const lineKey = variantId ? `${productId}::${variantId}` : productId;

  const product = await db.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const variant = variantId
    ? product.variants.find((v) => v.id === variantId)
    : null;
  if (variantId && !variant) {
    return NextResponse.json(
      { error: "Variant not found for this product" },
      { status: 400 },
    );
  }

  const available = variant ? variant.stock : product.stock;
  if (quantity > available) {
    return NextResponse.json(
      { error: `Only ${available} units of this item are in stock` },
      { status: 400 },
    );
  }

  try {
    const cart = getOrCreateCart(userId as string);
    const hydratedCart = await cart;

    const result = await db.cartItem.updateMany({
      where: { cartId: hydratedCart.id, lineKey },
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
  req: NextRequest,
  ctx: VariantLessRouteContext,
) {
  const { userId, error } = await requireUser();
  if (error) return error;

  const { productId, variantId } = await getContext(req, ctx);
  const lineKey = variantId ? `${productId}::${variantId}` : productId;

  try {
    const cart = getOrCreateCart(userId as string);
    const hydratedCart = await cart;

    const result = await db.cartItem.deleteMany({
      where: { cartId: hydratedCart.id, lineKey },
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