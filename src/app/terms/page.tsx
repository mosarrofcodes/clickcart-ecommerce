import type { Metadata } from "next";
import InfoPage, { InfoSection, infoPageMetadata } from "@/components/layout/InfoPage";

export const metadata: Metadata = infoPageMetadata(
  "Terms of Service | ClickCart",
  "ClickCart terms of service — the conditions that apply when you use our store and services.",
);

export default function TermsPage() {
  return (
    <InfoPage title="Terms of Service" subtitle="The agreement between you and ClickCart">
      <InfoSection heading="Acceptance of Terms">
        <p>
          By using ClickCart you agree to these terms. If you do not agree,
          please do not use our services. We may update these terms from time to
          time; continued use after changes means you accept the updated terms.
        </p>
      </InfoSection>

      <InfoSection heading="Orders & Pricing">
        <p>
          All prices are listed in Bangladeshi Taka (৳) including applicable
          taxes. We reserve the right to refuse or cancel an order in cases of
          pricing errors, stock unavailability or suspected fraud. We will
          notify you and issue a refund if your payment was already taken.
        </p>
      </InfoSection>

      <InfoSection heading="Account Responsibilities">
        <p>
          You are responsible for keeping your login details confidential and
          for all activity under your account. Please notify us immediately if
          you believe your account has been compromised.
        </p>
      </InfoSection>

      <InfoSection heading="Acceptable Use">
        <p>
          You agree not to misuse the store — including attempting to interfere
          with its operation, uploading malicious code, or using automated tools
          to scrape data without permission.
        </p>
      </InfoSection>

      <InfoSection heading="Limitation of Liability">
        <p>
          To the maximum extent permitted by law, ClickCart is not liable for
          indirect or consequential damages arising from product use, delivery
          delays or service interruptions beyond our reasonable control.
        </p>
      </InfoSection>
    </InfoPage>
  );
}