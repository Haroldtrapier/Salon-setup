import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Drip Nails & Beauty | AI Custom-Fit Press-On Nails",
  description:
    "Drip Nails & Beauty — Where luxury meets technology. AI-powered custom-fit press-on nails crafted for your unique nail shape.",
  keywords: "custom fit press on nails, AI nail fitting, luxury nails, DNNB, Drip Nails & Beauty",
  openGraph: {
    title: "Drip Nails & Beauty | Custom-Fit Press-On Nails",
    description: "AI-powered custom-fit press-on nails crafted for your unique nail shape.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
