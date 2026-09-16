"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUS_STEPS, STATUS_COLORS, type OrderStatus } from "@/lib/order-status";

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  async function update(next: OrderStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update status");
      toast.success(`Order marked as ${next}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${STATUS_COLORS[status]}`}>
        {status}
      </span>
      {status !== "CANCELLED" && (
        <Select value={status} onValueChange={(value: string | null) => update((value ?? status) as OrderStatus)}>
          <SelectTrigger aria-label="Update order status">
            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUS_STEPS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export function PrintButton({ label = "Print Label" }: { label?: string }) {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()}>
      <Printer className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}