"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CancelOrderButton({
  orderId,
  cancellable,
}: {
  orderId: string;
  cancellable: boolean;
}) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!cancellable) return null;

  const handleCancel = async () => {
    if (!confirmed) {
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000);
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to cancel order");
        return;
      }
      toast.success("Order cancelled");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleCancel} disabled={cancelling}>
      {cancelling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {cancelling ? "Cancelling..." : confirmed ? "Click again to confirm" : "Cancel Order"}
    </Button>
  );
}