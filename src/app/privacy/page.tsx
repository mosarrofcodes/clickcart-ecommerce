import type { Metadata } from "next";
import InfoPage, { InfoSection, infoPageMetadata } from "@/components/layout/InfoPage";

export const metadata: Metadata = infoPageMetadata(
  "Privacy Policy | ClickCart",
  "How ClickCart collects, uses and protects your personal data.",
);

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" subtitle="How we handle your data">
      <InfoSection heading="What We Collect">
        <p>
          We collect information you provide when creating an account or placing
          an order — your name, email, phone number and delivery address — as
          well as order and preference data needed to run the store.
        </p>
      </InfoSection>

      <InfoSection heading="How We Use It">
        <ul className="list-disc list-inside space-y-2">
          <li>Processing and delivering your orders</li>
          <li>Sending order updates, payment receipts and support replies</li>
          <li>Improving our store and personalising your experience</li>
          <li>Preventing fraud and keeping your account secure</li>
        </ul>
      </InfoSection>

      <InfoSection heading="Payments">
        <p>
          Online payments are processed by SSLCommerz. Your card details are
          handled by their PCI-DSS compliant systems — we never receive or store
          your full card number.
        </p>
      </InfoSection>

      <InfoSection heading="Cookies">
        <p>
          We use cookies to keep you signed in, remember your cart, and measure
          how the store is used. You can disable cookies in your browser, though
          some store features may not work correctly without them.
        </p>
      </InfoSection>

      <InfoSection heading="Your Rights">
        <p>
          You can update your profile, change your password, or delete data
          linked to your account at any time. For any privacy questions, contact
          us via the{" "}
          <a href="/contact" className="text-primary hover:underline">
            contact page
          </a>
          .
        </p>
      </InfoSection>
    </InfoPage>
  );
}