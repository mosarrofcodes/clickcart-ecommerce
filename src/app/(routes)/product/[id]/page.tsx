import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import AddToCartButton from "@/components/product/AddToCartButton";
import StarRating from "@/components/product/StarRating";
import ReviewForm from "@/components/product/ReviewForm";
import ReviewList from "@/components/product/ReviewList";

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

  const currentUserId = session?.user?.id;
  const myReview = currentUserId
    ? product.reviews.find((r) => r.user.id === currentUserId)
    : undefined;

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
      priceCurrency: "USD",
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
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
    <main className="max-w-6xl mx-auto px-6 py-10">
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

      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
      </Button>

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

          <p className="text-3xl font-bold text-primary">${product.price}</p>

          <p
            className={`text-sm font-medium ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}
          >
            {product.stock > 0
              ? `In Stock (${product.stock} left)`
              : "Out of Stock"}
          </p>

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

          <AddToCartButton product={product} />
        </div>
      </div>

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