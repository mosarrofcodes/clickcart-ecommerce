"use client";

import { useEffect, useRef } from "react";
import { useRecentlyViewedStore } from "@/store/recentlyViewed";
import type { Product } from "@/types";

export default function RecordProductView({ product }: { product: Product }) {
  const add = useRecentlyViewedStore((s) => s.add);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (seen.current.has(product.id)) return;
    seen.current.add(product.id);
    add(product);
  }, [product, add]);

  return null;
}