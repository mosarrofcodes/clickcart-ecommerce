import { db } from "@/lib/db";
import AdminProductsTable from "@/components/admin/AdminProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      stock: true,
      image: true,
      category: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Products</h2>
        <p className="text-sm text-muted-foreground">
          {products.length} product{products.length === 1 ? "" : "s"} in store
        </p>
      </div>
      <AdminProductsTable products={products} />
    </div>
  );
}