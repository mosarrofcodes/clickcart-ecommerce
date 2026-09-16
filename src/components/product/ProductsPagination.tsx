"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/product/Pagination";

export default function ProductsPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function go(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return <Pagination page={page} totalPages={totalPages} onPageChange={go} />;
}