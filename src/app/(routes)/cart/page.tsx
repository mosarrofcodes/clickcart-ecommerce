"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";

export default function CartPage() {
  useEffect(() => {
    document.title = "Cart | ClickCart";
  }, []);
  const { cartItems, removeFromCart, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">Your Cart is Empty 🛒</h1>
        <p className="text-muted-foreground">
          Looks like you have not added anything to your cart yet.
        </p>
        <Button>
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Your Cart 🛒</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border rounded-lg p-4"
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-20 h-20 object-cover rounded md"
              />

              <div className="flex-1 space-y-1">
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-muted-foreground text-sm">
                  Quantity:{item.quantity}
                </p>
                <p className="text-primary font-bold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFromCart(item.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        <div className="border rounded-lg p-6 h-fit space-y-4">
          <h2 className="text-xl font-bold">Order Summary</h2>

          <Separator />

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-green-500">Free</span>
          </div>

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>

          <Button className="w-full" size="lg">
            Proceed to Checkout
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
