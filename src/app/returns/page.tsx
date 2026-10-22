"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  FileText,
  AlertCircle,
  Truck,
  Send,
  Search,
  ExternalLink,
  Clock,
  Package
} from "lucide-react";
import { useSiteConfig } from "@/context/ConfigContext";

export default function ReturnsWarrantyPage() {
  const { config } = useSiteConfig();
  const [activeTab, setActiveTab] = useState<"return" | "warranty" | "claim" | "lookup">("return");

  // Form states
  const [orderId, setOrderId] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [claimType, setClaimType] = useState<"return" | "warranty">("return");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Status Lookup state
  const [lookupRma, setLookupRma] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          customerEmail,
          customerName,
          claimType,
          reason,
          description,
          photoUrl: photoUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit claim. Please check your information.");
      }

      setSubmitSuccess(data.claim.id);
      // Reset form
      setOrderId("");
      setCustomerEmail("");
      setCustomerName("");
      setReason("");
      setDescription("");
      setPhotoUrl("");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupRma.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/claims?id=${encodeURIComponent(lookupRma.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "RMA reference not found. Please double-check your ID.");
      }
      setLookupResult(data.claim);
    } catch (err: unknown) {
      setLookupError(err instanceof Error ? err.message : "Claim not found");
    } finally {
      setIsLookingUp(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span style={{ color: "#16A34A", backgroundColor: "rgba(22, 163, 74, 0.12)", padding: "4px 10px", borderRadius: "999px", fontWeight: 700, fontSize: "0.8rem" }}>Approved — Return Label Issued</span>;
      case "replacement_shipped":
        return <span style={{ color: "#2563EB", backgroundColor: "rgba(37, 99, 235, 0.12)", padding: "4px 10px", borderRadius: "999px", fontWeight: 700, fontSize: "0.8rem" }}>Replacement Hardware Shipped</span>;
      case "refunded":
        return <span style={{ color: "#7C3AED", backgroundColor: "rgba(124, 58, 237, 0.12)", padding: "4px 10px", borderRadius: "999px", fontWeight: 700, fontSize: "0.8rem" }}>Refund Completed via Stripe</span>;
      case "rejected":
        return <span style={{ color: "#DC2626", backgroundColor: "rgba(220, 38, 38, 0.12)", padding: "4px 10px", borderRadius: "999px", fontWeight: 700, fontSize: "0.8rem" }}>Claim Closed / Rejected</span>;
      default:
        return <span style={{ color: "#D97706", backgroundColor: "rgba(217, 119, 6, 0.12)", padding: "4px 10px", borderRadius: "999px", fontWeight: 700, fontSize: "0.8rem" }}>Pending Review (Within 24h)</span>;
    }
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", paddingTop: "80px", paddingBottom: "90px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
        {/* Navigation Breadcrumb */}
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

        {/* Header Title */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "6px 14px", borderRadius: "980px", marginBottom: "12px" }}>
            <ShieldCheck size={16} color="#10B981" />
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Buyer Protection &amp; Hardware Assurance
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", margin: "0 0 10px" }}>
            Returns &amp; 2-Year Warranty Portal
          </h1>
          <p style={{ fontSize: "1rem", color: "#64748B", margin: 0, lineHeight: 1.6 }}>
            Every Bravon thermal printer is backed by our risk-free 30-day money-back guarantee and a comprehensive 2-year commercial replacement warranty.
          </p>
        </div>

        {/* 4 Trust Feature Highlights */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "36px",
          }}
        >
          <div style={{ padding: "18px", borderRadius: "14px", backgroundColor: "var(--bg-apple)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <RotateCcw size={18} color="#10B981" />
              <strong style={{ fontSize: "0.95rem", color: "#1D1D1F" }}>30-Day Returns</strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Try it for 30 days. Full 100% refund if not completely satisfied.
            </p>
          </div>

          <div style={{ padding: "18px", borderRadius: "14px", backgroundColor: "var(--bg-apple)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <ShieldCheck size={18} color="var(--bravon-purple)" />
              <strong style={{ fontSize: "0.95rem", color: "#1D1D1F" }}>2-Year Warranty</strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Japanese thermal printhead and internal electronics coverage.
            </p>
          </div>

          <div style={{ padding: "18px", borderRadius: "14px", backgroundColor: "var(--bg-apple)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <Truck size={18} color="#3B82F6" />
              <strong style={{ fontSize: "0.95rem", color: "#1D1D1F" }}>Prepaid Labels</strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              We email you a prepaid shipping return label with tracking.
            </p>
          </div>

          <div style={{ padding: "18px", borderRadius: "14px", backgroundColor: "var(--bg-apple)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <Package size={18} color="#F59E0B" />
              <strong style={{ fontSize: "0.95rem", color: "#1D1D1F" }}>Fast Dispatch</strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Replacements ship via 2-Day Priority at zero additional cost.
            </p>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#F1F5F9",
            padding: "5px",
            borderRadius: "14px",
            marginBottom: "32px",
            gap: "6px",
            overflowX: "auto",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("return")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeTab === "return" ? "#FFFFFF" : "transparent",
              color: activeTab === "return" ? "#0F172A" : "#64748B",
              boxShadow: activeTab === "return" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            30-Day Return Policy
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("warranty")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeTab === "warranty" ? "#FFFFFF" : "transparent",
              color: activeTab === "warranty" ? "#0F172A" : "#64748B",
              boxShadow: activeTab === "warranty" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            2-Year Hardware Warranty
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("claim")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: activeTab === "claim" ? "var(--bravon-purple)" : "transparent",
              color: activeTab === "claim" ? "#FFFFFF" : "#64748B",
              boxShadow: activeTab === "claim" ? "0 4px 12px rgba(124, 58, 237, 0.25)" : "none",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            Submit RMA Claim
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lookup")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeTab === "lookup" ? "#FFFFFF" : "transparent",
              color: activeTab === "lookup" ? "#0F172A" : "#64748B",
              boxShadow: activeTab === "lookup" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            Track Claim Status
          </button>
        </div>

        {/* TAB 1: 30-DAY RETURN POLICY */}
        {activeTab === "return" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", color: "#334155", lineHeight: 1.7, fontSize: "0.95rem" }}>
            <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "14px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "14px" }}>
              <CheckCircle2 size={24} color="#16A34A" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#14532D" }}>Zero Risk 30-Day Guarantee</div>
                <div style={{ fontSize: "0.84rem", color: "#166534" }}>
                  Test the Bravon Thermal Printer in your daily shipping workflow. If it doesn&apos;t save you hours and thousands in ink costs, return it for a complete 100% refund.
                </div>
              </div>
            </div>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                1. Return Eligibility Window
              </h2>
              <p>
                You have <strong>30 calendar days</strong> from the official carrier delivery date to request a full refund. The printer must be returned in good cosmetic condition with the power brick, power cord, USB cable, and original packaging box.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                2. How to Return Your Hardware
              </h2>
              <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li>
                  Click the <strong>Submit RMA Claim</strong> tab above or use our online form to generate your Return Authorization code.
                </li>
                <li>
                  Our dispatch center automatically emails you a prepaid USPS or FedEx return shipping label within 24 hours.
                </li>
                <li>
                  Place the printer safely into its packaging box, affix the label, and hand it to any carrier location or schedule a free home pickup.
                </li>
              </ol>
            </section>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                3. Refund Processing via Stripe
              </h2>
              <p>
                Once our warehouse receives and inspects the return (usually within 1–2 business days), your refund is immediately processed back to your original payment method via Stripe. Funds will appear on your bank statement in 3–5 business days.
              </p>
            </section>

            <div style={{ textAlign: "center", paddingTop: "12px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("claim")}
                className="btn-apple-primary"
                style={{ padding: "12px 28px", fontSize: "0.95rem", fontWeight: 700 }}
              >
                Start Return Request Now →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: 2-YEAR HARDWARE WARRANTY */}
        {activeTab === "warranty" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", color: "#334155", lineHeight: 1.7, fontSize: "0.95rem" }}>
            <div style={{ backgroundColor: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: "14px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "14px" }}>
              <ShieldCheck size={24} color="#7C3AED" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#581C87" }}>2-Year Commercial Warranty Included</div>
                <div style={{ fontSize: "0.84rem", color: "#6B21A8" }}>
                  Every Bravon thermal printer is engineered for commercial operation. All hardware components are covered under our 24-month manufacturer guarantee.
                </div>
              </div>
            </div>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                1. What Is Covered Under Warranty
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                {[
                  "Japanese Kyocera 203 DPI thermal printhead (up to 300,000 meters)",
                  "Internal high-torque stepper drive motor & rubber feed roller",
                  "Main logic motherboard, USB controller & Bluetooth BLE transceivers",
                  "Optical label gap & black-mark transmission sensors",
                  "Internal AC/DC power regulation unit & switch mechanisms",
                  "Zero deductible on replacement parts & return shipping",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.88rem" }}>
                    <CheckCircle2 size={16} color="var(--bravon-purple)" style={{ flexShrink: 0, marginTop: "4px" }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                2. Advance Replacement Service
              </h2>
              <p>
                In the rare event that a printer experiences a confirmed hardware defect, our support team will dispatch a brand-new replacement unit before you even return the old one. We understand that your business cannot afford shipping delays.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                3. Exclusions
              </h2>
              <p style={{ fontSize: "0.88rem", color: "#64748B" }}>
                The warranty does not cover damage caused by physical drops from extreme heights, intentional disassembly, liquid submersion, or the use of non-standard acidic chemicals on the printhead.
              </p>
            </section>

            <div style={{ textAlign: "center", paddingTop: "12px" }}>
              <button
                type="button"
                onClick={() => {
                  setClaimType("warranty");
                  setActiveTab("claim");
                }}
                className="btn-apple-primary"
                style={{ padding: "12px 28px", fontSize: "0.95rem", fontWeight: 700 }}
              >
                File a Warranty Claim →
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SUBMIT AN RMA CLAIM */}
        {activeTab === "claim" && (
          <div>
            {submitSuccess ? (
              <div
                style={{
                  backgroundColor: "#F0FDF4",
                  border: "1px solid #86EFAC",
                  borderRadius: "18px",
                  padding: "36px 32px",
                  textAlign: "center",
                }}
              >
                <div style={{ width: "54px", height: "54px", borderRadius: "50%", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#16A34A" }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#14532D", margin: "0 0 8px" }}>
                  Claim Submitted Successfully!
                </h3>
                <p style={{ color: "#166534", fontSize: "0.95rem", marginBottom: "20px" }}>
                  Your Return Merchandise Authorization (RMA) reference has been generated:
                </p>
                <div style={{ display: "inline-block", backgroundColor: "#FFFFFF", border: "2px dashed #16A34A", padding: "10px 24px", borderRadius: "10px", fontSize: "1.4rem", fontWeight: 800, color: "#15803D", letterSpacing: "0.05em", marginBottom: "24px" }}>
                  {submitSuccess}
                </div>
                <p style={{ color: "#374151", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: "560px", margin: "0 auto 28px" }}>
                  Our technical support desk is reviewing your ticket. You will receive an email confirmation with your prepaid return shipping label or replacement dispatch tracking within 24 business hours.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLookupRma(submitSuccess);
                      setActiveTab("lookup");
                      setSubmitSuccess(null);
                    }}
                    className="btn-apple-secondary"
                    style={{ padding: "10px 20px", fontSize: "0.9rem", fontWeight: 600 }}
                  >
                    View Ticket Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(null)}
                    className="btn-apple-primary"
                    style={{ padding: "10px 20px", fontSize: "0.9rem", fontWeight: 600 }}
                  >
                    Submit Another Claim
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitClaim}
                style={{
                  backgroundColor: "var(--bg-apple)",
                  borderRadius: "20px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  padding: "32px",
                }}
              >
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1D1D1F", margin: "0 0 6px" }}>
                  File a Return or Warranty Claim
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 24px" }}>
                  Fill out the form below. Our California-based technical support team reviews all requests within 24 hours.
                </p>

                {submitError && (
                  <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "12px 16px", borderRadius: "10px", fontSize: "0.88rem", marginBottom: "20px" }}>
                    {submitError}
                  </div>
                )}

                {/* Claim Type Selector */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                    Select Claim Type *
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div
                      onClick={() => setClaimType("return")}
                      style={{
                        padding: "14px 18px",
                        borderRadius: "12px",
                        backgroundColor: claimType === "return" ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                        border: claimType === "return" ? "2px solid var(--bravon-purple)" : "1px solid rgba(0,0,0,0.1)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1D1D1F", marginBottom: "2px" }}>
                        30-Day Return for Refund
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                        Money-back guarantee within 30 days of delivery
                      </div>
                    </div>

                    <div
                      onClick={() => setClaimType("warranty")}
                      style={{
                        padding: "14px 18px",
                        borderRadius: "12px",
                        backgroundColor: claimType === "warranty" ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                        border: claimType === "warranty" ? "2px solid var(--bravon-purple)" : "1px solid rgba(0,0,0,0.1)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1D1D1F", marginBottom: "2px" }}>
                        2-Year Warranty Claim
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                        Hardware defect, printhead or motor replacement
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order ID & Customer Email Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                      Order Number / Stripe ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ord_10284 or CS_LIVE_..."
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        border: "1px solid rgba(0,0,0,0.12)",
                        backgroundColor: "#FFFFFF",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                      Customer Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        border: "1px solid rgba(0,0,0,0.12)",
                        backgroundColor: "#FFFFFF",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Full Name & Reason Dropdown */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        border: "1px solid rgba(0,0,0,0.12)",
                        backgroundColor: "#FFFFFF",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                      Reason for Claim *
                    </label>
                    <select
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        border: "1px solid rgba(0,0,0,0.12)",
                        backgroundColor: "#FFFFFF",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Select a reason...</option>
                      {claimType === "return" ? (
                        <>
                          <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
                          <option value="Ordered wrong model / color">Ordered wrong model / color</option>
                          <option value="Workflow requirements changed">Workflow requirements changed</option>
                          <option value="Performance did not meet expectations">Performance did not meet expectations</option>
                          <option value="Other">Other</option>
                        </>
                      ) : (
                        <>
                          <option value="Thermal printhead line / missing pixels">Thermal printhead line / missing pixels</option>
                          <option value="Paper feed / drive motor issue">Paper feed / drive motor issue</option>
                          <option value="Bluetooth pairing failure">Bluetooth pairing failure</option>
                          <option value="Power adapter / electrical fault">Power adapter / electrical fault</option>
                          <option value="Physical damage on delivery">Physical damage on delivery</option>
                          <option value="Other technical fault">Other technical fault</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Problem Description */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Description of Issue or Return Notes *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please explain the issue in detail (e.g. what happened, what device you were printing from, or reasons for return)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Optional Photo/Video Link */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Optional Image / Video Link (e.g., photo of printed label defect)
                  </label>
                  <input
                    type="url"
                    placeholder="https://imgur.com/..., Google Drive, or cloud photo link"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-apple-primary"
                  style={{
                    width: "100%",
                    padding: "14px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Send size={16} />
                  {isSubmitting ? "Generating RMA Ticket..." : "Submit RMA Claim"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: TRACK CLAIM STATUS */}
        {activeTab === "lookup" && (
          <div
            style={{
              backgroundColor: "var(--bg-apple)",
              borderRadius: "20px",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "32px",
            }}
          >
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1D1D1F", margin: "0 0 6px" }}>
              Check RMA Claim Status
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 24px" }}>
              Enter your Return Merchandise Authorization reference number (e.g. RMA-2026-1048) to view real-time resolution status.
            </p>

            <form onSubmit={handleLookup} style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
              <input
                type="text"
                required
                placeholder="RMA-2026-XXXX"
                value={lookupRma}
                onChange={(e) => setLookupRma(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              />
              <button
                type="submit"
                disabled={isLookingUp}
                className="btn-apple-primary"
                style={{ padding: "12px 24px", fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Search size={16} /> {isLookingUp ? "Searching..." : "Lookup"}
              </button>
            </form>

            {lookupError && (
              <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "12px 16px", borderRadius: "10px", fontSize: "0.88rem" }}>
                {lookupError}
              </div>
            )}

            {lookupResult && (
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "14px", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Ticket ID
                    </span>
                    <h4 style={{ margin: "2px 0 0", fontSize: "1.2rem", fontWeight: 800, color: "#1D1D1F" }}>
                      {lookupResult.id}
                    </h4>
                  </div>
                  <div>
                    {getStatusBadge(lookupResult.status)}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", padding: "16px 0", borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: "16px", fontSize: "0.85rem" }}>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Claim Type:</span>
                    <strong style={{ display: "block", color: "#1D1D1F", marginTop: "2px", textTransform: "capitalize" }}>
                      {lookupResult.claimType === "return" ? "30-Day Return" : "2-Year Warranty"}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Order Reference:</span>
                    <strong style={{ display: "block", color: "#1D1D1F", marginTop: "2px" }}>
                      {lookupResult.orderId}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Submitted:</span>
                    <strong style={{ display: "block", color: "#1D1D1F", marginTop: "2px" }}>
                      {new Date(lookupResult.createdAt).toLocaleDateString()}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Reason:</span>
                    <strong style={{ display: "block", color: "#1D1D1F", marginTop: "2px" }}>
                      {lookupResult.reason}
                    </strong>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 600 }}>Description:</span>
                  <p style={{ margin: "4px 0 12px", fontSize: "0.88rem", color: "#374151", lineHeight: 1.5 }}>
                    {lookupResult.description}
                  </p>
                </div>

                {lookupResult.adminNotes && (
                  <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", padding: "12px 16px", borderRadius: "10px", fontSize: "0.85rem", marginTop: "12px" }}>
                    <strong style={{ color: "#0F172A", display: "block", marginBottom: "4px" }}>Note from Support Team:</strong>
                    <span style={{ color: "#475569" }}>{lookupResult.adminNotes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
