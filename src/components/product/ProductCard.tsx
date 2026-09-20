"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/types";
import WishlistButton from "@/components/product/WishlistButton";
import StarRating from "@/components/product/StarRating";
import { formatMoney } from "@/lib/currency";
import { Eye, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const displayVariant = hasVariants
    ? selectedVariant ?? variants[0]
    : undefined;
  const displayPrice = displayVariant
    ? displayVariant.price
    : variants.length > 0
      ? variants[0].price
      : product.price;
  const displayStock = displayVariant
    ? displayVariant.stock
    : variants.length > 0
      ? variants.reduce((s, v) => s + v.stock, 0)
      : product.stock;
  const reviewCount = product._count?.reviews ?? 0;
  const lowStock = displayStock > 0 && displayStock <= 5;

  const handleAddToCart = async (variant?: ProductVariant) => {
    const error = await addItem(product, 1, variant);
    if (error) {
      toast.error(error);
      return;
    }
toast.success("Item added to cart!");
    useUIStore.getState().openCartDrawer();
    setQuickViewOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group relative">
        <div className="relative">
          <Link href={`/product/${product.id}`}>
            <div className="overflow-hidden rounded-t-lg">
              <Image
                src={product.image}
                alt={product.title}
                width={400}
                height={300}
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                className="w-full h-48 object-cover hover:scale-105 transition duration-300 cursor-pointer"
              />
            </div>
          </Link>
          {product.oldPrice && product.oldPrice > displayPrice && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-red-600 text-white">
                -{Math.round((1 - displayPrice / product.oldPrice) * 100)}%
              </Badge>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <WishlistButton product={product} />
          </div>
          <button
            type="button"
            aria-label={`Quick view ${product.title}`}
            onClick={() => {
              setSelectedVariant(null);
              setQuickViewOpen(true);
            }}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 border rounded-full p-2 hover:bg-primary hover:text-primary-foreground"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <CardContent className="p-4 space-y-2">
          <Badge variant="secondary" className="text-xs capitalize">
            {product.category.name}
          </Badge>

          <Link href={`/product/${product.id}`}>
            <h2 className="font-semibold text-sm line-clamp-2 hover:text-primary mt-1">
              {product.title}
            </h2>
          </Link>

          {product.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <StarRating value={product.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {product.rating.toFixed(1)}
                {reviewCount > 0 && ` (${reviewCount})`}
              </span>
            </div>
          )}

          <p className="flex items-baseline gap-2 flex-wrap">
            <span className="text-primary font-bold text-lg">
              {hasVariants
                ? `From ${formatMoney(displayPrice)}`
                : formatMoney(displayPrice)}
            </span>
            {product.oldPrice && product.oldPrice > displayPrice && (
              <span className="text-muted-foreground text-sm line-through">
                {formatMoney(product.oldPrice)}
              </span>
            )}
          </p>

          {lowStock && (
            <p className="text-xs text-amber-600 font-medium">
              Only {displayStock} left in stock
            </p>
          )}

          <Button
            className="w-full"
            size="sm"
            disabled={displayStock === 0}
            onClick={() => handleAddToCart(displayVariant)}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {displayStock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="line-clamp-1">{product.title}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="overflow-hidden rounded-lg border">
              <Image
                src={product.image}
                alt={product.title}
                width={400}
                height={300}
                className="w-full h-56 object-cover"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {product.category.name}
                </Badge>
                {product.brand && <Badge variant="outline">{product.brand}</Badge>}
              </div>

              <div className="flex items-center gap-1.5">
                <StarRating value={product.rating} size="sm" />
                <span className="text-sm text-muted-foreground">
                  {product.rating.toFixed(1)} ({reviewCount} reviews)
                </span>
              </div>

              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-bold text-primary">
                  {hasVariants && !selectedVariant
                    ? `From ${formatMoney(displayPrice)}`
                    : formatMoney(displayPrice)}
                </span>
                {product.oldPrice && product.oldPrice > displayPrice && (
                  <span className="text-muted-foreground line-through">
                    {formatMoney(product.oldPrice)}
                  </span>
                )}
              </div>

              {hasVariants && (
                <fieldset className="space-y-2">
                  <legend className="text-xs font-medium uppercase text-muted-foreground">
                    Select option
                  </legend>
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={[
                        "w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm transition-colors",
                        displayVariant?.id === v.id
                          ? "border-primary ring-1 ring-primary"
                          : "hover:border-muted-foreground",
                      ].join(" ")}
                    >
                      <span>{v.name}</span>
                      <span className="font-semibold text-primary">
                        {formatMoney(v.price)}
                      </span>
                    </button>
                  ))}
                </fieldset>
              )}

              <p
                className={`text-sm font-medium ${displayStock > 0 ? "text-green-600" : "text-red-500"}`}
              >
                {displayStock > 0
                  ? `In stock${lowStock ? ` — only ${displayStock} left` : ""}`
                  : "Out of stock"}
              </p>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  size="lg"
                  disabled={displayStock === 0}
                  onClick={() => handleAddToCart(displayVariant)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={`/product/${product.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
