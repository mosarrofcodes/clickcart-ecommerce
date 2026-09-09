import ProductList from "@/components/product/ProductList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | ClickCart",
};

export default function ProductsPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Products</h1>
      </div>

      <ProductList limit={60} />
    </main>
  );
}
