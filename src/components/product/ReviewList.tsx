"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/product/StarRating";
import type { Review } from "@/types";

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string;
}

export default function ReviewList({ reviews, currentUserId }: ReviewListProps) {
  const router = useRouter();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function remove(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setConfirmId(null);
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to delete review");
      return;
    }
    toast.success("Review deleted");
    router.refresh();
  }

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet. Be the first to review this product.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => {
        const isOwn = r.user.id === currentUserId;
        return (
          <div key={r.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {r.user.image ? (
                  <Image
                    src={r.user.image}
                    alt={r.user.name ?? "Reviewer"}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {(r.user.name ?? "U").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">
                    {isOwn ? "You" : r.user.name ?? "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {isOwn && (
                <Button
                  variant={confirmId === r.id ? "destructive" : "ghost"}
                  size="icon-sm"
                  aria-label="Delete review"
                  onClick={() => remove(r.id)}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
            <div className="mt-2">
              <StarRating value={r.rating} />
              {r.comment && <p className="text-sm mt-2">{r.comment}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}