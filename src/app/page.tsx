import { Suspense } from "react";
import type { Metadata } from "next";
import ProductList from "@/components/product/ProductList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ClickCart - Trusted Online Shopping Platform",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "ClickCart - Trusted Online Shopping Platform",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "ClickCart - Trusted Online Shopping Platform",
    description: SITE_DESCRIPTION,
  },
};

function ProductGridFallback() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-72 rounded-lg border animate-pulse bg-muted"
        />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to ClickCart</h1>
        <p className="text-muted-foreground text-lg">
          Trusted online shopping platform
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <Button variant="outline">
          <Link href="/products">View All</Link>
        </Button>
      </div>

      <Suspense fallback={<ProductGridFallback />}>
        <ProductList limit={8} />
      </Suspense>
    </main>
  );
}