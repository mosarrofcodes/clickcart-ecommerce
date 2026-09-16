import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/wishlist/[productId]">,
) {
  const { userId, error } = await requireUser();
  if (error) return error;

  const { productId } = await ctx.params;

  await db.wishlist.deleteMany({
    where: { userId: userId as string, productId },
  });

  const wishlist = await db.wishlist.findMany({
    where: { userId: userId as string },
    select: { productId: true },
  });

  return NextResponse.json({ items: wishlist.map((w) => w.productId) });
}