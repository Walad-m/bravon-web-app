"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { useSiteConfig } from "@/context/ConfigContext";

export default function FAQPage() {
  const { config } = useSiteConfig();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "Product-0": true, // first item open by default
  });

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const faqs = [
    {
      category: "Hardware & Technology",
      items: [
        {
          q: "Does the Bravon printer require ink or toner?",
          a: "No. The Bravon uses direct thermal printing technology. It utilizes precision heat pulses to produce high-density images directly onto thermal paper. You will never need to purchase ink, toner, or ribbon cartridges.",
        },
        {
          q: "What label sizes and media does it support?",
          a: "Bravon features adjustable media guides that support widths from 20mm up to 108mm (including standard 4x6\" commercial shipping labels, 2x1\" barcode tags, 3x5\" inventory labels, and round sticker badges).",
        },
        {
          q: "What is the printing speed and resolution?",
          a: "It prints at up to 150 mm/second with 203 DPI crisp resolution. A standard 4x6\" shipping label prints in under 1.2 seconds with 100% scannable barcodes.",
        },
        {
          q: "What colorways are available?",
          a: `The Bravon Printer is available in two flagship editions: ${config.whiteColorLabel || "Arctic White"} (modern clean aesthetic) and ${config.darkColorLabel || "Dark Slate"} (matte stealth finish). Both offer identical hardware performance.`,
        },
      ],
    },
    {
      category: "Software & Compatibility",
      items: [
        {
          q: "Which operating systems are supported?",
          a: "Bravon is universal: macOS (Apple Silicon & Intel), Windows 10 & 11, iOS (iPhone & iPad), and Android. Companion apps are included free with zero subscription fees.",
        },
        {
          q: "Does it work with Shopify, Etsy, Amazon, and eBay?",
          a: "Yes. Bravon prints directly from Shopify, Etsy, Amazon Seller Central, eBay, Pirate Ship, Shippo, ShipStation, USPS Click-N-Ship, UPS, FedEx, and DHL. Any platform that generates a standard shipping PDF or label works natively.",
        },
        {
          q: "How does it connect to my computer or phone?",
          a: "High-speed USB connection for desktop computers (Mac & PC) and Bluetooth 5.0 wireless connectivity for mobile devices (iPhone, iPad, and Android phones/tablets).",
        },
      ],
    },
    {
      category: "Pricing & Orders",
      items: [
        {
          q: `How much does the Bravon Printer cost?`,
          a: `The Bravon Commercial Thermal Printer is $${config.price} USD.`,
        },
        {
          q: "What accessories are included?",
          a: `Each printer comes with a heavy-duty 24V power supply, high-speed USB data cable, a MacBook USB-C adapter, and sample commercial fanfold labels so you are ready to print straight out of the box.`,
        },
        {
          q: "Where can I get technical support?",
          a: `Our support team is available via email at ${config.supportEmail}. We provide direct engineer assistance for device setup, label calibration, and app integration.`,
        },
      ],
    },
  ];

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "#1D1D1F", minHeight: "100vh", paddingTop: "56px" }}>
      {/* Editorial Header */}
      <section
        style={{
          padding: "72px 20px 48px",
          textAlign: "center",
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        <p className="eyebrow" style={{ marginBottom: "12px" }}>
          Knowledge Base
        </p>
        <h1
          style={{
            fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            color: "#1D1D1F",
            marginBottom: "16px",
          }}
        >
          Frequently Asked Questions
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: "540px",
            margin: "0 auto",
          }}
        >
          Everything you need to know about the Bravon printer, companion apps, and connectivity.
        </p>
      </section>

      {/* Main FAQ Accordion Container */}
      <main style={{ maxWidth: "840px", margin: "0 auto", padding: "0 20px 90px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          {faqs.map((section) => (
            <div key={section.category}>
              <h2
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--bravon-purple)",
                  marginBottom: "16px",
                  paddingLeft: "4px",
                }}
              >
                {section.category}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {section.items.map((item, j) => {
                  const key = `${section.category}-${j}`;
                  const isOpen = !!openItems[key];

                  return (
                    <div
                      key={j}
                      style={{
                        backgroundColor: "var(--bg-apple)",
                        borderRadius: "16px",
                        border: isOpen ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(0,0,0,0.06)",
                        overflow: "hidden",
                        transition: "border-color 0.2s ease",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        style={{
                          width: "100%",
                          padding: "18px 20px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "0.98rem",
                          color: "#1D1D1F",
                          textAlign: "left",
                          touchAction: "manipulation",
                        }}
                      >
                        <span style={{ paddingRight: "16px" }}>{item.q}</span>
                        {isOpen ? <ChevronUp size={18} color="var(--bravon-purple)" /> : <ChevronDown size={18} />}
                      </button>

                      {isOpen && (
                        <div
                          style={{
                            padding: "0 20px 18px",
                            fontSize: "0.92rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.6,
                          }}
                        >
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Contact Help Card */}
        <div
          style={{
            marginTop: "60px",
            backgroundColor: "var(--bg-apple)",
            borderRadius: "24px",
            padding: "36px 28px",
            textAlign: "center",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1D1D1F", marginBottom: "8px" }}>
            Have a question not listed here?
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "20px" }}>
            Our support engineers are ready to help you with setup and platform integration.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn-apple-primary">
              Contact Support
            </Link>
            <Link href="/product" className="btn-apple-secondary">
              Order Bravon (${config.price}) <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
