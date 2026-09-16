import { Suspense } from "react";
import type { Metadata } from "next";
import ProductCard from "@/components/product/ProductCard";
import ProductsPagination from "@/components/product/ProductsPagination";
import SearchControls from "@/components/search/SearchControls";
import { getProducts, parseProductSearchParams } from "@/lib/product-query";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search | ClickCart",
  description:
    "Search the ClickCart catalog for products by keyword, category, brand or price.",
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    title: "Search | ClickCart",
    description:
      "Search the ClickCart catalog for products by keyword, category, brand or price.",
  },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q.trim() : "";

  const result = await getProducts(
    parseProductSearchParams(
      new URLSearchParams(entryRecord(sp)),
    ),
  );

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Search results for:{" "}
            <span className="text-primary">&quot;{query}&quot;</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {result.total} product{result.total === 1 ? "" : "s"} found
          </p>
        </div>
        <Suspense fallback={null}>
          <SearchControls />
        </Suspense>
      </div>

      {result.products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            No products found for &quot;{query}&quot;.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {result.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Suspense fallback={null}>
        <ProductsPagination page={result.page} totalPages={result.totalPages} />
      </Suspense>
    </main>
  );
}

function entryRecord(
  sp: { [key: string]: string | string[] | undefined },
): Record<string, string> {
  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") record[key] = value;
  }
  return record;
}