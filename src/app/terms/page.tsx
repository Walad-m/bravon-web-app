import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Bravon",
  description: "Terms of service and purchase agreement for Bravon Thermal Printers.",
};

export default function TermsPage() {
  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", paddingTop: "80px", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            textDecoration: "none",
            marginBottom: "24px",
          }}
        >
          <ArrowLeft size={16} /> Back to Store
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(124, 58, 237, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C3AED" }}>
            <FileText size={20} />
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em" }}>Legal Agreement</span>
        </div>

        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: "8px" }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: "0.88rem", color: "#64748B", marginBottom: "36px" }}>
          Last updated: October 20, 2026 · Governing all purchases and software access
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px", color: "#334155", lineHeight: 1.7, fontSize: "0.95rem" }}>
          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing bravoncity.com or placing an order for the Bravon Thermal Label Printer, you agree to be bound by these Terms of Service and all applicable federal and state laws.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              2. Product Purchases & Pricing
            </h2>
            <p>
              All prices are listed in United States Dollars ($ USD). We reserve the right to correct any typographical errors in pricing or product descriptions before dispatch. Once your order is processed through Stripe, you will receive an email confirmation with an itemized invoice.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              3. 1-Year Limited Hardware Warranty
            </h2>
            <p>
              Every new Bravon Thermal Printer includes a complimentary 1-Year Limited Manufacturer Warranty covering defects in thermal head heating elements, roller mechanisms, and electronic circuitry under normal commercial use.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              4. Design Studio Software License
            </h2>
            <p>
              Bravon provides access to our browser-based Design Studio and native companion print tools free of charge with your hardware. You may design, format, and generate shipping and barcode labels for personal or commercial fulfillment.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              5. Contact Information
            </h2>
            <p>
              Questions regarding these terms should be sent to <a href="mailto:support@bravoncity.com" style={{ color: "#7C3AED", fontWeight: 600 }}>support@bravoncity.com</a> or mail: Bravon Inc., California, USA.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
