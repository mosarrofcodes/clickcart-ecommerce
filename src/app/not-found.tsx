import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might
        have been moved or deleted.
      </p>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
