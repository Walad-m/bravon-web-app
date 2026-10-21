"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Sparkles, Printer, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface OrderDetail {
  id: string;
  customerEmail: string;
  customerName?: string;
  items: Array<{ name: string; color: string; quantity: number; unitPrice: number; totalPrice: number }>;
  amountTotal: number;
  currency: string;
  fulfillmentStatus: string;
  createdAt: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    fetch(`/api/orders?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
        }
      })
      .catch((err) => console.error("Could not fetch order receipt:", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div
      style={{
        maxWidth: "600px",
        width: "100%",
        textAlign: "center",
      }}
    >
      {/* Green confirmation badge */}
      <div
        style={{
          width: "72px",
          height: "72px",
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.04))",
          border: "2px solid rgba(34, 197, 94, 0.25)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 10px 30px rgba(34, 197, 94, 0.15)",
        }}
      >
        <CheckCircle size={38} color="#16A34A" />
      </div>

      <p className="eyebrow" style={{ marginBottom: "8px", color: "#16A34A", fontWeight: 700, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.06em" }}>
        Payment Verified via Stripe
      </p>

      <h1
        style={{
          fontSize: "clamp(2rem, 4vw, 2.6rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "#0F172A",
          lineHeight: 1.15,
          marginBottom: "12px",
        }}
      >
        Order Confirmed! 🎉
      </h1>

      <p
        style={{
          color: "#475569",
          fontSize: "1rem",
          lineHeight: 1.6,
          marginBottom: "28px",
          maxWidth: "500px",
          margin: "0 auto 28px",
        }}
      >
        Thank you for purchasing your Bravon Thermal Printer. An automated email receipt and order confirmation has been dispatched.
      </p>

      {/* Dynamic Order Receipt Card if session found */}
      {order && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #7C3AED",
            borderRadius: "16px",
            padding: "20px 22px",
            marginBottom: "24px",
            textAlign: "left",
            boxShadow: "0 8px 24px rgba(124, 58, 237, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: "10px" }}>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Order Reference</span>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A", wordBreak: "break-all" }}>
                {order.id.slice(0, 24)}...
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "#F1F5F9",
                border: "1px solid rgba(0,0,0,0.08)",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#0F172A",
                cursor: "pointer",
              }}
            >
              <Printer size={13} /> Print Receipt
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>Recipient:</span>
              <span style={{ fontWeight: 600, color: "#0F172A" }}>{order.customerEmail}</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>{item.name} ({item.color}) × {item.quantity}:</span>
                <span style={{ fontWeight: 600, color: "#0F172A" }}>${item.totalPrice.toFixed(2)} USD</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed rgba(0,0,0,0.1)", paddingTop: "8px", marginTop: "4px" }}>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>Total Paid (USD):</span>
              <span style={{ fontWeight: 800, color: "#7C3AED", fontSize: "1.05rem" }}>${order.amountTotal.toFixed(2)} USD</span>
            </div>
          </div>
        </div>
      )}

      {/* Steps Card */}
      <div
        style={{
          backgroundColor: "#F8FAFC",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "16px",
          padding: "24px 20px",
          marginBottom: "28px",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#0F172A",
            fontWeight: 700,
            fontSize: "0.95rem",
            marginBottom: "16px",
          }}
        >
          <Package size={17} color="#7C3AED" /> What happens next?
        </div>

        {[
          "Order dispatched to warehouse fulfillment — tracking provided within 1 business day.",
          "Carrier delivery via USPS / FedEx Priority with full door-to-door insurance.",
          "Access the free Bravon Design Studio or companion software to prepare label templates.",
          "Includes 1-Year Manufacturer Warranty and 30-Day Money-Back Guarantee.",
        ].map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: i === 3 ? "0" : "12px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "rgba(124, 58, 237, 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#7C3AED",
                flexShrink: 0,
                marginTop: "2px",
              }}
            >
              {i + 1}
            </div>
            <span
              style={{
                color: "#475569",
                fontSize: "0.88rem",
                lineHeight: 1.5,
              }}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link href="/design" className="btn-apple-primary">
          <Sparkles size={16} /> Open Design Studio
        </Link>
        <Link href="/" className="btn-apple-secondary">
          Back to Store
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        paddingTop: "90px",
        color: "#0F172A",
      }}
    >
      <Suspense fallback={<div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>Loading confirmation...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
