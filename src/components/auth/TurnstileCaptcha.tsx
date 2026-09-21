"use client";

import { useEffect, useRef } from "react";

export const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type TurnstileTheme = "auto" | "light" | "dark";

interface TurnstileCaptchaProps {
  onChange: (token: string | null) => void;
  theme?: TurnstileTheme;
  action?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          theme?: TurnstileTheme;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => void;
    };
  }
}

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile-script="1"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      if (window.turnstile) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.setAttribute("data-turnstile-script", "1");
    script.addEventListener("load", () => resolve(), { once: true });
    document.head.appendChild(script);
  });
}

export default function TurnstileCaptcha({
  onChange,
  theme = "auto",
  action = "submit",
}: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!turnstileSiteKey) return;
    let cancelled = false;

    void loadTurnstileScript().then(() => {
      if (
        cancelled ||
        rendered.current ||
        !containerRef.current ||
        !window.turnstile
      ) {
        return;
      }
      rendered.current = true;
      window.turnstile.render(containerRef.current, {
        sitekey: turnstileSiteKey,
        action,
        theme,
        callback: (token) => onChangeRef.current(token),
        "expired-callback": () => onChangeRef.current(null),
        "error-callback": () => onChangeRef.current(null),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [theme, action]);

  if (!turnstileSiteKey) return null;

  return (
    <div
      ref={containerRef}
      aria-label="Security verification"
      className="grid place-items-center"
    />
  );
}