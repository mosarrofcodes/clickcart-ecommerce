import { db } from "@/lib/db";

export async function recomputeProductRating(productId: string): Promise<void> {
  const agg = await db.review.aggregate({
    where: { productId },
    _avg: { rating: true },
  });

  const avg = agg._avg.rating;
  await db.product.update({
    where: { id: productId },
    data: { rating: avg ? Number(avg.toFixed(2)) : 0 },
  });
}