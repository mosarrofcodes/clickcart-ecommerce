import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  orderConfirmationEmail,
  paymentReceiptEmail,
  shippingNotificationEmail,
  type OrderEmailContext,
} from "@/lib/email-templates";
import { computeShipping } from "@/lib/cart-service";

export const NOTIFICATION_TYPES = {
  order: "order",
  payment: "payment",
  stock: "stock",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

interface CreateNotificationInput {
  type: NotificationType | string;
  title: string;
  body?: string;
  link?: string;
}

type NotificationPreference = {
  emailOrderUpdates: boolean;
  emailPayment: boolean;
  inAppEnabled: boolean;
};

const defaultPreference = (): NotificationPreference => ({
  emailOrderUpdates: true,
  emailPayment: true,
  inAppEnabled: true,
});

export async function getNotificationPreference(
  userId: string,
): Promise<NotificationPreference> {
  const pref = await db.notificationPreference.findUnique({ where: { userId } });
  if (!pref) return defaultPreference();
  return {
    emailOrderUpdates: pref.emailOrderUpdates,
    emailPayment: pref.emailPayment,
    inAppEnabled: pref.inAppEnabled,
  };
}

/**
 * Creates an in-app notification for a user unless in-app notifications are
 * disabled for them. Never throws — failures are logged and swallowed so the
 * caller's request flow is never blocked.
 */
export async function createNotification(
  userId: string,
  input: CreateNotificationInput,
): Promise<void> {
  try {
    const pref = await db.notificationPreference.findUnique({ where: { userId } });
    if (pref && !pref.inAppEnabled) return;

    await db.notification.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
      },
    });
  } catch (err) {
    console.error("createNotification error:", err);
  }
}

function allowedEmail(
  pref: NotificationPreference,
  type: NotificationType | string,
): boolean {
  if (type === NOTIFICATION_TYPES.payment) return pref.emailPayment;
  return pref.emailOrderUpdates;
}

export type OrderWithItems = {
  id: string;
  total: number;
  address: string;
  phone: string;
  items: { quantity: number; price: number; title: string }[];
  user: { id: string; email: string; name: string | null };
};

export async function loadOrderWithItemsAndUser(
  orderId: string,
): Promise<OrderWithItems | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      total: true,
      address: true,
      phone: true,
      items: {
        select: {
          quantity: true,
          price: true,
          product: { select: { title: true } },
        },
      },
      user: { select: { id: true, email: true, name: true } },
    },
  });
  if (!order) return null;
  return {
    id: order.id,
    total: order.total,
    address: order.address,
    phone: order.phone,
    items: order.items.map((i) => ({
      quantity: i.quantity,
      price: i.price,
      title: i.product.title,
    })),
    user: order.user,
  };
}

/**
 * Reconstructs subtotal/shipping/discount from the stored order (same math the
 * admin order detail page uses) so email templates can show a full summary.
 */
export function orderEmailContext(order: OrderWithItems): OrderEmailContext {
  const subtotal = Number(
    order.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2),
  );
  const shipping = Number(computeShipping(subtotal).toFixed(2));
  const discount = Math.max(0, Number((subtotal + shipping - order.total).toFixed(2)));
  return {
    orderId: order.id,
    customerName: order.user.name ?? "Customer",
    items: order.items.map((i) => ({
      title: i.title,
      quantity: i.quantity,
      price: i.price,
    })),
    subtotal,
    shipping,
    discount,
    total: order.total,
    address: order.address,
    phone: order.phone,
  };
}

export async function notifyOrderPlaced(order: OrderWithItems): Promise<void> {
  const userId = order.user.id;
  await createNotification(userId, {
    type: NOTIFICATION_TYPES.order,
    title: "Order confirmed",
    body: `Your order #${order.id} has been received and is being processed.`,
    link: `/orders/${order.id}`,
  });
  try {
    const pref = await getNotificationPreference(userId);
    if (allowedEmail(pref, NOTIFICATION_TYPES.order)) {
      await sendEmail({
        to: order.user.email,
        subject: `Order confirmed — #${order.id} | ClickCart`,
        html: orderConfirmationEmail(orderEmailContext(order)),
      });
    }
  } catch (err) {
    console.error("order confirmation email error:", err);
  }
}

export async function notifyOrderShipped(order: OrderWithItems): Promise<void> {
  const userId = order.user.id;
  await createNotification(userId, {
    type: NOTIFICATION_TYPES.order,
    title: "Order shipped",
    body: `Your order #${order.id} is on its way.`,
    link: `/orders/${order.id}`,
  });
  try {
    const pref = await getNotificationPreference(userId);
    if (allowedEmail(pref, NOTIFICATION_TYPES.order)) {
      await sendEmail({
        to: order.user.email,
        subject: `Your order is on the way — #${order.id} | ClickCart`,
        html: shippingNotificationEmail(orderEmailContext(order)),
      });
    }
  } catch (err) {
    console.error("shipping notification email error:", err);
  }
}

export async function notifyOrderDelivered(order: OrderWithItems): Promise<void> {
  await createNotification(order.user.id, {
    type: NOTIFICATION_TYPES.order,
    title: "Order delivered",
    body: `Your order #${order.id} has been delivered. Enjoy!`,
    link: `/orders/${order.id}`,
  });
}

export async function notifyOrderCancelled(order: OrderWithItems): Promise<void> {
  await createNotification(order.user.id, {
    type: NOTIFICATION_TYPES.order,
    title: "Order cancelled",
    body: `Your order #${order.id} was cancelled.`,
    link: `/orders/${order.id}`,
  });
}

export async function notifyPaymentCompleted(
  order: OrderWithItems,
): Promise<void> {
  const userId = order.user.id;
  await createNotification(userId, {
    type: NOTIFICATION_TYPES.payment,
    title: "Payment received",
    body: `Payment for order #${order.id} was successful.`,
    link: `/orders/${order.id}`,
  });
  try {
    const pref = await getNotificationPreference(userId);
    if (allowedEmail(pref, NOTIFICATION_TYPES.payment)) {
      await sendEmail({
        to: order.user.email,
        subject: `Payment received — #${order.id} | ClickCart`,
        html: paymentReceiptEmail(orderEmailContext(order)),
      });
    }
  } catch (err) {
    console.error("payment receipt email error:", err);
  }
}

/**
 * Notifies admins (in-app) about products running low on stock.
 */
export async function lowStockAlerts(limit = 5): Promise<void> {
  try {
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    if (admins.length === 0) return;

    const lowStock = await db.product.findMany({
      where: { stock: { lte: limit } },
      orderBy: { stock: "asc" },
      take: 10,
    });
    if (lowStock.length === 0) return;

    const message = lowStock
      .map((p) => `${p.title} (${p.stock} left)`)
      .join(", ");

    for (const admin of admins) {
      await createNotification(admin.id, {
        type: NOTIFICATION_TYPES.stock,
        title: "Low stock alert",
        body: message,
        link: "/admin/products",
      });
    }
  } catch (err) {
    console.error("lowStockAlerts error:", err);
  }
}