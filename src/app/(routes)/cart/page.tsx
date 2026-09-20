"use client";

import { useCartStore, selectCartTotal } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { computeShipping } from "@/lib/store-config";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Heart, Minus, Plus, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/currency";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/store-config";
import type { SiteSettings } from "@/lib/store-config";

export default function CartPage() {
  useEffect(() => {
    document.title = "Cart | ClickCart";
  }, []);
  const cartItems = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const cartTotal = selectCartTotal(cartItems);
  const [settings, setSettings] = useState<SiteSettings>(SITE_SETTINGS_DEFAULTS);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  const shipping = computeShipping(cartTotal, {
    insideDhaka: settings.shippingInsideDhaka,
    outsideDhaka: settings.shippingOutsideDhaka,
    threshold: settings.freeShippingThreshold,
  });
  const total = Math.max(0, cartTotal + shipping);

  if (hasHydrated && cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">Your Cart is Empty 🛒</h1>
        <p className="text-muted-foreground">
          Looks like you have not added anything to your cart yet.
        </p>
        <Button asChild>
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  const handleRemove = async (productId: string, variantId?: string | null) => {
    const error = await removeItem(productId, variantId);
    if (error) toast.error(error);
  };

  const handleUpdateQuantity = async (
    productId: string,
    quantity: number,
    variantId?: string | null,
  ) => {
    const error = await updateQuantity(productId, quantity, variantId);
    if (error) toast.error(error);
  };

  const handleMoveToWishlist = async (item: (typeof cartItems)[number]) => {
    await addToWishlist(item);
    const error = await removeItem(item.id, item.variant?.id);
    if (error) toast.error(error);
    else toast.success("Moved to Wishlist");
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Your Cart 🛒</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const lineKey = `${item.id}::${item.variant?.id ?? ""}`;
            const stock = item.variant?.stock ?? item.stock;
            const price = item.variant?.price ?? item.price;
            const atStock = item.quantity >= stock;
            return (
              <div
                key={lineKey}
                className="flex items-center gap-4 border rounded-lg p-4"
              >
                <Image
                  src={item.variant?.image ?? item.image}
                  alt={item.title}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded md"
                />

                <div className="flex-1 space-y-1">
                  <h2 className="font-semibold">{item.title}</h2>
                  {item.variant && (
                    <p className="text-muted-foreground text-sm">
                      {item.variant.name}
                    </p>
                  )}
                  <p className="text-muted-foreground text-sm">
                    {formatMoney(price)} each
                  </p>
                  {atStock && (
                    <p className="text-xs text-amber-600 font-medium">
                      Only {stock} in stock
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        handleUpdateQuantity(
                          item.id,
                          item.quantity - 1,
                          item.variant?.id,
                        )
                      }
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      disabled={atStock}
                      onClick={() =>
                        handleUpdateQuantity(
                          item.id,
                          item.quantity + 1,
                          item.variant?.id,
                        )
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-primary font-bold">
                    {formatMoney(price * item.quantity)}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveToWishlist(item)}
                    >
                      <Heart className="w-4 h-4 mr-1 text-red-500" />
                      Wishlist
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemove(item.id, item.variant?.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border rounded-lg p-6 h-fit space-y-4">
          <h2 className="text-xl font-bold">Order Summary</h2>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatMoney(cartTotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className={shipping === 0 ? "text-green-500" : ""}>
              {shipping === 0 ? "Free" : formatMoney(shipping)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Ticket className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Use coupon codes at checkout for extra savings
            </span>
          </div>

          {shipping > 0 ? (
            <div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (cartTotal / Math.max(1, settings.freeShippingThreshold)) *
                          100,
                      ),
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Add {formatMoney(settings.freeShippingThreshold - cartTotal)} more
                to get free delivery within Dhaka!
              </p>
            </div>
          ) : (
            <p className="text-xs text-green-600 font-medium">
              🎉 You&apos;ve unlocked free delivery!
            </p>
          )}

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>

          <Button className="w-full" size="lg" asChild>
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}