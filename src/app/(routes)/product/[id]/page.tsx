import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ProductBuySection from "@/components/product/ProductBuySection";
import ProductCard from "@/components/product/ProductCard";
import RecordProductView from "@/components/product/RecordProductView";
import EmiInfo from "@/components/product/EmiInfo";
import StarRating from "@/components/product/StarRating";
import ReviewForm from "@/components/product/ReviewForm";
import ReviewList from "@/components/product/ReviewList";
import { formatMoney } from "@/lib/currency";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });

  if (!product) {
    return { title: "Product Not Found | ClickCart" };
  }

  const title = `${product.title} | ClickCart`;

  return {
    title,
    description: product.description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      type: "website",
      title,
      description: product.description,
      url: `/product/${product.id}`,
      images: [{ url: product.image, alt: product.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: { orderBy: { price: "asc" } },
      reviews: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    include: {
      category: true,
      _count: { select: { reviews: true } },
      variants: { orderBy: { price: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const currentUserId = session?.user?.id;
  const myReview = currentUserId
    ? product.reviews.find((r) => r.user.id === currentUserId)
    : undefined;
  const hasVariants = product.variants.length > 0;
  const minPrice = hasVariants
    ? product.variants.reduce((m, v) => Math.min(m, v.price), Infinity)
    : product.price;
  const inStock = hasVariants
    ? product.variants.some((v) => v.stock > 0)
    : product.stock > 0;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.image,
    description: product.description,
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: `/product/${product.id}`,
      priceCurrency: "BDT",
      price: minPrice,
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews.length,
            bestRating: 5,
          }
        : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category.name,
        item: `/categories/${product.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `/product/${product.id}`,
      },
    ],
  };

  return (
    <main className="max-w-6xl mx-auto px-6 pt-10 pb-24 md:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
      >
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/categories/${product.category.slug}`}
          className="hover:text-primary transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium line-clamp-1">
          {product.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="overflow-hidden rounded-lg border">
          <Image
            src={product.image}
            alt={product.title}
            width={800}
            height={600}
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="w-full h-96 object-cover"
          />
        </div>

        <div className="space-y-4 border rounded-lg p-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {product.category.name}
            </Badge>
            {product.brand && (
              <Badge variant="outline">{product.brand}</Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold">{product.title}</h1>

          <div className="flex items-center gap-2">
            <StarRating value={product.rating} size="md" />
            <span className="text-sm font-medium">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground text-sm">
              · {product.reviews.length} review{product.reviews.length === 1 ? "" : "s"}
            </span>
          </div>

          <Separator />

          <p className="text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-baseline gap-3 flex-wrap">
            <p className="text-3xl font-bold text-primary">
              {hasVariants ? `From ${formatMoney(minPrice)}` : formatMoney(product.price)}
            </p>
            {product.oldPrice && product.oldPrice > minPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatMoney(product.oldPrice)}
                </span>
                <span className="text-sm font-semibold text-red-600">
                  Save {formatMoney(product.oldPrice - minPrice)} (
                  {Math.round(((product.oldPrice - minPrice) / product.oldPrice) * 100)}%)
                </span>
              </>
            )}
          </div>

          {hasVariants ? (
            <p className="text-sm font-medium text-muted-foreground">
              {product.variants.length} option{product.variants.length === 1 ? "" : "s"} available
            </p>
          ) : (
            <p
              className={`text-sm font-medium ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}
            >
              {product.stock > 0
                ? `In Stock (${product.stock} left)`
                : "Out of Stock"}
            </p>
          )}

          {!hasVariants && (
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                SKU: <span className="font-medium">{product.sku}</span>
              </p>
              {product.weight && (
                <p>
                  Weight: <span className="font-medium">{product.weight} kg</span>
                </p>
              )}
            </div>
          )}

          <ProductBuySection product={product} />

          <EmiInfo price={minPrice} />
        </div>
      </div>

      <RecordProductView product={product} />

      {related.length > 0 && (
        <section className="mt-14" aria-label="Related products">
          <h2 className="text-2xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 max-w-3xl" aria-label="Reviews">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5" />
          Reviews
        </h2>

        <div className="mb-8 border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">
            {myReview ? "Your review" : "Write a review"}
          </h3>
          <ReviewForm
            productId={product.id}
            existingRating={myReview?.rating}
            defaultComment={myReview?.comment ?? ""}
          />
        </div>

        <ReviewList reviews={product.reviews} currentUserId={currentUserId} />
      </section>
    </main>
  );
}