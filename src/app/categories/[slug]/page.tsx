import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/ProductCard";
import { db } from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await db.category.findMany({ select: { slug: true } });
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });

  if (!category) {
    return { title: "Category | ClickCart" };
  }

  const title = `${category.name} | ClickCart`;
  const description = category.description
    ? `${category.description} Shop ${category.name} products at ClickCart.`
    : `Shop ${category.name} products at ClickCart.`;

  return {
    title,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/categories/${category.slug}`,
    },
  };
}

export default async function CategoryProductsPage({ params }: PageProps) {
  const { slug } = await params;

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      products: {
        include: { category: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/categories" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-2">{category.description}</p>
        )}
        <p className="text-muted-foreground mt-2">
          {category.products.length} products found in this category.
        </p>
      </div>

      {category.products.length === 0 ? (
        <p className="text-muted-foreground">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {category.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}