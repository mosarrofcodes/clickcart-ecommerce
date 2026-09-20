import { db, withDbRetry } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  computeShipping,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
  type ShippingParams,
} from "@/lib/store-config";

export {
  computeShipping,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
  type ShippingParams,
};

const cartInclude = {
  items: {
    include: {
      product: { include: { category: true } },
      variant: true,
    },
    orderBy: { id: "asc" as const },
  },
} satisfies Prisma.CartInclude;

export async function getOrCreateCart(userId: string) {
  return withDbRetry(() =>
    db.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: cartInclude,
    }),
  );
}

export function cartSummary(
  cart: Awaited<ReturnType<typeof getOrCreateCart>>,
) {
  const subtotal = cart.items.reduce(
    (sum, item) =>
      sum + (item.variant ? item.variant.price : item.product.price) * item.quantity,
    0,
  );
  return { ...cart, subtotal: Number(subtotal.toFixed(2)) };
}

/** Effective per-unit price + stock for a cart line (variant-aware). */
export function linePrice(item: {
  variant?: { price: number } | null;
  product: { price: number };
}): number {
  return item.variant ? item.variant.price : item.product.price;
}

export function lineStock(item: {
  variant?: { stock: number } | null;
  product: { stock: number };
}): number {
  return item.variant ? item.variant.stock : item.product.stock;
}