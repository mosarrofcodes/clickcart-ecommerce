import type { Metadata } from "next";
import TrackOrderForm from "@/components/contact/TrackOrderForm";
import InfoPage, { infoPageMetadata } from "@/components/layout/InfoPage";

export const metadata: Metadata = infoPageMetadata(
  "Track Your Order | ClickCart",
  "Track your ClickCart order using your order ID and phone number.",
);

export default function TrackPage() {
  return (
    <InfoPage
      title="Track Your Order"
      subtitle="Enter your order ID and the phone number used at checkout"
    >
      <div className="border rounded-lg p-6 bg-card">
        <TrackOrderForm />
      </div>
    </InfoPage>
  );
}