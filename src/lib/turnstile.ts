import "server-only";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
}

export async function verifyTurnstileToken(
  token: string | undefined,
): Promise<boolean> {
  if (!turnstileEnabled()) return true;
  if (!token || token.trim().length === 0) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY as string;
  const form = new URLSearchParams({ secret, response: token.trim() });

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function verifyTurnstile(
  body: Record<string, unknown>,
): Promise<boolean> {
  if (!turnstileEnabled()) return true;
  const token = typeof body?.captchaToken === "string" ? body.captchaToken : "";
  return verifyTurnstileToken(token);
}