"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`https://dummyjson.com/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The product you are looking for does not exist.
          </p>
          <Button className="mt-4">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <Button variant="ghost" className="mb-6">
        <Link
          href="/"
          className="flex border rounded-md px-2 py-1 items-center text-sm hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="overflow-hidden rounded-lg border">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-96 object-cover"
          />
        </div>

        <div className="space-y-4 border rounded-lg p-6">
          <Badge variant="secondary" className="capitalize">
            {product.category}
          </Badge>

          <h1 className="text-3xl font-bold">{product.title}</h1>

          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-muted-foreground text-sm">/ 5</span>
          </div>

          <Separator />

          <p className="text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>

          <p className="text-3xl font-bold text-primary">${product.price}</p>

          <p
            className={`text-sm font-medium ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}
          >
            {product.stock > 0
              ? `✅ In Stock (${product.stock} left)`
              : "❌ Out of Stock"}
          </p>

          <Button
            className="w-full"
            size="lg"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {added ? "Added to Cart! ✅" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </main>
  );
}
