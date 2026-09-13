import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import Providers from "@/components/providers/SessionProvider";
import "./globals.css";
import { Inter, Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClickCart",
  description: "Your one-stop shop for all your shopping needs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="flex flex-col min-h-screen">
        <Providers>
          <CartProvider>
            <Navbar />

            <main className="flex-grow">{children}</main>

            <Footer />
            <Toaster />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
