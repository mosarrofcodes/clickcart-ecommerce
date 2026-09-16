"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCT_SORTS, type ProductSort } from "@/lib/product-query";

const LIMITS = [12, 24, 48];

interface ProductFiltersProps {
  categories: { slug: string; name: string }[];
  brands: string[];
}

export default function ProductFilters({ categories, brands }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = (searchParams.get("sort") as ProductSort) || "newest";
  const category = searchParams.get("category") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const rating = searchParams.get("rating") ?? "";
  const inStock = searchParams.get("inStock") === "true";
  const limit = searchParams.get("limit") ?? "12";

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const commit = useCallback(
    (changes: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === undefined || value === "" || value === "ALL") params.delete(key);
        else params.set(key, value);
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      commit({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined });
    }, 500);
    return () => clearTimeout(handler);
  }, [minPrice, maxPrice, commit]);

  const hasFilters = Boolean(category || brand || rating || inStock || minPrice || maxPrice);

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </h2>
        {hasFilters && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
              router.replace(pathname, { scroll: false });
            }}
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Sort by</Label>
        <Select value={sort} onValueChange={(value: string | null) => commit({ sort: value ?? undefined })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Category</Label>
        <Select value={category || "ALL"} onValueChange={(value: string | null) => commit({ category: value === "ALL" || !value ? undefined : value })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {brands.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Brand</Label>
          <Select value={brand || "ALL"} onValueChange={(value: string | null) => commit({ brand: value === "ALL" || !value ? undefined : value })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="min-price" className="text-xs text-muted-foreground">
            Min price
          </Label>
          <Input
            id="min-price"
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-price" className="text-xs text-muted-foreground">
            Max price
          </Label>
          <Input
            id="max-price"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="999"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Minimum rating</Label>
        <Select value={rating || "ALL"} onValueChange={(value: string | null) => commit({ rating: value === "ALL" || !value ? undefined : value })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any rating</SelectItem>
            <SelectItem value="4">4★ & up</SelectItem>
            <SelectItem value="3">3★ & up</SelectItem>
            <SelectItem value="2">2★ & up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Items per page</Label>
        <Select value={limit} onValueChange={(value: string | null) => commit({ limit: value ?? "12" })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIMITS.map((l) => (
              <SelectItem key={l} value={String(l)}>
                {l} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          className="accent-primary"
          checked={inStock}
          onChange={(e) => commit({ inStock: e.target.checked ? "true" : undefined })}
        />
        In stock only
      </label>
    </div>
  );
}