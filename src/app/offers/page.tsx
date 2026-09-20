import type { Metadata } from "next";
import { db } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Special Offers & Deals | ClickCart",
  description:
    "Current discounts and special deals across ClickCart. Grab today's best prices on electronics, fashion and more.",
  alternates: { canonical: "/offers" },
};

export default async function OffersPage() {
  const deals = await db.product.findMany({
    where: {
      oldPrice: { not: null },
      AND: [{ stock: { gt: 0 } }],
    },
    include: { category: true },
    orderBy: { price: "asc" },
    take: 60,
  });

  const withDiscount = deals
    .filter((p) => p.oldPrice != null && p.oldPrice > p.price)
    .sort(
      (a, b) =>
        (a.oldPrice! - a.price) / a.oldPrice! - (b.oldPrice! - b.price) / b.oldPrice!,
    );

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Special Offers</h1>
          <Badge className="bg-red-600 text-white">{withDiscount.length} deals live</Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          Hand-picked discounts updated regularly. Limited time offers — while
          stock lasts.
        </p>
      </div>

      {withDiscount.length === 0 ? (
        <div className="border rounded-lg py-20 text-center">
          <p className="text-lg font-medium">No active offers right now</p>
          <p className="text-muted-foreground text-sm mt-1">
            Check back soon — new deals are added often.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {withDiscount.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}