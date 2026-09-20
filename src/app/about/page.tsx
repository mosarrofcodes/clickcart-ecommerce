import type { Metadata } from "next";
import InfoPage, { InfoSection, infoPageMetadata } from "@/components/layout/InfoPage";

export const metadata: Metadata = infoPageMetadata(
  "About Us | ClickCart",
  "Learn about ClickCart — Bangladesh's trusted online shopping destination for electronics, fashion, groceries and more.",
);

export default function AboutPage() {
  return (
    <InfoPage title="About Us" subtitle="Who we are and why you can trust ClickCart">
      <InfoSection heading="Our Story">
        <p>
          ClickCart started with a simple mission: make online shopping in
          Bangladesh fast, safe and truly convenient. What began as a small
          delivery operation has grown into a full online storefront serving
          customers across all 64 districts.
        </p>
        <p>
          We work directly with brands and authorised distributors to bring you
          genuine products at honest prices — with secure payments, easy
          returns and real people at our support hotline.
        </p>
      </InfoSection>

      <InfoSection heading="Why Shop With Us">
        <ul className="list-disc list-inside space-y-2">
          <li>100% genuine products from authorised channels</li>
          <li>Cash on delivery, bKash and SSLCommerz card payments</li>
          <li>Free delivery inside Dhaka on orders over ৳5,000</li>
          <li>7-day easy returns on eligible items</li>
          <li>Fast dispatch from our Dhaka warehouse</li>
          <li>Dedicated hotline and live support throughout the week</li>
        </ul>
      </InfoSection>

      <InfoSection heading="Our Team">
        <p>
          ClickCart is built by a team of engineers, supply-chain specialists
          and customer-care professionals based in Dhaka, Bangladesh. We
          personally test-call our delivery partners, review every return
          request and handle your data with care.
        </p>
      </InfoSection>
    </InfoPage>
  );
}