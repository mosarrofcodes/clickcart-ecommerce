import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, MapPin, Phone, Banknote } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  ORDER_STATUS_STEPS,
  STATUS_COLORS,
  statusStepIndex,
  type OrderStatus,
} from "@/lib/order-status";
import CancelOrderButton from "@/components/order/CancelOrderButton";
import PayNowButton from "@/components/order/PayNowButton";
import { PrintButton } from "@/components/admin/OrderActions";
import { formatMoney } from "@/lib/currency";
import { getSiteSettings, isInsideDhaka } from "@/lib/site-settings";
import { SITE_PHONE, SITE_EMAIL, SITE_ADDRESS } from "@/lib/site";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}

const CANCELLABLE = new Set<OrderStatus>(["PENDING", "CONFIRMED"]);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id} | ClickCart` };
}

export default async function OrderDetailsPage({ params, searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { id } = await params;
  const { placed } = await searchParams;

  const [order, settings] = await Promise.all([
    db.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true }, orderBy: { id: "asc" } },
        payment: true,
      },
    }),
    getSiteSettings(),
  ]);

  if (!order || order.userId !== session.user.id) notFound();

  const status = order.status as OrderStatus;
  const currentStep = statusStepIndex(status);
  const cancellable = CANCELLABLE.has(status);
  const isCancelled = status === "CANCELLED";
  const payable =
    !isCancelled &&
    order.payment?.method === "sslcommerz" &&
    ["PENDING", "FAILED"].includes(order.payment.status);

  const subtotal = Number(
    order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2),
  );
  const discount = Math.max(0, order.discount ?? 0);
  const shipping =
    order.shipping > 0
      ? order.shipping
      : Math.max(0, Number((order.total - subtotal + discount).toFixed(2)));
  const insideDhaka = isInsideDhaka(order.district ?? order.city);
  const estimatedDelivery = insideDhaka
    ? settings.deliveryEstimateInside
    : settings.deliveryEstimateOutside;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 print-order">
      <header className="hidden print:block print-only mb-6">
        <div className="flex items-start justify-between pb-4 border-b">
          <div>
            <p className="text-2xl font-bold">ClickCart</p>
            <p className="text-sm">
              {SITE_ADDRESS}
              <br />
              {SITE_PHONE} · {SITE_EMAIL}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">
              Invoice #{id.slice(-8).toUpperCase()}
            </p>
            <p className="text-sm">
              Date: {new Date(order.createdAt).toLocaleString()}
            </p>
            <p className="text-sm">
              Status: <span className="font-semibold">{status}</span>
            </p>
          </div>
        </div>
      </header>
      <div className="print-hidden">
        {placed === "1" && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">
                Thank you! Your order has been placed.
              </p>
              <p className="text-sm text-green-700">
                Order #{id.slice(-8).toUpperCase()} is now PENDING.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl font-bold">
            Order #{id.slice(-8).toUpperCase()}
          </h1>
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_COLORS[status]}`}
          >
            {status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Placed on {new Date(order.createdAt).toLocaleString()} · Invoice #
          {id.slice(-8).toUpperCase()}
        </p>
      </div>

      {isCancelled ? (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-8 text-sm text-red-700">
          This order was cancelled.
        </div>
      ) : (
        <div className="border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            {ORDER_STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      i <= currentStep
                        ? "bg-primary"
                        : "bg-border"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wide ${
                      i <= currentStep
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {i < ORDER_STATUS_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      i < currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Estimated delivery:
            <span className="font-medium text-foreground">
              {" "}
              {estimatedDelivery}
            </span>
            {" "}
            {insideDhaka ? "(Inside Dhaka)" : "(Outside Dhaka)"}
          </p>
        </div>
      )}

      <div className="border rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Image
                src={item.product.image}
                alt={item.product.title}
                width={56}
                height={56}
                className="w-14 h-14 object-cover rounded border"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  <Link href={`/product/${item.productId}`} className="hover:text-primary">
                    {item.product.title}
                  </Link>
                </p>
                {item.variantName && (
                  <p className="text-muted-foreground text-xs">
                    {item.variantName}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {item.quantity} × {formatMoney(item.price)}
                </p>
              </div>
              <span className="font-semibold">
                {formatMoney(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatMoney(shipping)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatMoney(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>Total</span>
            <span>{formatMoney(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-3">Delivery Address</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              {order.address}
            </p>
            {order.district && (
              <p className="pl-6 text-xs">
                District: {order.district}
              </p>
            )}
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0" />
              {order.phone}
            </p>
          </div>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-3">Payment</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Banknote className="w-4 h-4 shrink-0" />
              {order.payment?.method.replace(/_/g, " ").toUpperCase() ?? "COD"}
            </p>
            <p>
              Status:{" "}
              <span
                className={`font-medium px-2 py-0.5 rounded-full ${
                  order.payment?.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : order.payment?.status === "FAILED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {order.payment?.status ?? "PENDING"}
              </span>
            </p>
            {order.payment?.transactionId && (
              <p className="break-all">
                Transaction ID:{" "}
                <span className="text-foreground font-medium">
                  {order.payment.transactionId}
                </span>
              </p>
            )}
            <p className="flex justify-between text-base font-bold text-foreground">
              <span>Total</span>
              <span>{formatMoney(order.total)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="print-hidden flex gap-3 flex-wrap">
        <PayNowButton orderId={order.id} payable={payable} />
        <CancelOrderButton orderId={order.id} cancellable={cancellable} />
        <ButtonLink label="Back to Orders" href="/orders" />
        <PrintButton label="Print Invoice" />
      </div>
    </main>
  );
}

function ButtonLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center h-9 px-4 rounded-lg border text-sm font-medium hover:bg-muted/50"
    >
      {label}
    </Link>
  );
}