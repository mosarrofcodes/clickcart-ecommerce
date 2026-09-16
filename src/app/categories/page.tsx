import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Categories | ClickCart",
  description:
    "Explore product categories on ClickCart — electronics, fashion, home goods and more.",
  alternates: { canonical: "/categories" },
  openGraph: {
    type: "website",
    title: "Categories | ClickCart",
    description:
      "Explore product categories on ClickCart — electronics, fashion, home goods and more.",
  },
};

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Categories</h1>
        <p className="text-muted-foreground">No categories found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      <ul className="space-y-4 text-lg font-medium">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categories/${category.slug}`}
              className="hover:text-primary hover:font-semibold cursor-pointer transition-colors"
            >
              {category.name}{" "}
              <span className="text-sm text-muted-foreground font-normal">
                ({category._count.products})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}