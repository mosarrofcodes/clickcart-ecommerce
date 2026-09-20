import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import ProductList from "@/components/product/ProductList";
import ProductCard from "@/components/product/ProductCard";
import PromoBanner from "@/components/layout/PromoBanner";
import RecentlyViewedProducts from "@/components/product/RecentlyViewedProducts";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ClickCart - Trusted Online Shopping Platform in Bangladesh",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "ClickCart - Trusted Online Shopping Platform in Bangladesh",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "ClickCart - Trusted Online Shopping Platform in Bangladesh",
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

const TRUST_ITEMS = [
  { icon: Truck, title: "Fast Delivery", desc: "Nationwide shipping" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "SSLCommerz encrypted" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "We're here to help" },
];

export default async function Home() {
  const [categories, deals] = await Promise.all([
    db.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
      take: 6,
    }),
    db.product.findMany({
      where: { oldPrice: { not: null } },
      include: {
        category: true,
        _count: { select: { reviews: true } },
        variants: { orderBy: { price: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 space-y-14">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-primary-foreground px-8 py-14 md:py-20 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="inline-block text-xs font-semibold bg-primary-foreground/20 rounded-full px-3 py-1 mb-4">
            Trusted by thousands across Bangladesh
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Everything you need, delivered to your door
          </h1>
          <p className="text-primary-foreground/90 mb-8 md:text-lg">
            Shop electronics, fashion, home essentials and more at great prices
            with fast delivery and secure payment.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-primary font-semibold"
            >
              <Link href="/products">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/offers">View Offers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-center gap-3 border rounded-xl p-4 bg-card"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{title}</p>
              <p className="text-xs text-muted-foreground truncate">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Promo banners */}
      <PromoBanner />

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Link
              href="/categories"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group border rounded-xl overflow-hidden hover:border-primary hover:shadow-sm transition-all bg-card"
              >
                {category.image ? (
                  <div className="relative h-24">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="200px"
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary/50">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="p-3 text-center">
                  <p className="font-medium line-clamp-1">{category.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category._count.products} items
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Deals */}
      {deals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Today&apos;s Deals</h2>
            <Link
              href="/offers"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              View all offers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {deals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Button asChild variant="outline">
            <Link href="/products">View All</Link>
          </Button>
        </div>
        <Suspense fallback={<ProductGridFallback />}>
          <ProductList limit={8} />
        </Suspense>
      </section>

      {/* Recently viewed */}
      <Suspense fallback={null}>
        <RecentlyViewedProducts />
      </Suspense>
    </main>
  );
}
