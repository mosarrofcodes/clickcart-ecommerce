"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCT_SORTS, type ProductSort } from "@/lib/store-config";

const LIMITS = [12, 24, 48];

export default function SearchControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = (searchParams.get("sort") as ProductSort) || "newest";
  const limit = searchParams.get("limit") ?? "12";

  function commit(changes: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      params.set(key, value);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={sort} onValueChange={(value: string | null) => commit({ sort: value ?? "newest" })}>
        <SelectTrigger aria-label="Sort results">
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
      <Select value={limit} onValueChange={(value: string | null) => commit({ limit: value ?? "12" })}>
        <SelectTrigger aria-label="Results per page">
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
  );
}