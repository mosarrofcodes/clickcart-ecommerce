"use client";

import { useState } from "react";
import ProductVariantPicker from "@/components/product/ProductVariantPicker";
import AddToCartButton from "@/components/product/AddToCartButton";
import { formatMoney } from "@/lib/currency";
import type { Product } from "@/types";

export default function ProductBuySection({ product }: { product: Product }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const selected = hasVariants
    ? variants.find((v) => v.id === selectedId) ?? variants[0]
    : undefined;
  const price = selected?.price ?? product.price;
  const stock = selected?.stock ?? product.stock;

  return (
    <>
      <ProductVariantPicker
        product={product}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {/* Sticky mobile buy bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t bg-background/95 backdrop-blur px-4 py-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{product.title}</p>
          <p className="font-bold text-primary leading-tight">
            {formatMoney(price)}
            {product.oldPrice && product.oldPrice > price && (
              <span className="ml-2 text-xs text-muted-foreground line-through">
                {formatMoney(product.oldPrice)}
              </span>
            )}
          </p>
        </div>
        <div className="flex-1">
          <AddToCartButton product={product} variant={selected ?? undefined} />
        </div>
      </div>
    </>
  );
}