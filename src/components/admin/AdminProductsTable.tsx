"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/currency";

interface AdminProduct {
  id: string;
  title: string;
  price: number;
  stock: number;
  image: string;
  category: { name: string };
}

export default function AdminProductsTable({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.category.name.toLowerCase().includes(query.toLowerCase()),
      )
    : products;

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function remove(id: string) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete product");
      return;
    }
    toast.success("Product deleted");
    router.refresh();
  }

  async function removeMany(ids: string[]) {
    setDeleting(true);
    try {
      await Promise.all(ids.map((id) => fetch(`/api/products/${id}`, { method: "DELETE" })));
      toast.success(`${ids.length} product${ids.length > 1 ? "s" : ""} deleted`);
      setSelected(new Set());
      router.refresh();
    } catch {
      toast.error("Failed to delete products");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>
        {selected.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={() => removeMany([...selected])}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete ({selected.size})
          </Button>
        )}
        <Button asChild size="sm">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  className="accent-primary"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) setSelected(new Set(filtered.map((p) => p.id)));
                    else setSelected(new Set());
                  }}
                />
              </th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${p.title}`}
                      className="accent-primary"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelected(p.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={p.image}
                        alt={p.title}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover rounded border"
                      />
                      <span className="font-medium line-clamp-1">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category.name}</td>
                  <td className="px-4 py-3 text-right">{formatMoney(p.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={
                        p.stock === 0
                          ? "text-red-600 font-medium"
                          : p.stock <= 5
                            ? "text-amber-600 font-medium"
                            : "text-muted-foreground"
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link href={`/admin/products/${p.id}/edit`} aria-label="Edit">
                          <Pencil />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete"
                        className="text-destructive"
                        onClick={() => remove(p.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}