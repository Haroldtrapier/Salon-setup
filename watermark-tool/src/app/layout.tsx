import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Watermark Tool",
  description:
    "Remove watermarks from videos and add your own custom branding. Runs entirely in your browser — nothing is uploaded to any server.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
