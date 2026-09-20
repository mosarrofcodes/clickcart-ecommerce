import { PRODUCT_SORTS, type ProductSort } from "@/lib/store-config";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
      <button
        type="button"
        className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {start > 2 && <span className="text-muted-foreground text-sm">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={cn(
            "px-3 py-1.5 text-sm border rounded-lg transition-colors",
            p === page
              ? "bg-primary text-primary-foreground border-primary"
              : "hover:bg-muted",
          )}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-muted-foreground text-sm">…</span>}
          <button
            type="button"
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}