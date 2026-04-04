import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/chatbot/chat-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drip Nails & Beauty | Premium Custom-Fit Press-On Nails",
  description:
    "Drip Nails & Beauty (DNNB) — AI-powered custom-fit press-on nails crafted for your unique nail shape. Shop our collection, book a fitting, or chat with our beauty experts.",
  keywords: "custom fit press on nails, nail fitting, beauty salon, DNNB, Drip Nails",
  openGraph: {
    title: "Drip Nails & Beauty | Custom-Fit Press-On Nails",
    description: "AI-powered custom-fit press-on nails crafted for your unique nail shape.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
