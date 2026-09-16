import { Suspense } from "react";
import type { Metadata } from "next";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import ProductsPagination from "@/components/product/ProductsPagination";
import { db } from "@/lib/db";
import {
  getDistinctBrands,
  getProducts,
  parseProductSearchParams,
} from "@/lib/product-query";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products | ClickCart",
  description:
    "Browse the full ClickCart catalog and filter by category, brand, price and more. Find great deals on electronics, fashion and home goods.",
  alternates: { canonical: "/products" },
  openGraph: {
    type: "website",
    title: "Products | ClickCart",
    description:
      "Browse the full ClickCart catalog and filter by category, brand, price and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Products | ClickCart",
    description:
      "Browse the full ClickCart catalog and filter by category, brand, price and more.",
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const params = parseProductSearchParams(new URLSearchParams(asRecord(sp)));

  const [result, categories, brands] = await Promise.all([
    getProducts(params),
    db.category.findMany({
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    getDistinctBrands(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Products</h1>
        <p className="text-muted-foreground mt-2">
          {result.total} product{result.total === 1 ? "" : "s"} found
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <Suspense fallback={<div className="h-64 rounded-lg border" />}>
            <ProductFilters
              categories={categories}
              brands={brands}
              key="filters"
            />
          </Suspense>
        </aside>

        <div className="lg:col-span-3 min-w-0">
          {result.products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {result.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <Suspense fallback={null}>
            <ProductsPagination page={result.page} totalPages={result.totalPages} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

function asRecord(
  sp: { [key: string]: string | string[] | undefined },
): Record<string, string> {
  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") record[key] = value;
  }
  return record;
}