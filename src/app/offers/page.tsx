import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offers | ClickCart",
};

export default function OffersPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-50">
      <h1 className="text-3xl font-bold">Offers</h1>
      <p className="mt-4 text-muted-foreground">
        Check back soon for exciting offers and discounts on your favorite
        products!
      </p>
    </div>
  );
}
