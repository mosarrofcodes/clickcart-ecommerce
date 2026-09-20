"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

export default function CategoryMenu({ active }: { active: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (mounted && Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/categories"
        className={
          active
            ? "text-primary border-b-2 border-primary pb-1 flex items-center gap-1"
            : "text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        }
      >
        Categories
        <ChevronDown className="w-3.5 h-3.5" />
      </Link>

      {open && categories.length > 0 && (
        <div className="absolute left-0 top-full mt-3 w-60 bg-popover text-popover-foreground border rounded-lg shadow-lg p-2 z-50">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
            >
              <span>{category.name}</span>
              {typeof category._count?.products === "number" && (
                <span className="text-xs text-muted-foreground">
                  {category._count.products}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}