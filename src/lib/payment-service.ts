import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

const ORDER_INCLUDE = {
  payment: true,
  user: { select: { id: true, email: true, name: true } },
  items: { include: { product: { select: { id: true, image: true, title: true } } } },
} satisfies Prisma.OrderInclude;

/** Locates an order by its current gateway ref (tran_id) or settled transaction id. */
export async function findOrderByTranId(tranId: string) {
  if (!tranId) return null;

  const byRef = await db.order.findFirst({
    where: { payment: { tranId } },
    include: ORDER_INCLUDE,
  });
  if (byRef) return byRef;

  return db.order.findFirst({
    where: { payment: { transactionId: tranId } },
    include: ORDER_INCLUDE,
  });
}

export async function findOrderById(orderId: string) {
  return db.order.findUnique({
    where: { id: orderId },
    include: ORDER_INCLUDE,
  });
}