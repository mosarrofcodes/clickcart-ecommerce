"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import type { Product, ProductVariant } from "@/types";

export default function AddToCartButton({
  product,
  variant,
}: {
  product: Product;
  variant?: ProductVariant;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const available = variant ? variant.stock : product.stock;

  const handleAddToCart = async () => {
    const error = await addItem(product, 1, variant);
    if (error) {
      toast.error(error);
      return;
    }
    setAdded(true);
    useUIStore.getState().openCartDrawer();
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleAddToCart}
      disabled={available === 0}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {available === 0
        ? "Out of Stock"
        : added
          ? "Added to Cart! ✅"
          : "Add to Cart"}
    </Button>
  );
}