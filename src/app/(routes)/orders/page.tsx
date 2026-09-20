import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Package } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { STATUS_COLORS } from "@/lib/order-status";
import { formatMoney } from "@/lib/currency";

export const metadata: Metadata = {
  title: "My Orders | ClickCart",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/orders");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        take: 1,
        orderBy: { id: "asc" },
        include: { product: { select: { image: true, title: true } } },
      },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border rounded-lg py-20">
          <Package className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">No orders yet.</p>
          <ButtonChild label="Start Shopping" href="/" />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const color = STATUS_COLORS[order.status as keyof typeof STATUS_COLORS];
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center gap-4 border rounded-lg p-4 hover:shadow-md transition"
              >
                {order.items[0]?.product.image ? (
                  <Image
                    src={order.items[0].product.image}
                    alt={order.items[0].product.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded border flex items-center justify-center bg-muted/40">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">
                    {order.items[0]?.product.title ?? "Order"}
                    {order._count.items > 1
                      ? ` +${order._count.items - 1} more`
                      : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                    {order._count.items} item{order._count.items > 1 ? "s" : ""} ·
                    {formatMoney(order.total)}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>
                  {order.status}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

function ButtonChild({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
    >
      {label}
    </Link>
  );
}