import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
} as const;

export default function StarRating({
  value,
  size = "sm",
  className,
}: StarRatingProps) {
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rated ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            SIZES[size],
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted",
          )}
        />
      ))}
    </div>
  );
}