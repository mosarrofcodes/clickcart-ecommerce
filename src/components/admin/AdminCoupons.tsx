"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { COUPON_TYPE_LABELS } from "@/lib/coupon-service";
import type { Coupon, CouponType } from "@prisma/client";

interface AdminCoupon extends Coupon {
  _count: { orders: number };
}

type CouponForm = {
  code: string;
  type: CouponType;
  value: string;
  minOrder: string;
  maxDiscount: string;
  usageLimit: string;
  validFrom: string;
  validUntil: string;
  onePerUser: boolean;
  active: boolean;
};

const emptyForm: CouponForm = {
  code: "",
  type: "PERCENT",
  value: "",
  minOrder: "",
  maxDiscount: "",
  usageLimit: "",
  validFrom: "",
  validUntil: "",
  onePerUser: false,
  active: true,
};

function toForm(coupon: AdminCoupon): CouponForm {
  return {
    code: coupon.code,
    type: coupon.type,
    value: String(coupon.value),
    minOrder: coupon.minOrder > 0 ? String(coupon.minOrder) : "",
    maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
    usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
    validFrom: coupon.validFrom
      ? new Date(coupon.validFrom).toISOString().slice(0, 10)
      : "",
    validUntil: coupon.validUntil
      ? new Date(coupon.validUntil).toISOString().slice(0, 10)
      : "",
    onePerUser: coupon.onePerUser,
    active: coupon.active,
  };
}

function describeValue(coupon: Pick<Coupon, "type" | "value">) {
  if (coupon.type === "PERCENT") return `${coupon.value}% off`;
  if (coupon.type === "FIXED") return `$${coupon.value.toFixed(2)} off`;
  return "Free shipping";
}

export default function AdminCoupons({
  coupons,
}: {
  coupons: AdminCoupon[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);

  const dialogTitle = editing ? "Edit Coupon" : "New Coupon";

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (coupon: AdminCoupon) => {
    setEditing(coupon);
    setForm(toForm(coupon));
    setOpen(true);
  };

  const payload = useMemo(
    () => ({
      code: form.code.trim(),
      type: form.type,
      value: form.value === "" ? null : Number(form.value),
      minOrder: form.minOrder === "" ? 0 : Number(form.minOrder),
      maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),
      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
      validFrom: form.validFrom || null,
      validUntil: form.validUntil || null,
      onePerUser: form.onePerUser,
      active: form.active,
    }),
    [form],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.code) return toast.error("Coupon code is required");
    if (payload.value == null || payload.value < 0) {
      return toast.error("Value must be a non-negative number");
    }

    setSaving(true);
    try {
      const url = editing ? `/api/coupons/${editing.id}` : "/api/coupons";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save coupon");
      toast.success(editing ? "Coupon updated" : "Coupon created");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon: AdminCoupon) => {
    setTogglingId(coupon.id);
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update coupon");
      toast.success(coupon.active ? "Coupon disabled" : "Coupon enabled");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update coupon");
    } finally {
      setTogglingId(null);
    }
  };

  const remove = async (coupon: AdminCoupon) => {
    if (confirmId !== coupon.id) {
      setConfirmId(coupon.id);
      return;
    }
    setConfirmId(null);
    const res = await fetch(`/api/coupons/${coupon.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to delete coupon");
      return;
    }
    toast.success("Coupon deleted");
    router.refresh();
  };

  const formatDate = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {coupons.length} coupon{coupons.length === 1 ? "" : "s"}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" onClick={openCreate} />}>
            <Plus className="mr-2 h-4 w-4" />
            New Coupon
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <form onSubmit={submit}>
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>
                  Coupons give customers discounts at checkout.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="cp-code">Code</Label>
                  <Input
                    id="cp-code"
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value }))
                    }
                    placeholder="SAVE10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) =>
                      setForm((f) => ({
                        ...f,
                        type: (value ?? f.type) as CouponType,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.keys(COUPON_TYPE_LABELS) as CouponType[]
                      ).map((t) => (
                        <SelectItem key={t} value={t}>
                          {COUPON_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cp-value">Value</Label>
                  <Input
                    id="cp-value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.value}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, value: e.target.value }))
                    }
                    placeholder={
                      form.type === "PERCENT" ? "10" : form.type === "FIXED" ? "5.00" : "0"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cp-min">Minimum order ($)</Label>
                  <Input
                    id="cp-min"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minOrder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, minOrder: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cp-max">Max discount ($)</Label>
                  <Input
                    id="cp-max"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.maxDiscount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maxDiscount: e.target.value }))
                    }
                    placeholder="None"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cp-limit">Usage limit</Label>
                  <Input
                    id="cp-limit"
                    type="number"
                    min="1"
                    step="1"
                    value={form.usageLimit}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, usageLimit: e.target.value }))
                    }
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cp-from">Valid from</Label>
                  <Input
                    id="cp-from"
                    type="date"
                    value={form.validFrom}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, validFrom: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cp-until">Valid until</Label>
                  <Input
                    id="cp-until"
                    type="date"
                    value={form.validUntil}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, validUntil: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between py-1">
                    <div className="space-y-0.5">
                      <Label htmlFor="cp-ope" className="cursor-pointer">
                        One use per customer
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Each customer can use this coupon once
                      </p>
                    </div>
                    <input
                      id="cp-ope"
                      type="checkbox"
                      checked={form.onePerUser}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, onePerUser: e.target.checked }))
                      }
                      className="w-4 h-4 accent-primary"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? "Save Changes" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="border rounded-lg p-4 bg-background flex flex-wrap items-center gap-3"
          >
            <div className="flex-1 min-w-40">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{c.code}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {COUPON_TYPE_LABELS[c.type]}
                </span>
                {c.onePerUser && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    1/customer
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {describeValue(c)}
                {c.minOrder > 0 && ` • min $${c.minOrder.toFixed(2)}`} •{" "}
                {c.timesUsed}
                {c.usageLimit != null ? `/${c.usageLimit}` : ""} used •{" "}
                {c._count.orders} order{c._count.orders === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Valid: {formatDate(c.validFrom)} → {formatDate(c.validUntil)}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={togglingId === c.id}
              onClick={() => toggleActive(c)}
              title={c.active ? "Disable coupon" : "Enable coupon"}
            >
              {togglingId === c.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              <span
                className={`ml-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  c.active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {c.active ? "Active" : "Inactive"}
              </span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
              Edit
            </Button>
            <Button
              variant={confirmId === c.id ? "destructive" : "ghost"}
              size="sm"
              aria-label={
                confirmId === c.id
                  ? `Confirm delete ${c.code}`
                  : `Delete ${c.code}`
              }
              onClick={() => remove(c)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {coupons.length === 0 && (
          <p className="text-sm text-muted-foreground border rounded-lg p-6 text-center">
            No coupons yet. Create your first one to start offering discounts.
          </p>
        )}
      </div>
    </div>
  );
}