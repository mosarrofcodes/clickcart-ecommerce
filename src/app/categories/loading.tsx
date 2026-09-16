import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <Skeleton className="h-9 w-48 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-1/3" />
        ))}
      </div>
    </main>
  );
}