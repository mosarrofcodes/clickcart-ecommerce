"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    const error = await addItem(product);
    if (error) {
      toast.error(error);
      return;
    }
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleAddToCart}
      disabled={product.stock === 0}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {product.stock === 0
        ? "Out of Stock"
        : added
          ? "Added to Cart! ✅"
          : "Add to Cart"}
    </Button>
  );
}