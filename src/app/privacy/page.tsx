import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Bravon",
  description: "Bravon customer privacy policy, data protection, and security practices.",
};

export default function PrivacyPage() {
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
            <ShieldCheck size={20} />
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em" }}>Legal & Trust</span>
        </div>

        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: "8px" }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: "0.88rem", color: "#64748B", marginBottom: "36px" }}>
          Last updated: October 20, 2026 · Effective immediately for all visitors and purchasers
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px", color: "#334155", lineHeight: 1.7, fontSize: "0.95rem" }}>
          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              1. Overview & Commitment
            </h2>
            <p>
              At Bravon, we respect your privacy and are committed to safeguarding personal data. This Privacy Policy describes how Bravon Inc. (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, and discloses information when you visit our website (bravoncity.com), purchase our Bravon Thermal Printer hardware, or use the Bravon Design Studio.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              2. Information We Collect
            </h2>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li><strong>Order & Contact Information:</strong> Name, shipping address, billing address, email address, and phone number provided during checkout.</li>
              <li><strong>Payment Processing:</strong> All payments are processed directly via Stripe. Bravon never stores, transmits, or has access to your full credit card number or bank credentials.</li>
              <li><strong>Device & Usage Data:</strong> IP address, browser type, device information, and interaction timestamps collected automatically for system security and fraud prevention.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              3. How We Use Your Information
            </h2>
            <p>We use the collected information strictly to:</p>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
              <li>Fulfill and ship your physical thermal printer and label hardware orders.</li>
              <li>Send transaction receipts, tracking updates, and warranty notifications.</li>
              <li>Provide dedicated customer support and technical printer troubleshooting.</li>
              <li>Protect against fraudulent transactions, unauthorized access, and chargeback abuse.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              4. Third-Party Service Providers
            </h2>
            <p>
              We share information only with trusted third-party partners essential for our store operations:
            </p>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
              <li><strong>Stripe, Inc.:</strong> Secure payment processing and fraud prevention under PCI-DSS Level 1 compliance.</li>
              <li><strong>Shipping Carriers (USPS, FedEx, UPS, DHL):</strong> Address details required to deliver packages to your physical location.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              5. Your Rights & Contact Us
            </h2>
            <p>
              You have the right to request access to, correction of, or deletion of your personal data. For privacy inquiries or data requests, please contact our privacy compliance team at <a href="mailto:support@bravoncity.com" style={{ color: "#7C3AED", fontWeight: 600 }}>support@bravoncity.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
