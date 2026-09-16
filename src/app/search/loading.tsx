import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-40 mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </main>
  );
}