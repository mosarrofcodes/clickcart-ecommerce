"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_COLORS, ORDER_STATUS_STEPS, type OrderStatus } from "@/lib/order-status";
import { formatMoney } from "@/lib/currency";

interface AdminOrder {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string | Date;
  itemCount: number;
  previewImage: string | null;
  previewTitle: string | null;
  user: { name: string } | null;
  paymentMethod: string;
}

const ALL_STATUSES: (OrderStatus | "ALL")[] = ["ALL", ...ORDER_STATUS_STEPS, "CANCELLED"];

export default function AdminOrdersTable({
  orders,
  currentStatus,
}: {
  orders: AdminOrder[];
  currentStatus: string;
}) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: OrderStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update status");
      toast.success(`Order marked as ${status}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">{orders.length} order(s)</p>
        <Select
          value={currentStatus}
          onValueChange={(value: string | null) => {
            const next = value ?? "ALL";
            router.push(next === "ALL" ? "/admin/orders" : `/admin/orders?status=${next}`);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3">
                      {o.previewImage ? (
                        <Image
                          src={o.previewImage}
                          alt=""
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded border bg-muted" />
                      )}
                      <div>
                        <p className="font-medium">
                          #...{o.id.slice(-6)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(o.createdAt).toLocaleDateString()} · {o.itemCount} item(s)
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {o.user ? (
                      <span className="line-clamp-1">{o.user.name}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.paymentMethod}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatMoney(o.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status]}`}
                      >
                        {o.status}
                      </span>
                      {o.status === "CANCELLED" ? null : (
                        <Select
                          value={o.status}
                          onValueChange={(value: string | null) => updateStatus(o.id, (value ?? o.status) as OrderStatus)}
                        >
                          <SelectTrigger size="sm" aria-label="Update status">
                            {updatingId === o.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}