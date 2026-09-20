"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRecentlyViewedStore } from "@/store/recentlyViewed";
import ProductCard from "@/components/product/ProductCard";

export default function RecentlyViewedProducts() {
  const items = useRecentlyViewedStore((s) => s.items);

  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Recently Viewed</h2>
        <Link
          href="/products"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          Browse more <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}