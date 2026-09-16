interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "ClickCart <orders@clickcart.example>";

/**
 * Sends an email via Resend when `RESEND_API_KEY` is configured.
 * Falls back to a console log in development so flows complete without a key.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<{ ok: boolean; skipped?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        `[email] RESEND_API_KEY not set; skipping "${subject}" to ${to}`,
      );
    } else {
      console.log(
        `\n[email] (dev log — RESEND_API_KEY not set)\n  To: ${to}\n  Subject: ${subject}\n  ${html.slice(0, 600)}${
          html.length > 600 ? "…" : ""
        }\n`,
      );
    }
    return { ok: true, skipped: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[email] send error:", error);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send exception:", err);
    return { ok: false };
  }
}