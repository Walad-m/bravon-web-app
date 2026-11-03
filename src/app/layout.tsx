import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ConfigProvider } from "@/context/ConfigContext";
import { readServerConfig } from "@/lib/serverConfig";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://bravoncity.com"),
  title: "Bravon Printer — Universal Thermal Label Printer",
  description: "The last thermal label printer you'll ever need. Works with Mac, Windows, iOS & Android. No ink, no toner.",
  keywords: "thermal label printer, shipping labels, Bravon printer, label printer, barcode printer",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Bravon Printer — Universal Thermal Label Printer",
    description: "No ink. No toner. Just perfect labels every time. Works with every platform.",
    url: "/",
    siteName: "Bravon",
    type: "website",
    images: [
      {
        url: "/bravon-hero-studio-dark.jpg",
        width: 1200,
        height: 630,
        alt: "Bravon Universal Thermal Label Printer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bravon Printer — Universal Thermal Label Printer",
    description: "No ink. No toner. Just perfect labels every time. Works with every platform.",
    images: ["/bravon-hero-studio-dark.jpg"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialConfig = await readServerConfig();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ConfigProvider initialConfig={initialConfig}>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ConfigProvider>
      </body>
    </html>
  );
}
