"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Sparkles, Printer } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/context/ConfigContext";

interface OrderDetail {
  id: string;
  customerEmail: string;
  customerName?: string;
  shipping?: {
    name?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
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
  const { config } = useSiteConfig();

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

  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

  return (
    <div
      style={{
        maxWidth: "600px",
        width: "100%",
        textAlign: "center",
      }}
    >
      <style>{`
        @media print {
          nav, footer, header, .screen-only, .no-print, button {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .receipt-card {
            border: 1.5px solid #000000 !important;
            box-shadow: none !important;
            border-radius: 8px !important;
            padding: 16px !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            color: #000000 !important;
            background: #ffffff !important;
          }
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Screen-Only Header & Confirmation Badge */}
      <div className="screen-only">
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
      </div>

      {/* Dynamic Order Receipt Card (Formatted for Both Screen & Single-Sheet Print) */}
      {order && (
        <div
          className="receipt-card"
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
          {/* Print-Only Receipt Header (Thermal & Paper Optimized) */}
          <div
            className="print-only"
            style={{
              display: "none",
              borderBottom: "2px solid #000",
              paddingBottom: "10px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>
                  BRAVON
                </h2>
                <p style={{ fontSize: "0.75rem", margin: "2px 0 0", color: "#333" }}>
                  Universal Thermal Label Printers · bravoncity.com
                </p>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.75rem", color: "#333" }}>
                <div><strong>OFFICIAL RECEIPT</strong></div>
                <div>{formattedDate}</div>
              </div>
            </div>
          </div>

          {/* Screen & Print Order Reference Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "14px",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              paddingBottom: "10px",
            }}
          >
            <div>
              <span style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                Order Reference
              </span>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                }}
              >
                {order.id}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "2px" }}>
                {formattedDate}
              </div>
            </div>

            {/* Print Receipt Button (Hidden in Print View) */}
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                backgroundColor: "#7C3AED",
                border: "none",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
                flexShrink: 0,
                marginLeft: "12px",
              }}
            >
              <Printer size={14} /> Print Receipt
            </button>
          </div>

          {/* Receipt Breakdown Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>Customer:</span>
              <span style={{ fontWeight: 600, color: "#0F172A" }}>
                {order.customerName ? `${order.customerName} (${order.customerEmail})` : order.customerEmail}
              </span>
            </div>

            {order.shipping?.address && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ color: "#64748B" }}>Ship To:</span>
                <span style={{ fontWeight: 600, color: "#0F172A", textAlign: "right" }}>
                  {order.shipping.name && <div>{order.shipping.name}</div>}
                  {order.shipping.address.line1 && <div>{order.shipping.address.line1}</div>}
                  {order.shipping.address.line2 && <div>{order.shipping.address.line2}</div>}
                  <div>
                    {[order.shipping.address.city, order.shipping.address.state, order.shipping.address.postal_code]
                      .filter(Boolean)
                      .join(", ")}
                    {order.shipping.address.country ? ` (${order.shipping.address.country})` : ""}
                  </div>
                </span>
              </div>
            )}

            <div style={{ borderTop: "1px dashed rgba(0,0,0,0.1)", margin: "4px 0" }} />

            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#334155" }}>
                  {item.name} ({item.color}) × {item.quantity}
                </span>
                <span style={{ fontWeight: 600, color: "#0F172A" }}>${item.totalPrice.toFixed(2)} USD</span>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", color: "#16A34A" }}>
              <span>Shipping & Handling:</span>
              <span style={{ fontWeight: 600 }}>FREE</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1.5px solid #0F172A",
                paddingTop: "8px",
                marginTop: "4px",
              }}
            >
              <div>
                <span style={{ fontWeight: 800, color: "#0F172A", fontSize: "0.95rem" }}>Total Paid (USD):</span>
                <div style={{ fontSize: "0.72rem", color: "#16A34A", fontWeight: 700 }}>
                  ✓ Paid in full via Stripe Card
                </div>
              </div>
              <span style={{ fontWeight: 800, color: "#7C3AED", fontSize: "1.1rem" }}>
                ${order.amountTotal.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Print-Only Receipt Footer */}
          <div
            className="print-only"
            style={{
              display: "none",
              borderTop: "1px dashed #000",
              paddingTop: "8px",
              marginTop: "12px",
              textAlign: "center",
              fontSize: "0.72rem",
              color: "#444",
            }}
          >
            Thank you for choosing Bravon! Support: support@bravoncity.com · Returns: bravoncity.com/returns
          </div>
        </div>
      )}

      {/* Screen-Only: Steps Card */}
      <div
        className="screen-only"
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
          `Includes ${config.warrantyText || "2-Year Manufacturer Warranty"} and ${config.returnPolicyText || "30-Day Money-Back Guarantee"}.`,
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

      {/* Screen-Only: Action Buttons */}
      <div
        className="screen-only"
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
