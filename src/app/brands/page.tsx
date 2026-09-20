import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getDistinctBrands } from "@/lib/product-query";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Shop by Brand | ClickCart",
  description:
    "Browse ClickCart's products by brand. Find genuine products from top international and local brands.",
  alternates: { canonical: "/brands" },
};

export default async function BrandsPage() {
  const brands = await getDistinctBrands();

  const counts = new Map<string, number>();
  if (brands.length > 0) {
    const rows = await db.product.groupBy({
      by: ["brand"],
      _count: { _all: true },
    });
    for (const row of rows) {
      if (row.brand) counts.set(row.brand, row._count._all);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Shop by Brand</h1>
      <p className="text-muted-foreground mb-8">
        {brands.length} brand{brands.length === 1 ? "" : "s"} available
      </p>

      {brands.length === 0 ? (
        <div className="border rounded-lg py-20 text-center">
          <p className="text-muted-foreground">No brands yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <Link key={brand} href={`/products?brand=${encodeURIComponent(brand)}`}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{brand}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {counts.get(brand) ?? 0} product{counts.get(brand) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}