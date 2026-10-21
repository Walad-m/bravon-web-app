import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Return Policy — Bravon",
  description: "Bravon 30-day money-back guarantee and return policy.",
};

export default function ReturnsPage() {
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
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
            <RotateCcw size={20} />
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.05em" }}>Buyer Protection</span>
        </div>

        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: "8px" }}>
          30-Day Money-Back Guarantee
        </h1>
        <p style={{ fontSize: "0.88rem", color: "#64748B", marginBottom: "36px" }}>
          Simple, hassle-free returns on all Bravon thermal hardware
        </p>

        {/* Highlight Card */}
        <div style={{ backgroundColor: "#F8FAFC", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "14px", padding: "20px 24px", marginBottom: "32px", display: "flex", alignItems: "center", gap: "14px" }}>
          <CheckCircle2 size={24} color="#16A34A" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Zero Risk Guarantee</div>
            <div style={{ fontSize: "0.84rem", color: "#64748B" }}>Try the Bravon Thermal Printer in your shipping workflow for 30 days. If it doesn&apos;t save you time and money, return it for a full 100% refund.</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px", color: "#334155", lineHeight: 1.7, fontSize: "0.95rem" }}>
          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              1. 30-Day Return Window
            </h2>
            <p>
              You have 30 days from the date of physical carrier delivery to request a return. To be eligible, your printer must be in original condition with the power cable, USB cable, roll holder, and original packaging box included.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              2. How to Initiate a Return
            </h2>
            <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>Email our support team at <a href="mailto:support@bravoncity.com" style={{ color: "#7C3AED", fontWeight: 600 }}>support@bravoncity.com</a> with your order number.</li>
              <li>We will email you a prepaid return shipping label within 24 hours.</li>
              <li>Drop the packaged printer off at your nearest USPS or FedEx location.</li>
            </ol>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              3. Refund Processing
            </h2>
            <p>
              Once our warehouse inspects the returned hardware (usually within 2 business days of receipt), your refund is immediately issued back to your original payment method (via Stripe). Credit card refunds typically appear on your statement in 3–5 business days.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              4. Damaged or Defective Items
            </h2>
            <p>
              If your printer arrives damaged in transit or displays a manufacturing defect, contact us immediately. We will dispatch a brand-new replacement unit with expedited shipping at zero cost to you.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
