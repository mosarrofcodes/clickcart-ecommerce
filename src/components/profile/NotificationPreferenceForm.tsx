"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, BellRing } from "lucide-react";

interface Preference {
  emailOrderUpdates: boolean;
  emailPayment: boolean;
  emailMarketing: boolean;
  inAppEnabled: boolean;
}

const FIELDS: {
  key: keyof Preference;
  label: string;
  desc: string;
}[] = [
  {
    key: "emailOrderUpdates",
    label: "Order status emails",
    desc: "Order confirmation, shipping and delivery updates by email.",
  },
  {
    key: "emailPayment",
    label: "Payment confirmation emails",
    desc: "Payment receipts when your payment is confirmed.",
  },
  {
    key: "inAppEnabled",
    label: "In-app notifications",
    desc: "Show notification bell alerts for order and product updates.",
  },
  {
    key: "emailMarketing",
    label: "Marketing emails",
    desc: "Occasional promotions and offers from ClickCart.",
  },
];

export default function NotificationPreferenceForm() {
  const [pref, setPref] = useState<Preference | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/notification-preference")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object" && "emailOrderUpdates" in data) {
          setPref({
            emailOrderUpdates: data.emailOrderUpdates,
            emailPayment: data.emailPayment,
            emailMarketing: data.emailMarketing,
            inAppEnabled: data.inAppEnabled,
          });
        }
      })
      .catch(() => toast.error("Failed to load notification preferences"));
  }, []);

  const toggle = async (key: keyof Preference, value: boolean) => {
    if (!pref) return;
    const next = { ...pref, [key]: value };
    setPref(next);
    setSaving(true);
    try {
      const res = await fetch("/api/user/notification-preference", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        toast.error("Failed to save preference");
        setPref(pref);
      }
    } catch {
      toast.error("Failed to save preference");
      setPref(pref);
    } finally {
      setSaving(false);
    }
  };

  if (!pref) {
    return (
      <div className="border rounded-lg p-6 flex items-center gap-3 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading notification preferences...
      </div>
    );
  }

  return (
    <section className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Notification Preferences</h2>
        </div>
        {saving && <span className="text-xs text-muted-foreground">Saving...</span>}
      </div>

      <div className="space-y-3">
        {FIELDS.map((field) => (
          <label
            key={field.key}
            className="flex items-start gap-3 cursor-pointer rounded-lg border p-4 hover:bg-muted/40 transition-colors"
          >
            <input
              type="checkbox"
              className="mt-1 accent-primary"
              checked={pref[field.key]}
              onChange={(e) => void toggle(field.key, e.target.checked)}
            />
            <span>
              <span className="block text-sm font-medium">{field.label}</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                {field.desc}
              </span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}