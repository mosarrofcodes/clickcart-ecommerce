"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/currency";
import type { Product, ProductVariant } from "@/types";
import AddToCartButton from "@/components/product/AddToCartButton";

export default function ProductVariantPicker({
  product,
  selectedId,
  onSelect,
}: {
  product: Product;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const [internalId, setInternalId] = useState<string | null>(null);

  if (!product.variants || product.variants.length === 0) {
    return <AddToCartButton product={product} />;
  }

  const controlled = selectedId !== undefined && onSelect !== undefined;
  const currentId = controlled ? selectedId : internalId;
  const select = (id: string) => (controlled ? onSelect!(id) : setInternalId(id));
  const selected =
    product.variants.find((v) => v.id === currentId) ?? product.variants[0];

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium mb-2">Select option</legend>
        <div className="space-y-2">
          {product.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => select(v.id)}
              className={[
                "w-full flex items-center justify-between border rounded-lg px-4 py-3 text-left transition-colors",
                selected.id === v.id
                  ? "border-primary ring-1 ring-primary"
                  : "hover:border-muted-foreground",
                v.stock === 0 ? "opacity-60" : "",
              ].join(" ")}
            >
              <span className="font-medium">
                {v.name}
                {v.stock === 0 && (
                  <span className="ml-2 text-xs text-red-500">Out of stock</span>
                )}
              </span>
              <span className="font-semibold text-primary">
                {formatMoney(v.price)}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <p
        className={`text-sm font-medium ${selected.stock > 0 ? "text-green-500" : "text-red-500"}`}
      >
        {selected.stock > 0
          ? `In Stock (${selected.stock} left)`
          : "Out of Stock"}
      </p>

      <AddToCartButton product={product} variant={selected} />
    </div>
  );
}