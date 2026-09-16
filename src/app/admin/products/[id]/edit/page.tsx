import { db } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Edit Product</h2>
        <p className="text-sm text-muted-foreground truncate">{product.title}</p>
      </div>
      <ProductForm
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          stock: product.stock,
          sku: product.sku,
          brand: product.brand,
          weight: product.weight,
          tags: product.tags,
          image: product.image,
          categoryId: product.categoryId,
        }}
        categories={categories}
      />
    </div>
  );
}