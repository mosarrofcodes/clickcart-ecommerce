import { db } from "@/lib/db";
import {
  loadOrderWithItemsAndUser,
  notifyOrderCancelled,
} from "@/lib/notification";

const AUTOCANCEL_STATUSES = ["PENDING", "CONFIRMED"] as const;

/**
 * Cancels orders stuck in PENDING/CONFIRMED with an unpaid payment for longer
 * than `hours`, restores stock, and notifies the customer. Returns count.
 */
export async function cancelStalePendingOrders(hours = 24): Promise<number> {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

  const stale = await db.order.findMany({
    where: {
      status: { in: [...AUTOCANCEL_STATUSES] },
      createdAt: { lt: cutoff },
      payment: { status: { not: "COMPLETED" } },
    },
    include: { items: true },
  });

  for (const order of stale) {
    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      }),
      ...order.items.map((item) =>
        item.variantId
          ? db.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            })
          : db.product.updateMany({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            }),
      ),
    ]);

    void loadOrderWithItemsAndUser(order.id).then((payload) => {
      if (payload) void notifyOrderCancelled(payload);
    });
  }

  return stale.length;
}