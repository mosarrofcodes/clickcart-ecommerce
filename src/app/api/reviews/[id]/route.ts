import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { recomputeProductRating } from "@/lib/review-service";

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/reviews/[id]">,
) {
  const { userId, error } = await requireUser();
  if (error) return error;

  const { id } = await ctx.params;

  const existing = await db.review.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
  if (existing.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await db.review.delete({ where: { id } });
    await recomputeProductRating(existing.productId);
    return NextResponse.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Delete review error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}