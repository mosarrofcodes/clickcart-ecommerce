"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function WishlistPage() {
  useEffect(() => {
    document.title = "Wishlist | ClickCart";
  }, []);

  const items = useWishlistStore((s) => s.items);
  const hasHydrated = useWishlistStore((s) => s.hasHydrated);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);

  if (hasHydrated && items.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center gap-4 text-center">
        <Heart className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-3xl font-bold">Your Wishlist is Empty</h1>
        <p className="text-muted-foreground">
          Save the products you love and come back to them anytime.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </main>
    );
  }

  const handleRemove = async (productId: string) => {
    await removeItem(productId);
    toast.success("Removed from wishlist");
  };

  const handleAddToCart = async (index: number) => {
    const product = items[index];
    const error = await addToCart(product);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Item added to cart!");
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        Your Wishlist
        <span className="text-muted-foreground text-base font-normal">
          ({items.length})
        </span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((product, index) => (
          <Card key={product.id} className="overflow-hidden">
            <Link href={`/product/${product.id}`}>
              <div className="overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={400}
                  height={300}
                  className="w-full h-44 object-cover hover:scale-105 transition duration-300 cursor-pointer"
                />
              </div>
            </Link>
            <CardContent className="p-4 space-y-2">
              <Link href={`/product/${product.id}`}>
                <h2 className="font-semibold text-sm line-clamp-2 hover:text-primary">
                  {product.title}
                </h2>
              </Link>
              <p className="text-primary font-bold">${product.price}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={product.stock === 0}
                  onClick={() => handleAddToCart(index)}
                >
                  {product.stock === 0 ? (
                    "Out of Stock"
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Remove from wishlist"
                  onClick={() => handleRemove(product.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}