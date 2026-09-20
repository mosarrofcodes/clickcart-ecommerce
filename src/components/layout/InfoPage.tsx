import type { ReactNode } from "react";
import type { Metadata } from "next";

interface InfoPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const infoPageMetadata = (title: string, description: string): Metadata => ({
  title,
  description,
});

export default function InfoPage({ title, subtitle, children }: InfoPageProps) {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground mb-8">{subtitle}</p>
      )}
      <div className="space-y-8">{children}</div>
    </main>
  );
}

export function InfoSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="border rounded-lg p-6 bg-card">
      <h2 className="text-lg font-bold mb-3">{heading}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}