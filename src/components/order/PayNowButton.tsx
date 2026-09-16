"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

export default function PayNowButton({
  orderId,
  payable,
}: {
  orderId: string;
  payable: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);

  if (!payable) return null;

  const handlePay = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/sslcommerz/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to start payment");
        return;
      }
      window.location.href = data.gatewayPageURL;
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Button onClick={handlePay} disabled={submitting}>
      {submitting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4 mr-2" />
      )}
      {submitting ? "Redirecting..." : "Pay Now"}
    </Button>
  );
}