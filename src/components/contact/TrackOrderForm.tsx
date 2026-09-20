"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency";

interface TrackResult {
  id: string;
  status: string;
  statusLabel: string;
  total: number;
  paymentMethod: string | null;
  placedAt: string;
  lastUpdated: string;
}

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function TrackOrderForm() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) {
      toast.error("Please enter your order ID and phone number.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not find your order.");
        return;
      }
      setResult(data);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = result ? STATUS_STEPS.indexOf(result.status) : -1;

  return (
    <div className="space-y-6">
      <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="orderId">Order ID</Label>
          <Input
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. clyx123abc..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PackageSearch className="w-4 h-4 mr-2" />
            )}
            Track Order
          </Button>
        </div>
      </form>

      {result && (
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">{result.statusLabel}</p>
                <p className="text-xs text-muted-foreground">Order #{result.id}</p>
              </div>
              <p className="text-primary font-bold">{formatMoney(result.total)}</p>
            </div>

            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={[
                      "w-3 h-3 rounded-full shrink-0",
                      index <= stepIndex ? "bg-primary" : "bg-muted",
                    ].join(" ")}
                  />
                  {index < STATUS_STEPS.length - 1 && (
                    <div
                      className={[
                        "h-0.5 flex-1",
                        index < stepIndex ? "bg-primary" : "bg-muted",
                      ].join(" ")}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <p>
                Placed:{" "}
                <span className="text-foreground font-medium">
                  {new Date(result.placedAt).toLocaleString()}
                </span>
              </p>
              <p>
                Last update:{" "}
                <span className="text-foreground font-medium">
                  {new Date(result.lastUpdated).toLocaleString()}
                </span>
              </p>
              <p>
                Payment:{" "}
                <span className="text-foreground font-medium capitalize">
                  {(result.paymentMethod ?? "cash on delivery").replace(/_/g, " ")}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}