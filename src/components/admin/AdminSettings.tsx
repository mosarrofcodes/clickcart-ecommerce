"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { SiteSettings } from "@/lib/site-settings";

interface Props {
  settings: SiteSettings;
  pendingOrders: number;
}

type FormState = Record<string, string>;

function toForm(s: SiteSettings): FormState {
  return {
    storeName: s.storeName,
    tagline: s.tagline,
    hotline: s.hotline,
    supportEmail: s.supportEmail,
    announcement: s.announcement,
    shippingInsideDhaka: String(s.shippingInsideDhaka),
    shippingOutsideDhaka: String(s.shippingOutsideDhaka),
    freeShippingThreshold: String(s.freeShippingThreshold),
    codMaxAmount: String(s.codMaxAmount),
    emiMonths: String(s.emiMonths),
    emiInterestRate: String(s.emiInterestRate),
    deliveryEstimateInside: s.deliveryEstimateInside,
    deliveryEstimateOutside: s.deliveryEstimateOutside,
  };
}

export default function AdminSettings({ settings, pendingOrders }: Props) {
  const [form, setForm] = useState<FormState>(toForm(settings));
  const [codEnabled, setCodEnabled] = useState(settings.codEnabled);
  const [saving, setSaving] = useState(false);

  const update = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    const numbers = [
      "shippingInsideDhaka",
      "shippingOutsideDhaka",
      "freeShippingThreshold",
      "codMaxAmount",
      "emiMonths",
      "emiInterestRate",
    ];
    for (const key of numbers) {
      const num = Number(form[key]);
      if (!Number.isFinite(num) || num < 0) {
        toast.error(`"${key}" must be a valid number.`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          codEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save settings");
        return;
      }
      toast.success("Settings saved");
    } catch {
      toast.error("Something went wrong saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Store Settings</h2>
        <p className="text-sm text-muted-foreground">
          These control the live storefront — shipping, cash on delivery,
          hotline and announcements.
        </p>
      </div>

      <section className="border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold">Store Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="storeName">Store name</Label>
            <Input id="storeName" value={form.storeName} onChange={update("storeName")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hotline">Hotline</Label>
            <Input id="hotline" value={form.hotline} onChange={update("hotline")} placeholder="+880 1XXX-XXXXXX" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={form.tagline} onChange={update("tagline")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="supportEmail">Support email</Label>
            <Input id="supportEmail" type="email" value={form.supportEmail} onChange={update("supportEmail")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="announcement">Announcement bar text</Label>
            <Input id="announcement" value={form.announcement} onChange={update("announcement")} />
          </div>
        </div>
      </section>

      <section className="border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold">Shipping & Delivery</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="shippingInsideDhaka">Shipping — inside Dhaka (৳)</Label>
            <Input id="shippingInsideDhaka" inputMode="decimal" value={form.shippingInsideDhaka} onChange={update("shippingInsideDhaka")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shippingOutsideDhaka">Shipping — outside Dhaka (৳)</Label>
            <Input id="shippingOutsideDhaka" inputMode="decimal" value={form.shippingOutsideDhaka} onChange={update("shippingOutsideDhaka")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="freeShippingThreshold">Free delivery threshold (৳)</Label>
            <Input id="freeShippingThreshold" inputMode="decimal" value={form.freeShippingThreshold} onChange={update("freeShippingThreshold")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deliveryEstimateInside">Estimate — inside Dhaka</Label>
            <Input id="deliveryEstimateInside" value={form.deliveryEstimateInside} onChange={update("deliveryEstimateInside")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deliveryEstimateOutside">Estimate — outside Dhaka</Label>
            <Input id="deliveryEstimateOutside" value={form.deliveryEstimateOutside} onChange={update("deliveryEstimateOutside")} />
          </div>
        </div>
      </section>

      <section className="border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold">EMI (Installments)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="emiMonths">EMI tenure (months)</Label>
            <Input id="emiMonths" type="number" min="1" value={form.emiMonths} onChange={update("emiMonths")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emiInterestRate">Annual interest rate (%)</Label>
            <Input id="emiInterestRate" type="number" min="0" step="0.01" value={form.emiInterestRate} onChange={update("emiInterestRate")} placeholder="0 = 0% EMI" />
          </div>
        </div>
      </section>

      <section className="border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold">Cash on Delivery</h3>
        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <span className="text-sm">
            Accept Cash on Delivery
            <span className="block text-muted-foreground text-xs">
              Disable to force online payment only.
            </span>
          </span>
          <input
            type="checkbox"
            checked={codEnabled}
            onChange={(e) => setCodEnabled(e.target.checked)}
            className="accent-primary w-5 h-5"
          />
        </label>
        <div className="space-y-1.5">
          <Label htmlFor="codMaxAmount">Max COD order amount (৳)</Label>
          <Input id="codMaxAmount" inputMode="decimal" value={form.codMaxAmount} onChange={update("codMaxAmount")} />
        </div>
      </section>

      {pendingOrders > 0 && (
        <p className="text-xs text-muted-foreground">
          {pendingOrders} order(s) are currently PENDING payment. Payment
          settings are configured under SSLCommerz env variables, not here.
        </p>
      )}

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}