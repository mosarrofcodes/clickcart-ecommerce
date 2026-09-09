"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-destructive mb-4">Error</h1>
      <h2 className="text-xl font-semibold mb-2">Failed to load page</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        There was a problem loading this page. Please try again.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
        <Button>
          <a href="/">Back to Home</a>
        </Button>
      </div>
    </div>
  );
}
