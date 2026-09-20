import type { Metadata } from "next";
import InfoPage, { InfoSection, infoPageMetadata } from "@/components/layout/InfoPage";

export const metadata: Metadata = infoPageMetadata(
  "Return & Refund Policy | ClickCart",
  "ClickCart return and refund policy — 7-day easy returns, conditions and how to get your money back.",
);

export default function ReturnPolicyPage() {
  return (
    <InfoPage title="Return &amp; Refund Policy" subtitle="7-day easy returns on eligible items">
      <InfoSection heading="Return Window">
        <p>
          Most items can be returned within <strong>7 days</strong> of
          delivery. To be eligible, the item must be unused, unopened and in its
          original packaging with all accessories and tags intact.
        </p>
      </InfoSection>

      <InfoSection heading="Non-Returnable Items">
        <ul className="list-disc list-inside space-y-2">
          <li>Items without the original packaging or seals opened</li>
          <li>Personal care and hygiene products</li>
          <li>Software, gift cards and digital goods</li>
          <li>Items damaged by misuse or mishandling</li>
          <li>Custom or special-order products</li>
        </ul>
      </InfoSection>

      <InfoSection heading="Refunds">
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Cash on Delivery:</strong> refund issued to your bank account
            or bKash within 7–10 working days after the returned item is checked.
          </li>
          <li>
            <strong>Online payment:</strong> refunded to the original card /
            wallet within 7–10 working days.
          </li>
        </ul>
        <p>
          If you received a faulty or damaged item, contact us within 48 hours
          of delivery with photos and we will arrange a replacement or full
          refund — no questions asked.
        </p>
      </InfoSection>

      <InfoSection heading="How to Start a Return">
        <p>
          Contact our support team via the{" "}
          <a href="/contact" className="text-primary hover:underline">
            contact page
          </a>{" "}
          with your order ID. Our team will guide you through courier pickup or
          drop-off and provide a reference number for your return.
        </p>
      </InfoSection>
    </InfoPage>
  );
}