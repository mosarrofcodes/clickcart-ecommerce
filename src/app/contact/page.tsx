import type { Metadata } from "next";
import { db } from "@/lib/db";
import ContactForm from "@/components/contact/ContactForm";
import InfoPage, { infoPageMetadata } from "@/components/layout/InfoPage";

export const metadata: Metadata = infoPageMetadata(
  "Contact Us | ClickCart",
  "Get in touch with ClickCart support — hotline, email and our contact form. We reply within one business day.",
);

export default async function ContactPage() {
  const [settings] = await Promise.all([
    import("@/lib/site-settings").then((m) => m.getSiteSettings()),
  ]);

  return (
    <InfoPage
      title="Contact Us"
      subtitle={`We're here to help — replies typically within 1 business day.`}
    >
      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-bold">Contact Form</h2>
        <ContactForm />
      </div>

      <div className="border rounded-lg p-6 bg-card space-y-3 text-sm">
        <h2 className="text-lg font-bold">Direct Contact</h2>
        <p className="text-muted-foreground">
          Hotline:{" "}
          <span className="font-semibold text-foreground">
            {settings.hotline || "+880 1700-000000"}
          </span>
        </p>
        <p className="text-muted-foreground">
          Email:{" "}
          <span className="font-semibold text-foreground">
            {settings.supportEmail || "support@clickcart.example"}
          </span>
        </p>
        <p className="text-muted-foreground">
          Business hours: Sat–Fri, 9:00 AM – 9:00 PM (GMT+6)
        </p>
      </div>
    </InfoPage>
  );
}