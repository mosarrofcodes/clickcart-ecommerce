import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ result?: string; orderId?: string }>;
}

export const metadata: Metadata = { title: "Payment Status | ClickCart" };

export default async function PaymentStatusPage({ searchParams }: PageProps) {
  const { result, orderId } = await searchParams;

  const success = result === "success";
  const cancelled = result === "cancelled";
  const failed = result === "failed";

  const Icon = success
    ? CheckCircle2
    : cancelled || failed
      ? XCircle
      : Loader2;
  const title = success
    ? "Payment Successful"
    : cancelled
      ? "Payment Cancelled"
      : failed
        ? "Payment Failed"
        : "Processing Payment";
  const desc = success
    ? "Your payment has been received. We'll start processing your order shortly."
    : cancelled
      ? "You cancelled the payment. You can retry from your order page."
      : failed
        ? "We could not process your payment. Please try again or choose another method."
        : "Your payment is being verified. Refresh this page in a moment.";

  return (
    <main className="max-w-md mx-auto px-6 py-20 flex flex-col items-center gap-4 text-center">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center ${
          success
            ? "bg-green-100 text-green-600"
            : cancelled || failed
              ? "bg-red-100 text-red-600"
              : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon
          className={`w-8 h-8 ${!success && !cancelled && !failed ? "animate-spin" : ""}`}
        />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground text-sm">{desc}</p>

      {orderId && (
        <div className="flex gap-3 mt-4">
          <Link
            href={`/orders/${orderId}`}
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            View Order
          </Link>
          {(cancelled || failed) && (
            <Link
              href={`/orders/${orderId}`}
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg border text-sm font-medium hover:bg-muted/50"
            >
              Retry Payment
            </Link>
          )}
        </div>
      )}

      <Link href="/orders" className="text-sm text-muted-foreground hover:text-primary">
        Go to all orders
      </Link>
    </main>
  );
}