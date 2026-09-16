import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { recomputeProductRating } from "@/lib/review-service";

export async function POST(req: Request) {
  const { userId, error } = await requireUser();
  if (error) return error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { productId, rating, comment } = body;

  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return NextResponse.json(
      { error: "rating must be an integer between 1 and 5" },
      { status: 400 },
    );
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const review = await db.review.upsert({
      where: { userId_productId: { userId: userId as string, productId } },
      create: {
        userId: userId as string,
        productId,
        rating: numericRating,
        comment: typeof comment === "string" && comment.trim() ? comment.trim() : null,
      },
      update: {
        rating: numericRating,
        comment: typeof comment === "string" && comment.trim() ? comment.trim() : null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    await recomputeProductRating(productId);

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json({ error: "You already reviewed this product" }, { status: 409 });
    }
    console.error("Create review error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}