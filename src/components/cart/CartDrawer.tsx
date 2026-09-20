"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore, selectCartCount, selectCartTotal } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Drawer, DrawerHeader, DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Heart, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/currency";

export default function CartDrawer() {
  const open = useUIStore((s) => s.cartDrawerOpen);
  const setOpen = useUIStore((s) => s.setCartDrawerOpen);
  const closeCartDrawer = useUIStore((s) => s.closeCartDrawer);
  const cartItems = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const cartCount = selectCartCount(cartItems);
  const cartTotal = selectCartTotal(cartItems);

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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerHeader>
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold text-lg">Shopping Cart</span>
          <span className="text-sm text-muted-foreground">({cartCount})</span>
        </div>
        <DrawerClose onClick={closeCartDrawer} />
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {hasHydrated && cartItems.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <p className="text-4xl">🛒</p>
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground text-pretty">
              Looks like you have not added anything yet.
            </p>
            <Button asChild className="mt-2" onClick={closeCartDrawer}>
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        )}

        {cartItems.map((item) => {
          const lineKey = `${item.id}::${item.variant?.id ?? ""}`;
          const stock = item.variant?.stock ?? item.stock;
          const price = item.variant?.price ?? item.price;
          const atStock = item.quantity >= stock;
          return (
            <div key={lineKey} className="flex gap-3 border rounded-lg p-3">
              <Link href={`/product/${item.id}`} onClick={closeCartDrawer}>
                <Image
                  src={item.variant?.image ?? item.image}
                  alt={item.title}
                  width={72}
                  height={72}
                  className="w-[72px] h-[72px] object-cover rounded-md bg-muted"
                />
              </Link>
              <div className="flex-1 min-w-0 space-y-1">
                <Link
                  href={`/product/${item.id}`}
                  onClick={closeCartDrawer}
                  className="font-medium text-sm line-clamp-2 hover:text-primary"
                >
                  {item.title}
                </Link>
                {item.variant && (
                  <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                )}
                <p className="text-sm font-semibold">{formatMoney(price * item.quantity)}</p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    disabled={item.quantity <= 1}
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity - 1, item.variant?.id)
                    }
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    disabled={atStock}
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity + 1, item.variant?.id)
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Move to wishlist"
                  onClick={() => handleMoveToWishlist(item)}
                >
                  <Heart className="w-4 h-4 text-red-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove"
                  onClick={() => handleRemove(item.id, item.variant?.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {hasHydrated && cartItems.length > 0 && (
        <DrawerFooter>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatMoney(cartTotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping & coupon codes calculated at checkout.
            </p>
          </div>
          <Separator />
          <Button className="w-full" size="lg" asChild>
            <Link href="/checkout" onClick={closeCartDrawer}>
              Proceed to Checkout
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/cart" onClick={closeCartDrawer}>
              View Full Cart
            </Link>
          </Button>
        </DrawerFooter>
      )}
    </Drawer>
  );
}