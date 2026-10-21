import type { Metadata } from "next";
import Link from "next/link";
import { Truck, ArrowLeft, Clock, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy — Bravon",
  description: "Bravon shipping options, dispatch times, and carrier tracking details.",
};

export default function ShippingPage() {
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
            <Truck size={20} />
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em" }}>Logistics</span>
        </div>

        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: "8px" }}>
          Shipping & Delivery
        </h1>
        <p style={{ fontSize: "0.88rem", color: "#64748B", marginBottom: "36px" }}>
          Reliable fulfillment with automated tracking on every order
        </p>

        {/* Speed Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "32px" }}>
          <div style={{ backgroundColor: "#F8FAFC", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Clock size={16} color="#7C3AED" />
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Standard Free Shipping</span>
            </div>
            <p style={{ fontSize: "0.84rem", color: "#64748B", margin: 0 }}>
              3–5 Business Days · Free on all hardware orders within the US.
            </p>
          </div>

          <div style={{ backgroundColor: "#F8FAFC", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <ShieldCheck size={16} color="#16A34A" />
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Express Priority ($15)</span>
            </div>
            <p style={{ fontSize: "0.84rem", color: "#64748B", margin: 0 }}>
              1–2 Business Days · Priority dispatch with FedEx / UPS Air.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px", color: "#334155", lineHeight: 1.7, fontSize: "0.95rem" }}>
          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              1. Order Processing Times
            </h2>
            <p>
              Orders placed before 2:00 PM EST Monday through Friday are processed and handed to the carrier on the same business day. Orders placed over the weekend or on federal holidays are dispatched on the next business morning.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              2. Tracking Your Order
            </h2>
            <p>
              As soon as your shipment is scanned by the carrier, you will receive an automated email with your direct tracking link (USPS, FedEx, or UPS). You can click the link anytime to view live transit milestones and estimated delivery date.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              3. International Shipping
            </h2>
            <p>
              We ship to the United States, Canada, the United Kingdom, Australia, and European Union countries. International transit times typically range from 6 to 12 business days depending on customs clearance.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              4. Questions & Shipping Support
            </h2>
            <p>
              If you need to change your delivery address before dispatch or have questions about a shipment, email us at <a href="mailto:support@bravoncity.com" style={{ color: "#7C3AED", fontWeight: 600 }}>support@bravoncity.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
