"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/wishlist";
import { toast } from "sonner";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

export default function WishlistButton({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const items = useWishlistStore((s) => s.items);
  const addItem = useWishlistStore((s) => s.addItem);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const active = items.some((item) => item.id === product.id);

  const handleToggle = async () => {
    if (active) {
      await removeItem(product.id);
      toast.success("Removed from wishlist");
    } else {
      await addItem(product);
      toast.success("Added to wishlist");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn("bg-background/90 hover:bg-background", className)}
      onClick={handleToggle}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-colors",
          active && "fill-red-500 text-red-500",
        )}
      />
    </Button>
  );
}