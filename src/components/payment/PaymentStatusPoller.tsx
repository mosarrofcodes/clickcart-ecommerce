"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
}

export default function PaymentStatusPoller({ orderId }: Props) {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;
    let attempts = 0;

    const poll = async () => {
      if (stopped) return;
      try {
        const res = await fetch(`/api/payments/sslcommerz/status/${orderId}`);
        const data = await res.json();
        if (data?.paymentStatus === "COMPLETED") {
          router.replace(`/payment/status?result=success&orderId=${orderId}`);
          return;
        }
        if (data?.paymentStatus === "FAILED") {
          router.replace(`/payment/status?result=failed&orderId=${orderId}`);
          return;
        }
      } catch {
        // transient network error — retry
      }
      attempts += 1;
      if (attempts < 30) setTimeout(poll, 3000);
    };

    poll();
    return () => {
      stopped = true;
    };
  }, [orderId, router]);

  return (
    <p className="text-xs text-muted-foreground mt-2">
      Checking payment status… this page updates automatically.
    </p>
  );
}