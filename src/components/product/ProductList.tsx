import ProductCard from "./ProductCard";
import { db } from "@/lib/db";

interface ProductListProps {
  limit?: number;
}

export default async function ProductList({ limit = 12 }: ProductListProps) {
  const products = await db.product.findMany({
    include: {
      category: true,
      _count: { select: { reviews: true } },
      variants: { orderBy: { price: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index === 0} />
      ))}
    </div>
  );
}