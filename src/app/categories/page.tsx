"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("https://dummyjson.com/products/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.title = "Categories | ClickCart";
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      <ul className="space-y-4 text-lg font-medium">
        {categories.map((category) => (
          <li
            key={category.slug}
            className="hover:text-primary hover:font-semibold cursor-pointer transition-colors"
            onClick={() => router.push(`/categories/${category.slug}`)}
          >
            {category.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
