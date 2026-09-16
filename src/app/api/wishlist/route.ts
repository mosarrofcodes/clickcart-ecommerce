import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";

export async function GET() {
  const { userId, error } = await requireUser();
  if (error) return error;

  const wishlist = await db.wishlist.findMany({
    where: { userId: userId as string },
    include: {
      product: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    items: wishlist.map((w) => w.product),
  });
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

  const productId = String(body.productId ?? "");
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    await db.wishlist.upsert({
      where: { userId_productId: { userId: userId as string, productId } },
      create: { userId: userId as string, productId },
      update: {},
    });

    const wishlist = await db.wishlist.findMany({
      where: { userId: userId as string },
      select: { productId: true },
    });
    return NextResponse.json({
      items: wishlist.map((w) => w.productId),
    });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}