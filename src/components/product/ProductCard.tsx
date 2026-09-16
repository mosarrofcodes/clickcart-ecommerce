"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Product } from "@/types";
import WishlistButton from "@/components/product/WishlistButton";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const handleAddToCart = async () => {
    const error = await addItem(product);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Item added to cart!");
  };
  return (
    <Card className=" overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
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
        <div className="absolute top-2 right-2">
          <WishlistButton product={product} />
        </div>
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

        <p className="text-primary font-bold text-lg">${product.price}</p>

        <Button
          className="w-full"
          size="sm"
          disabled={product.stock === 0}
          onClick={handleAddToCart}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}