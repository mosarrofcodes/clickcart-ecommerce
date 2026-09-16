import { db } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">New Product</h2>
        <p className="text-sm text-muted-foreground">Fill in the details to add a product.</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}