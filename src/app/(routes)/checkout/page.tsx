"use client";

import { useCartStore, selectCartTotal } from "@/store/cart";
import { computeShipping } from "@/lib/store-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  CreditCard,
  Smartphone,
  Banknote,
  Ticket,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { computeEmi } from "@/lib/store-config";
import type { SiteSettings } from "@/lib/store-config";
import { SITE_SETTINGS_DEFAULTS, isInsideDhaka } from "@/lib/store-config";
import { useAuthStore } from "@/store/auth";
import type { Address } from "@/types";

interface PaymentMethod {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cash_on_delivery",
    label: "Cash on Delivery",
    desc: "Pay in cash when your order arrives",
    icon: Banknote,
  },
  {
    id: "bkash",
    label: "bKash",
    desc: "Pay with bKash via SSLCommerz gateway",
    icon: Smartphone,
  },
  {
    id: "sslcommerz",
    label: "SSLCommerz",
    desc: "Card / Net banking / Mobile banking",
    icon: CreditCard,
  },
];

export default function CheckoutPage() {
  useEffect(() => {
    document.title = "Checkout | ClickCart";
  }, []);
  const cartItems = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clearCart);
  const cartTotal = selectCartTotal(cartItems);
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    zipCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<string>(
    "cash_on_delivery",
  );
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    freeShipping: boolean;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(SITE_SETTINGS_DEFAULTS);
  const isAuthenticated = useAuthStore((s) => s.status === "authenticated");
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const autofilled = useRef(false);
  const userEdited = useRef(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  const applyAddress = useCallback((addr: Address) => {
    setSelectedAddressId(addr.id);
    setForm({
      fullName: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      district: addr.district,
      zipCode: addr.zipCode ?? "",
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || autofilled.current) return;
    fetch("/api/user/addresses")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = (data?.addresses ?? []) as Address[];
        if (list.length === 0) return;
        autofilled.current = true;
        setSavedAddresses(list);
        if (userEdited.current) return;
        const preferred = list.find((addr) => addr.isDefault) ?? list[0];
        applyAddress(preferred);
      })
      .catch(() => {});
  }, [isAuthenticated, savedAddresses, applyAddress]);

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAppliedCoupon(null);
        setCouponError(data.error ?? "Invalid coupon code.");
        return;
      }
      setAppliedCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        freeShipping: data.freeShipping,
      });
      toast.success(`Coupon ${data.code} applied!`);
    } catch {
      setCouponError("Something went wrong validating the coupon.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discount = appliedCoupon?.discountAmount ?? 0;
  const freeShipping = appliedCoupon?.freeShipping ?? false;
  const shipping = freeShipping
    ? 0
    : computeShipping(cartTotal, {
        district: form.district,
        insideDhaka: settings.shippingInsideDhaka,
        outsideDhaka: settings.shippingOutsideDhaka,
        threshold: settings.freeShippingThreshold,
      });
  const total = Math.max(0, cartTotal + shipping - discount);
  const emiInstallment = computeEmi(
    total,
    settings.emiMonths,
    settings.emiInterestRate,
  );
  const emiAvailable =
    settings.emiMonths >= 1 && total >= 5000 && emiInstallment > 0;

  const updateForm = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    userEdited.current = true;
    setForm({ ...form, [field]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!form.fullName.trim() || !form.address.trim() || !form.city.trim()) {
      toast.error("Please fill in your shipping details.");
      return;
    }
    if (!/^[0-9+\-\s]{7,}$/.test(form.phone.trim())) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    if (!form.district.trim()) {
      toast.error("Please enter your district.");
      return;
    }
    setPlacing(true);
    const address = [
      form.address.trim(),
      form.city.trim(),
      form.district.trim(),
      form.zipCode.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          city: form.city.trim(),
          district: form.district.trim(),
          phone: form.phone.trim(),
          paymentMethod,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to place order");
        return;
      }

      if (paymentMethod === "sslcommerz" || paymentMethod === "bkash") {
        const initRes = await fetch("/api/payments/sslcommerz/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.id,
            paymentMethod,
          }),
        });
        const initData = await initRes.json();
        if (!initRes.ok) {
          toast.error(initData.error ?? "Failed to start payment");
          router.push(`/orders/${data.id}`);
          return;
        }
        await clearCart();
        window.location.href = initData.gatewayPageURL;
        return;
      }

      toast.success("Order placed successfully!");
      window.location.assign(`/orders/${data.id}?placed=1`);
      setTimeout(() => {
        void clearCart();
      }, 0);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (hasHydrated && cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">Your Cart is Empty 🛒</h1>
        <p className="text-muted-foreground">
          Add some products before checking out.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold">Shipping Address</h2>
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Saved addresses
                </p>
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => applyAddress(addr)}
                    className={`w-full flex items-start gap-3 border rounded-lg p-3 text-left transition ${
                      selectedAddressId === addr.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {addr.name} — {addr.phone}
                        {addr.isDefault && (
                          <span className="ml-2 text-xs text-primary">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {addr.address}, {addr.city}, {addr.district}
                        {addr.zipCode ? `, ${addr.zipCode}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={updateForm("fullName")}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={updateForm("phone")}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={updateForm("address")}
                  placeholder="House, Road, Area"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={updateForm("city")}
                  placeholder="Dhaka"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={form.district}
                  onChange={updateForm("district")}
                  placeholder="Dhaka"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="zipCode">Postal Code (optional)</Label>
                <Input
                  id="zipCode"
                  value={form.zipCode}
                  onChange={updateForm("zipCode")}
                  placeholder="1205"
                />
              </div>
            </div>
          </section>

          <section className="border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold">Payment Method</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`w-full flex items-center gap-3 border rounded-lg p-4 text-left transition ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    } ${method.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{method.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.desc}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      disabled={method.disabled}
                      className="accent-primary"
                    />
                  </label>
                );
              })}
            </div>
          </section>

          {emiAvailable && (
            <p className="text-xs text-muted-foreground">
              EMI available: pay {formatMoney(emiInstallment)}/month for{" "}
              {settings.emiMonths} months
              {settings.emiInterestRate > 0
                ? ` at ${settings.emiInterestRate}% annual interest`
                : " at 0% interest"}{" "}
              via SSLCommerz card payments.
            </p>
          )}
        </div>

        <div className="border rounded-lg p-6 h-fit space-y-4">
          <h2 className="text-xl font-bold">Order Summary</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div
                key={`${item.id}::${item.variant?.id ?? ""}`}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <Image
                    src={item.variant?.image ?? item.image}
                    alt={item.title}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded border"
                  />
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-1">{item.title}</p>
                  {item.variant && (
                    <p className="text-xs text-muted-foreground">
                      {item.variant.name}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {formatMoney(
                    (item.variant?.price ?? item.price) * item.quantity,
                  )}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatMoney(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className={shipping === 0 ? "text-green-600" : ""}>
              {shipping === 0 ? "Free" : formatMoney(shipping)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600">-{formatMoney(discount)}</span>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Ticket className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                placeholder="Coupon code"
                className="pl-9"
                disabled={!!appliedCoupon}
              />
            </div>
            <Button
              variant="outline"
              onClick={applyCoupon}
              disabled={!!appliedCoupon || !couponInput.trim() || validatingCoupon}
            >
              {validatingCoupon ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
          {appliedCoupon && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600">
                Coupon &quot;{appliedCoupon.code}&quot; applied
                {appliedCoupon.freeShipping
                  ? " — free shipping"
                  : ` — ${formatMoney(appliedCoupon.discountAmount)} off`}
              </span>
              <button
                type="button"
                className="text-muted-foreground underline hover:text-foreground"
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponInput("");
                }}
              >
                Remove
              </button>
            </div>
          )}
          {couponError && (
            <p className="text-xs text-red-500">{couponError}</p>
          )}

          {cartTotal < settings.freeShippingThreshold &&
            shipping > 0 &&
            isInsideDhaka(form.district) && (
              <p className="text-xs text-muted-foreground">
                Add{" "}
                {formatMoney(settings.freeShippingThreshold - cartTotal)} more for
                free shipping!
              </p>
            )}

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={placing}
            onClick={handlePlaceOrder}
          >
            {placing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Placing Order...
              </>
            ) : (
              "Place Order"
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}