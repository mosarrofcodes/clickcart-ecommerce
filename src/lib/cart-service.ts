import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 4.99;

const cartInclude = {
  items: {
    include: {
      product: { include: { category: true } },
    },
    orderBy: { id: "asc" as const },
  },
} satisfies Prisma.CartInclude;

export async function getOrCreateCart(userId: string) {
  return db.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: cartInclude,
  });
}

export function cartSummary(
  cart: Awaited<ReturnType<typeof getOrCreateCart>>,
) {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  return { ...cart, subtotal: Number(subtotal.toFixed(2)) };
}

export function computeShipping(subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_COST;
}