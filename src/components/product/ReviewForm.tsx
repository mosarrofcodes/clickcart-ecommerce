"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  productId: string;
  existingRating?: number;
  defaultComment?: string;
}

export default function ReviewForm({
  productId,
  existingRating,
  defaultComment,
}: ReviewFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState(defaultComment ?? "");
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const currentRating = rating || existingRating || 0;

  if (status !== "authenticated") {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/signin" className="text-primary underline underline-offset-3">
          Sign in
        </Link>{" "}
        to review this product.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentRating) return toast.error("Select a star rating");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: currentRating,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit review");
      toast.success(existingRating ? "Review updated" : "Review submitted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
            onClick={() => setRating(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5"
          >
            <Star
              className={cn(
                "w-6 h-6 transition-colors",
                i <= (hovered || currentRating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted",
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Share your thoughts on this product (optional)"
      />
      <Button type="submit" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {existingRating ? "Update Review" : "Submit Review"}
      </Button>
    </form>
  );
}