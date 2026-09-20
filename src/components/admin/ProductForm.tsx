"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/admin/ImageUpload";
import type { Product } from "@/types";

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

interface VariantDraft {
  id?: string;
  name: string;
  price: string;
  stock: string;
  sku: string;
}

interface ProductFormProps {
  product?: Partial<Product> & { categoryId?: string };
  categories: ProductCategory[];
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product?.id);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: product?.title ?? "",
    description: product?.description ?? "",
    price: product?.price ? String(product.price) : "",
    oldPrice:
      product?.oldPrice && Number(product.oldPrice) > Number(product.price)
        ? String(product.oldPrice)
        : "",
    stock: product?.stock != null ? String(product.stock) : "0",
    sku: product?.sku ?? "",
    brand: product?.brand ?? "",
    weight: product?.weight != null ? String(product.weight) : "",
    tags: product?.tags?.join(", ") ?? "",
    categoryId: product?.categoryId ?? "",
    image: product?.image ?? "",
  });
  const [variants, setVariants] = useState<VariantDraft[]>(
    (product?.variants ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      price: String(v.price),
      stock: String(v.stock),
      sku: v.sku ?? "",
    })),
  );

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateVariant(index: number, key: keyof VariantDraft, value: string) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const price = Number(form.price);
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.description.trim()) return toast.error("Description is required");
    if (!Number.isFinite(price) || price <= 0)
      return toast.error("Price must be a positive number");
    if (!form.categoryId) return toast.error("Select a category");
    if (!form.sku.trim()) return toast.error("SKU is required");
    if (!form.image) return toast.error("Upload a product image");

    const variantPayload = variants
      .map((v) => ({
        id: v.id ?? undefined,
        name: v.name.trim(),
        price: Number(v.price),
        stock: Number(v.stock) || 0,
        sku: v.sku.trim() || null,
      }))
      .filter((v) => v.name && Number.isFinite(v.price) && v.price > 0);

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        oldPrice: Number(form.oldPrice) > price ? Number(form.oldPrice) : null,
        stock: Number(form.stock) || 0,
        sku: form.sku.trim(),
        brand: form.brand.trim() || null,
        weight: form.weight ? Number(form.weight) : null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        categoryId: form.categoryId,
        image: form.image,
        variants: variantPayload,
      };

      const res = await fetch(isEdit ? `/api/products/${product!.id}` : "/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save product");

      toast.success(isEdit ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Product title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={5}
              placeholder="Full product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (BDT)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oldPrice">Old / Strike-through Price (BDT)</Label>
              <Input
                id="oldPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.oldPrice}
                onChange={(e) => update("oldPrice", e.target.value)}
                placeholder="Optional — shows a deal badge"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="e.g. CC-1001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                step="0.1"
                value={form.weight}
                onChange={(e) => update("weight", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                placeholder="Comma separated"
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Variants (optional)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setVariants((prev) => [
                    ...prev,
                    { name: "", price: "", stock: "0", sku: "" },
                  ])
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Variant
              </Button>
            </div>
            {variants.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No variants. Customers purchase the base price and stock above.
              </p>
            )}
            {variants.map((v, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4 space-y-1">
                  <Label className="text-xs">Option name</Label>
                  <Input
                    value={v.name}
                    onChange={(e) =>
                      updateVariant(index, "name", e.target.value)
                    }
                    placeholder="e.g. 128GB / Black"
                    className="h-9"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.price}
                    onChange={(e) =>
                      updateVariant(index, "price", e.target.value)
                    }
                    placeholder="0.00"
                    className="h-9"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) =>
                      updateVariant(index, "stock", e.target.value)
                    }
                    className="h-9"
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <Label className="text-xs">SKU</Label>
                  <Input
                    value={v.sku}
                    onChange={(e) => updateVariant(index, "sku", e.target.value)}
                    placeholder="Optional"
                    className="h-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="col-span-1"
                  onClick={() =>
                    setVariants((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.categoryId}
              onValueChange={(value: string | null) => update("categoryId", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product Image</Label>
            <ImageUpload
              value={form.image || undefined}
              onUploaded={(url) => update("image", url)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}