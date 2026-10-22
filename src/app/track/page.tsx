"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useSiteConfig } from "@/context/ConfigContext";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const { config } = useSiteConfig();

  const [orderId, setOrderId] = useState(searchParams.get("id") || searchParams.get("order_id") || "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialId = searchParams.get("id") || searchParams.get("order_id");
    if (initialId) {
      setOrderId(initialId);
      performLookup(initialId, "");
    }
  }, [searchParams]);

  const performLookup = async (idToLook: string, emailToMatch: string) => {
    if (!idToLook.trim()) return;
    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      let url = `/api/orders?order_id=${encodeURIComponent(idToLook.trim())}`;
      if (emailToMatch.trim()) {
        url += `&email=${encodeURIComponent(emailToMatch.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order not found. Please verify your order number.");
      }
      setOrderData(data.order);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to retrieve order tracking");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderId, email);
  };

  // Helper for carrier tracking URL
  const getCarrierTrackingUrl = (carrier: string, tracking: string) => {
    const c = (carrier || "").toLowerCase();
    if (c.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking}`;
    if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${tracking}`;
    if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${tracking}`;
    if (c.includes("dhl")) return `https://www.dhl.com/en/express/tracking.html?AWB=${tracking}`;
    return `https://www.google.com/search?q=${encodeURIComponent(carrier + " " + tracking)}`;
  };

  const fulfillmentSteps = [
    { key: "unfulfilled", title: "Order Placed & Confirmed", desc: "Payment verified via Stripe; dispatched to packing queue." },
    { key: "processing", title: "Label Printed & Packaged", desc: "Thermal hardware boxed with cables and QC verified." },
    { key: "shipped", title: "Carrier In Transit", desc: "Handed over to carrier for 2-Day Priority Delivery." },
    { key: "delivered", title: "Package Delivered", desc: "Delivered to buyer destination address." },
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const orderIndex = ["unfulfilled", "processing", "shipped", "delivered"];
    const currentIdx = orderIndex.indexOf(currentStatus || "unfulfilled");
    const stepIdx = orderIndex.indexOf(stepKey);

    if (currentIdx > stepIdx) return "completed";
    if (currentIdx === stepIdx) return "active";
    return "upcoming";
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", paddingTop: "80px", paddingBottom: "90px" }}>
      <div style={{ maxWidth: "840px", margin: "0 auto", padding: "0 24px" }}>
        {/* Breadcrumb */}
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
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to Store
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(59, 130, 246, 0.1)", padding: "6px 14px", borderRadius: "980px", marginBottom: "12px" }}>
            <Truck size={16} color="#2563EB" />
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Live Carrier Tracking
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", margin: "0 0 10px" }}>
            Track Your Bravon Order
          </h1>
          <p style={{ fontSize: "1rem", color: "#64748B", margin: 0, lineHeight: 1.6 }}>
            Enter your order number (e.g. ord_xxx or Stripe checkout session ID) to check real-time dispatch and delivery status.
          </p>
        </div>

        {/* Lookup Card Form */}
        <form
          onSubmit={handleSearch}
          style={{
            backgroundColor: "var(--bg-apple)",
            padding: "24px",
            borderRadius: "18px",
            border: "1px solid rgba(0,0,0,0.08)",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr auto", gap: "12px", alignItems: "flex-end" }} className="track-form-grid">
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Order Number / Session ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ord_... or cs_live_..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "0.92rem",
                  fontWeight: 500,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Customer Email (Optional verification)
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "0.92rem",
                  fontWeight: 500,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-apple-primary"
              style={{
                padding: "11px 22px",
                fontSize: "0.92rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                height: "44px",
              }}
            >
              <Search size={16} /> {loading ? "Searching..." : "Track Order"}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "16px 20px", borderRadius: "12px", fontSize: "0.9rem", marginBottom: "32px", display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Live Tracking Result */}
        {orderData && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              overflow: "hidden",
            }}
          >
            {/* Top Order Status Banner */}
            <div
              style={{
                padding: "24px 28px",
                backgroundColor: "var(--bg-apple)",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Tracking Order
                </span>
                <h3 style={{ margin: "2px 0 0", fontSize: "1.3rem", fontWeight: 800, color: "#1D1D1F" }}>
                  {orderData.id}
                </h3>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block" }}>Order Placed:</span>
                <strong style={{ fontSize: "0.9rem", color: "#1D1D1F" }}>
                  {new Date(orderData.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </strong>
              </div>
            </div>

            {/* Carrier Tracking Badge if Shipped */}
            {orderData.trackingNumber && (
              <div
                style={{
                  backgroundColor: "#EFF6FF",
                  borderBottom: "1px solid #BFDBFE",
                  padding: "16px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Truck size={20} color="#2563EB" />
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#1E40AF", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                      {orderData.trackingCarrier || "USPS Priority Mail"} Tracking Number
                    </span>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1E3A8A", fontFamily: "monospace" }}>
                      {orderData.trackingNumber}
                    </div>
                  </div>
                </div>

                <a
                  href={getCarrierTrackingUrl(orderData.trackingCarrier, orderData.trackingNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-apple-primary"
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.85rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    textDecoration: "none",
                  }}
                >
                  Track on Carrier Site <ExternalLink size={13} />
                </a>
              </div>
            )}

            {/* Timeline Progress Tracker */}
            <div style={{ padding: "36px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {fulfillmentSteps.map((step, idx) => {
                  const status = getStepStatus(step.key, orderData.fulfillmentStatus);
                  const isDone = status === "completed";
                  const isCurrent = status === "active";

                  return (
                    <div key={step.key} style={{ display: "flex", gap: "18px", position: "relative" }}>
                      {/* Step Indicator Dot & Connecting Line */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: isDone ? "#16A34A" : isCurrent ? "var(--bravon-purple)" : "#E2E8F0",
                            color: isDone || isCurrent ? "#FFFFFF" : "#64748B",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: isCurrent ? "0 0 16px rgba(124, 58, 237, 0.4)" : "none",
                            zIndex: 2,
                            fontWeight: 700,
                            fontSize: "0.9rem",
                          }}
                        >
                          {isDone ? <CheckCircle2 size={20} /> : idx + 1}
                        </div>
                        {idx < fulfillmentSteps.length - 1 && (
                          <div
                            style={{
                              width: "2px",
                              flex: 1,
                              backgroundColor: isDone ? "#16A34A" : "#E2E8F0",
                              marginTop: "6px",
                              marginBottom: "6px",
                            }}
                          />
                        )}
                      </div>

                      {/* Step Info */}
                      <div style={{ paddingBottom: idx < fulfillmentSteps.length - 1 ? "18px" : "0", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: isCurrent ? "var(--bravon-purple)" : isDone ? "#0F172A" : "#64748B" }}>
                            {step.title}
                          </h4>
                          {isCurrent && (
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bravon-purple)", backgroundColor: "rgba(124, 58, 237, 0.1)", padding: "2px 8px", borderRadius: "999px" }}>
                              Current Status
                            </span>
                          )}
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items & Shipping Address Footer */}
            <div
              style={{
                backgroundColor: "var(--bg-apple)",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                padding: "24px 28px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                fontSize: "0.85rem",
              }}
              className="track-summary-grid"
            >
              <div>
                <strong style={{ display: "block", color: "#1D1D1F", marginBottom: "8px", fontSize: "0.9rem" }}>
                  Items in Shipment:
                </strong>
                {orderData.items && orderData.items.length > 0 ? (
                  orderData.items.map((item: any, i: number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "var(--text-secondary)" }}>
                      <span>{item.name} ({item.color}) x {item.quantity}</span>
                      <strong style={{ color: "#1D1D1F" }}>${item.totalPrice}</strong>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "var(--text-secondary)" }}>1x Bravon Thermal Label Printer ($100)</div>
                )}
                <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600 }}>Total Paid:</span>
                  <strong style={{ color: "#1D1D1F", fontSize: "0.95rem" }}>${orderData.amountTotal} USD</strong>
                </div>
              </div>

              <div>
                <strong style={{ display: "block", color: "#1D1D1F", marginBottom: "8px", fontSize: "0.9rem" }}>
                  Shipping Destination:
                </strong>
                {orderData.shipping?.address ? (
                  <address style={{ fontStyle: "normal", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {orderData.shipping.name && <div>{orderData.shipping.name}</div>}
                    <div>{orderData.shipping.address.line1}</div>
                    {orderData.shipping.address.line2 && <div>{orderData.shipping.address.line2}</div>}
                    <div>
                      {orderData.shipping.address.city}, {orderData.shipping.address.state} {orderData.shipping.address.postal_code}
                    </div>
                    <div>{orderData.shipping.address.country}</div>
                  </address>
                ) : (
                  <div style={{ color: "var(--text-secondary)" }}>Customer address on file with Stripe checkout.</div>
                )}
              </div>
            </div>

            {/* Need Return or Warranty Help? */}
            <div
              style={{
                padding: "18px 28px",
                backgroundColor: "#FFFFFF",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                <ShieldCheck size={18} color="var(--bravon-purple)" />
                <span>Protected by 30-Day Money-Back Guarantee &amp; 2-Year Warranty</span>
              </div>

              <Link
                href="/returns"
                style={{
                  color: "var(--bravon-purple)",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                File a Return or Warranty Claim →
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 680px) {
          .track-form-grid {
            grid-template-columns: 1fr !important;
          }
          .track-summary-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ padding: "100px", textAlign: "center" }}>Loading Order Tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
