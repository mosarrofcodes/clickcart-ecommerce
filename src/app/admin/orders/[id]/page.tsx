import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Phone, CreditCard } from "lucide-react";
import { db } from "@/lib/db";
import { computeShipping } from "@/lib/cart-service";
import { OrderStatusControl, PrintButton } from "@/components/admin/OrderActions";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      payment: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) notFound();

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = computeShipping(subtotal);
  const discount = Math.max(0, Number((subtotal + shipping - order.total).toFixed(2)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 print-hidden">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to orders
        </Link>
        <PrintButton />
      </div>

      <div className="print-order">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Order #{order.id.slice(0, 12)}</h2>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <OrderStatusControl orderId={order.id} status={order.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="border rounded-lg p-5 bg-background">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                Items
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <section className="border rounded-lg p-5 bg-background">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </h3>
                <p className="text-sm">{order.address}</p>
                {order.user && (
                  <p className="text-sm mt-2 text-muted-foreground">{order.user.name}</p>
                )}
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5" />
                  {order.phone}
                </p>
              </section>

              <section className="border rounded-lg p-5 bg-background">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    Method:{" "}
                    <span className="font-medium">
                      {order.payment?.method.replace(/_/g, " ") ?? "—"}
                    </span>
                  </p>
                  <p>
                    Status:{" "}
                    <span className="font-medium">{order.payment?.status ?? "—"}</span>
                  </p>
                  {order.payment?.transactionId && (
                    <p className="text-muted-foreground truncate">
                      Txn: {order.payment.transactionId}
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="space-y-6">
            <section className="border rounded-lg p-5 bg-background">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-bold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </section>

            <section className="border rounded-lg p-5 bg-background">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                Customer
              </h3>
              {order.user ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-muted-foreground">{order.user.email}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Registered customer</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}