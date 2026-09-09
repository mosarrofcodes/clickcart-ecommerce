import ProductList from "@/components/product/ProductList";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to ClickCart 🛒</h1>
        <p className="text-muted-foreground text-lg">
          Trusted online shopping platform
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <Button variant="outline">
          <Link href="/products">View All →</Link>
        </Button>
      </div>

      <ProductList limit={8} />
    </main>
  );
}
