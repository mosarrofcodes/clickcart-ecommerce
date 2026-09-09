import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  return (
    <Card className=" overflow-hidden hover:shadow-lg transition-shadow duration-300 ">
      <Link href={`/product/${product.id}`}>
        <div className="overflow-hidden rounded-t-lg">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-48 object-cover hover:scale-105 transition duration-300 cursor-pointer"
          />
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        <Badge variant="secondary" className="text-xs capitalize">
          {product.category}
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
          onClick={() => {
            addToCart(product);
            toast.success("Item added to cart!");
          }}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
