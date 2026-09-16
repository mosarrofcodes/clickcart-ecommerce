import { db } from "@/lib/db";
import AdminCategories from "@/components/admin/AdminCategories";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Categories</h2>
        <p className="text-sm text-muted-foreground">Manage product categories</p>
      </div>
      <AdminCategories categories={categories} />
    </div>
  );
}