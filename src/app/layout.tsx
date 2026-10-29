import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ConfigProvider } from "@/context/ConfigContext";
import { readServerConfig } from "@/lib/serverConfig";

export const metadata: Metadata = {
  title: "Bravon Printer — Universal Thermal Label Printer",
  description: "The last thermal label printer you'll ever need. Works with Mac, Windows, iOS & Android. No ink, no toner.",
  keywords: "thermal label printer, shipping labels, Bravon printer, label printer, barcode printer",
  openGraph: {
    title: "Bravon Printer — Universal Thermal Label Printer",
    description: "No ink. No toner. Just perfect labels every time. Works with every platform.",
    url: "https://bravoncity.com",
    siteName: "Bravon",
    type: "website",
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
