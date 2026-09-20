import type { Metadata } from "next";
import InfoPage, { InfoSection, infoPageMetadata } from "@/components/layout/InfoPage";

export const metadata: Metadata = infoPageMetadata(
  "Payment Methods | ClickCart",
  "Payment methods accepted at ClickCart — cash on delivery, bKash, Visa, Mastercard and more via SSLCommerz.",
);

export default function PaymentMethodsPage() {
  return (
    <InfoPage title="Payment Methods" subtitle="Secure, flexible ways to pay">
      <InfoSection heading="Cash on Delivery">
        <p>
          Pay in cash when your order arrives at your door. Available for orders
          up to a set maximum limit. We recommend keeping the exact amount ready
          for the delivery person.
        </p>
      </InfoSection>

      <InfoSection heading="bKash">
        <p>
          Pay instantly with bKash using the SSLCommerz gateway at checkout.
          Both Send Money and QR-based payments are supported on eligible
          orders.
        </p>
      </InfoSection>

      <InfoSection heading="Cards & Banks">
        <ul className="list-disc list-inside space-y-2">
          <li>Visa & Mastercard credit / debit cards</li>
          <li>Mobile banking (bKash, Nagad, Rocket) via SSLCommerz</li>
          <li>Internet banking of major local banks</li>
        </ul>
        <p>
          All online payments are processed through{" "}
          <strong>SSLCommerz</strong> with 256-bit SSL encryption. We never see
          or store your card details.
        </p>
      </InfoSection>

      <InfoSection heading="EMI">
        <p>
          Selected cards qualify for 0% EMI on eligible orders, letting you pay
          in comfortable monthly instalments. EMI availability is shown on the
          product page and at checkout.
        </p>
      </InfoSection>
    </InfoPage>
  );
}