"use client";

import { useCartStore, selectCartTotal } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
} from "@/lib/cart-service";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Heart, Minus, Plus, Ticket } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

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

  const freeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = freeShipping ? 0 : SHIPPING_COST;
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

  const handleRemove = async (productId: string) => {
    const error = await removeItem(productId);
    if (error) toast.error(error);
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    const error = await updateQuantity(productId, quantity);
    if (error) toast.error(error);
  };

  const handleMoveToWishlist = async (item: (typeof cartItems)[number]) => {
    await addToWishlist(item);
    const error = await removeItem(item.id);
    if (error) toast.error(error);
    else toast.success("Moved to Wishlist");
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Your Cart 🛒</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const atStock = item.quantity >= item.stock;
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 border rounded-lg p-4"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded md"
                />

                <div className="flex-1 space-y-1">
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-muted-foreground text-sm">
                    ${item.price} each
                  </p>
                  {atStock && (
                    <p className="text-xs text-amber-600 font-medium">
                      Only {item.stock} in stock
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
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
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-primary font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
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
                    <Button variant="ghost" size="icon-sm" onClick={() => handleRemove(item.id)}>
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
            <span>${cartTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className={freeShipping ? "text-green-500" : ""}>
              {freeShipping ? "Free" : `$${shipping.toFixed(2)}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Ticket className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Use coupon codes at checkout for extra savings
            </span>
          </div>

          {!freeShipping && (
            <p className="text-xs text-muted-foreground">
              Add ${(FREE_SHIPPING_THRESHOLD - cartTotal).toFixed(2)} more to get
              free shipping!
            </p>
          )}

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
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