"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Sliders,
  Maximize2,
  Cpu,
  Layers,
  Star,
} from "lucide-react";
import { useSiteConfig } from "@/context/ConfigContext";
import ReviewsSection from "@/components/ReviewsSection";

export default function ProductPage() {
  const { config } = useSiteConfig();
  const [selectedColor, setSelectedColor] = useState<"white" | "dark">(config.defaultColor || "dark");
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  // Sync default color if config changes
  useEffect(() => {
    if (config.defaultColor) {
      setSelectedColor(config.defaultColor);
    }
  }, [config.defaultColor]);

  // Gallery items dynamic based on selected finish
  const galleryItems = [
    {
      id: "hero",
      title: "Chassis Angle",
      subtitle: selectedColor === "dark" ? "Dark Slate" : "Arctic White",
      src:
        selectedColor === "dark"
          ? config.productImageDark || "/bravon-pos9260-black.jpg"
          : config.productImageWhite || "/bravon-pos9260-white.jpg",
    },
    {
      id: "action",
      title: "In Action",
      subtitle: "Fulfillment Desk",
      src: config.productImageAction || "/bravon-shipping-action-v2.jpg",
    },
    {
      id: "anatomy",
      title: "Internal Anatomy",
      subtitle: "Head & Rollers",
      src: "/bravon-pos9260-anatomy-slate.png",
    },
    {
      id: "ports",
      title: "Interface Ports",
      subtitle: "Type-C & DC",
      src: "/bravon-pos9260-white-back.jpg",
    },
    {
      id: "unboxing",
      title: "In The Box",
      subtitle: "Complete Kit",
      src: config.productImageInBox || "/bravon-in-the-box-v3.jpg",
    },
  ];

  const currentGalleryItem = galleryItems[activeGalleryIndex] || galleryItems[0];
  const currentPrice = config.price || 100;
  const currentComparePrice = config.comparePrice || 149;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color: selectedColor, quantity: qty }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Unable to reach Stripe checkout server. Please check your network connection.");
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", paddingTop: "56px", paddingBottom: "90px", overflowX: "hidden", width: "100%", maxWidth: "100%" }}>
      {/* Sub-header Breadcrumb — Minimalist & Harmonized (No Green) */}
      <div style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#FAFAFC", width: "100%", overflowX: "hidden" }}>
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
            <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "#0F172A", fontWeight: 600 }}>{config.productName ? config.productName.replace("Bravon ", "").replace(" Thermal Printer", "") : "POS-9260-L"}</span>
          </div>

          {/* Sophisticated Stock Status Badge (Muted Slate / Live Purple Dot) */}
          <span
            style={{
              fontSize: "0.8rem",
              color: "#0F172A",
              backgroundColor: "#F1F5F9",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              padding: "4px 12px",
              borderRadius: "980px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "var(--bravon-purple)",
                display: "inline-block",
              }}
            />
            {config.stockStatus || "In Stock · Ready to Ship"}
          </span>
        </div>
      </div>

      {/* Main Single-Product Buy Experience */}
      <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "28px 16px 48px", width: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr",
            gap: "40px",
            alignItems: "flex-start",
            width: "100%",
            maxWidth: "100%",
          }}
          className="product-page-grid"
        >
          {/* LEFT: INTERACTIVE PRODUCT GALLERY (Single Stage + 5 Multi-Angle Thumbnails) */}
          <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
            {/* Main Stage Display Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "24px",
                padding: "28px 16px 20px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 15px 45px -10px rgba(15, 23, 42, 0.06)",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {/* Badge Overlay */}
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  backgroundColor: "#FAFAFC",
                  padding: "5px 12px",
                  borderRadius: "980px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--bravon-purple)",
                  border: "1px solid rgba(124, 58, 237, 0.15)",
                  zIndex: 2,
                }}
              >
                {currentGalleryItem.title} · {currentGalleryItem.subtitle}
              </div>

              {/* Main Preview Image */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "340px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
              >
                <Image
                  key={`${currentGalleryItem.id}-${selectedColor}`}
                  src={currentGalleryItem.src}
                  alt={`${config.productName} - ${currentGalleryItem.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  style={{
                    objectFit: "contain",
                    padding: "8px",
                  }}
                  priority
                />
              </div>

              {/* Multi-Angle Interactive Thumbnails Strip */}
              <div
                className="gallery-thumbnail-strip"
                style={{
                  display: "flex",
                  gap: "8px",
                  width: "100%",
                  maxWidth: "100%",
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  paddingBottom: "4px",
                  boxSizing: "border-box",
                }}
              >
                {galleryItems.map((item, index) => {
                  const isActive = activeGalleryIndex === index;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveGalleryIndex(index)}
                      style={{
                        flex: "0 0 auto",
                        minWidth: "74px",
                        padding: "7px 10px",
                        borderRadius: "12px",
                        border: isActive
                          ? "2px solid var(--bravon-purple)"
                          : "1px solid rgba(0, 0, 0, 0.08)",
                        backgroundColor: isActive ? "var(--bravon-purple-subtle)" : "#FAFAFC",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                        transition: "all 0.2s ease",
                      }}
                      aria-label={`View ${item.title}`}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: isActive ? "var(--bravon-purple)" : "#0F172A",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.title}
                      </span>
                      <span
                        style={{
                          fontSize: "0.64rem",
                          color: "var(--text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: BUY BOX & INSTANT CHECKOUT (Clean & Focused) */}
          <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
            {/* Category Eyebrow */}
            <div style={{ marginBottom: "8px" }}>
              <span className="eyebrow" style={{ display: "inline-block" }}>
                {config.productTagline || "Portable Thermal Label & Slip Printer"}
              </span>
            </div>

            {/* Product Title */}
            <h1
              style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#0F172A",
                lineHeight: 1.15,
                marginBottom: "8px",
              }}
            >
              {config.productName}
            </h1>

            {/* Merchant Rating Badge (Anchor to Reviews Section) */}
            <a
              href="#reviews"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "14px",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>4.9</span>
              <span style={{ fontSize: "0.82rem", color: "#64748B" }}>
                (Verified Merchant Reviews)
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#7C3AED",
                  backgroundColor: "rgba(124, 58, 237, 0.08)",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  marginLeft: "4px",
                }}
              >
                Top Rated
              </span>
            </a>

            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "20px" }}>
              {config.productDescription}
            </p>

            {/* Price Anchor Box — Clean Purple Tint Badge with Dynamic Math */}
            <div
              style={{
                backgroundColor: "#FAFAFC",
                borderRadius: "18px",
                padding: "16px 20px",
                marginBottom: "24px",
                border: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span style={{ fontSize: "2.4rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em" }}>
                    {config.currencySymbol || "$"}{currentPrice * qty}
                  </span>
                  {currentComparePrice > currentPrice && (
                    <span style={{ fontSize: "1.2rem", color: "var(--text-tertiary)", textDecoration: "line-through" }}>
                      {config.currencySymbol || "$"}{currentComparePrice * qty}
                    </span>
                  )}
                </div>
              </div>
              {currentComparePrice > currentPrice && (
                <span
                  style={{
                    backgroundColor: "var(--bravon-purple-subtle)",
                    color: "var(--bravon-purple)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    padding: "6px 14px",
                    borderRadius: "980px",
                    border: "1px solid rgba(124, 58, 237, 0.2)",
                  }}
                >
                  Save ${(currentComparePrice - currentPrice) * qty} Today
                </span>
              )}
            </div>

            {/* SINGLE Finish Selector (No duplicates) */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>
                  Select Finish:
                </label>
                <span style={{ fontSize: "0.82rem", color: "var(--bravon-purple)", fontWeight: 600 }}>
                  {selectedColor === "white" ? config.whiteColorLabel : config.darkColorLabel}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {/* Dark Slate Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedColor("dark");
                    setActiveGalleryIndex(0);
                  }}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "16px",
                    border: selectedColor === "dark" ? "2px solid var(--bravon-purple)" : "1px solid rgba(0,0,0,0.1)",
                    backgroundColor: selectedColor === "dark" ? "var(--bravon-purple-subtle)" : "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 0.2s ease",
                    boxShadow: selectedColor === "dark" ? "0 4px 14px rgba(124, 58, 237, 0.12)" : "none",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      backgroundColor: "#2B3245",
                      border: "2px solid rgba(0,0,0,0.2)",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A", margin: 0 }}>
                      {config.darkColorLabel || "Dark Slate"}
                    </p>
                    <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", margin: 0 }}>
                      Stealth matte finish
                    </p>
                  </div>
                </button>

                {/* Arctic White Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedColor("white");
                    setActiveGalleryIndex(0);
                  }}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "16px",
                    border: selectedColor === "white" ? "2px solid var(--bravon-purple)" : "1px solid rgba(0,0,0,0.1)",
                    backgroundColor: selectedColor === "white" ? "var(--bravon-purple-subtle)" : "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 0.2s ease",
                    boxShadow: selectedColor === "white" ? "0 4px 14px rgba(124, 58, 237, 0.12)" : "none",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      backgroundColor: "#FFFFFF",
                      border: "2px solid #D1D5DB",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A", margin: 0 }}>
                      {config.whiteColorLabel || "Arctic White"}
                    </p>
                    <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", margin: 0 }}>
                      Clean studio finish
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>
                Quantity:
              </label>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1.5px solid rgba(0,0,0,0.1)",
                  borderRadius: "980px",
                  padding: "4px 8px",
                  backgroundColor: "#FAFAFC",
                }}
              >
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span style={{ padding: "0 16px", fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Primary High-Impact Checkout Button */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="btn-apple-primary"
              style={{
                width: "100%",
                padding: "16px 28px",
                fontSize: "1.1rem",
                fontWeight: 700,
                borderRadius: "980px",
                backgroundColor: "var(--bravon-purple)",
                boxShadow: "0 8px 24px rgba(124, 58, 237, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "12px",
                cursor: "pointer",
              }}
            >
              <Lock size={18} />
              {loading ? "Connecting to Stripe..." : `Buy with Stripe — $${currentPrice * qty}`}
            </button>

            {/* Stripe Security Note */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <p style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", margin: 0 }}>
                <span>🔒 Guaranteed Safe & Secure 256-bit Checkout via Stripe</span>
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                Supports Apple Pay · Google Pay · Visa · Mastercard · Amex
              </p>
            </div>

            {/* Confidence Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={16} color="var(--bravon-purple)" />
                <span style={{ fontSize: "0.8rem", color: "#0F172A", fontWeight: 600 }}>
                  Free Priority Dispatch
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={16} color="var(--bravon-purple)" />
                <span style={{ fontSize: "0.8rem", color: "#0F172A", fontWeight: 600 }}>
                  2-Year Warranty Portal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BELOW-THE-FOLD: COMPREHENSIVE FEATURES & DESCRIPTIONS          */}
        {/* ============================================================== */}
        <section style={{ marginTop: "70px", paddingTop: "50px", borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span className="eyebrow" style={{ marginBottom: "8px", display: "block" }}>
              Commercial Architecture
            </span>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.025em", color: "#0F172A", marginBottom: "12px" }}>
              Precision labeling in a palm-sized chassis.
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "620px", margin: "0 auto", lineHeight: 1.6 }}>
              Built for mobile workers, high-volume e-commerce shipping, and field logistics with zero consumable costs.
            </p>
          </div>

          {/* 3 Spacious Feature Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
              marginBottom: "56px",
            }}
            className="product-feature-grid"
          >
            {/* Feature 1: Portability */}
            <div
              style={{
                backgroundColor: "#FAFAFC",
                borderRadius: "20px",
                padding: "28px 24px",
                border: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  backgroundColor: "var(--bravon-purple-subtle)",
                  color: "var(--bravon-purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Maximize2 size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                Palm-Sized Portability
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>
                With a paperless storage design, it boasts a sleek, space-saving body that fits easily in a hand or bag—ideal for on-the-go labeling, small business packing tables, and field operations.
              </p>
              <div style={{ marginTop: "auto", paddingTop: "8px", fontSize: "0.8rem", fontWeight: 600, color: "var(--bravon-purple)" }}>
                180 × 78 × 75 mm • 1.55kg unit weight
              </div>
            </div>

            {/* Feature 2: Universal Width */}
            <div
              style={{
                backgroundColor: "#FAFAFC",
                borderRadius: "20px",
                padding: "28px 24px",
                border: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  backgroundColor: "var(--bravon-purple-subtle)",
                  color: "var(--bravon-purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sliders size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                30–110mm Universal Media
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>
                Supports paper widths from 30mm to 110mm (up to 104mm printable width). Accommodates standard 4x6" shipping labels, self-adhesive stickers, barcodes, and continuous slips.
              </p>
              <div style={{ marginTop: "auto", paddingTop: "8px", fontSize: "0.8rem", fontWeight: 600, color: "var(--bravon-purple)" }}>
                160mm/s Speed • 203 DPI line thermal
              </div>
            </div>

            {/* Feature 3: Auto-Retraction */}
            <div
              style={{
                backgroundColor: "#FAFAFC",
                borderRadius: "20px",
                padding: "28px 24px",
                border: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  backgroundColor: "var(--bravon-purple-subtle)",
                  color: "var(--bravon-purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RotateCcw size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                Auto-Retract Paper Setup
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>
                The easy-open lid simplifies drop-in media loading. When closed, the printer automatically retracts the first sheet of thermal paper to ensure seamless alignment and zero wasted labels.
              </p>
              <div style={{ marginTop: "auto", paddingTop: "8px", fontSize: "0.8rem", fontWeight: 600, color: "var(--bravon-purple)" }}>
                Japanese printhead • Vulcanized roller
              </div>
            </div>
          </div>

          {/* VISUAL DEEP DIVE 1: REAL-WORLD SHIPPING & FULFILLMENT */}
          <div
            style={{
              backgroundColor: "#FAFAFC",
              borderRadius: "24px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr",
              gap: "36px",
              alignItems: "center",
              marginBottom: "40px",
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "100%",
            }}
            className="product-page-grid product-deep-card"
          >
            <div
              className="product-deep-card-img"
              style={{
                position: "relative",
                width: "100%",
                height: "340px",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 12px 36px -8px rgba(15, 23, 42, 0.12)",
              }}
            >
              <Image
                src={config.productImageAction || "/bravon-shipping-action-v2.jpg"}
                alt={`${config.productName || "Bravon POS-9260-L"} on packing station printing 4x6 shipping labels`}
                fill
                sizes="(max-width: 768px) 100vw, 550px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div style={{ minWidth: 0, width: "100%" }}>
              <span className="eyebrow" style={{ marginBottom: "8px", display: "inline-block" }}>
                Commercial High-Volume Output
              </span>
              <h3
                style={{
                  fontSize: "clamp(1.3rem, 2.5vw, 1.75rem)",
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "-0.02em",
                  marginBottom: "12px",
                  lineHeight: 1.25,
                }}
              >
                Print 4×6″ shipping labels in under two seconds.
              </h3>
              <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "18px" }}>
                Engineered specifically for active e-commerce fulfillment desks, logistics centers, and retail shipping stations. Generates high-density, smudge-free barcodes that scan with 100% accuracy on USPS, UPS, FedEx, DHL, Shopify, and Amazon logistics scanners.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.86rem", color: "#0F172A" }}>
                  <CheckCircle2 size={16} color="var(--bravon-purple)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span><strong>Zero consumable overhead:</strong> Direct thermal line head eliminates ink cartridges and toner.</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.86rem", color: "#0F172A" }}>
                  <CheckCircle2 size={16} color="var(--bravon-purple)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span><strong>Adaptive media guide:</strong> 30mm to 110mm dual-slider supports stickers, receipts, and tags.</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.86rem", color: "#0F172A" }}>
                  <CheckCircle2 size={16} color="var(--bravon-purple)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span><strong>High-speed continuous feed:</strong> 160mm/s continuous throughput without heat throttling.</span>
                </div>
              </div>
            </div>
          </div>

          {/* VISUAL DEEP DIVE 2: COMPLETE PACKAGE CONTENTS */}
          <div
            style={{
              backgroundColor: "#FAFAFC",
              borderRadius: "24px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              display: "grid",
              gridTemplateColumns: "1fr 1.1fr",
              gap: "36px",
              alignItems: "center",
              marginBottom: "20px",
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "100%",
            }}
            className="product-page-grid product-deep-card"
          >
            <div style={{ minWidth: 0, width: "100%" }}>
              <span className="eyebrow" style={{ marginBottom: "8px", display: "inline-block" }}>
                Unboxing & Contents
              </span>
              <h3
                style={{
                  fontSize: "clamp(1.3rem, 2.5vw, 1.75rem)",
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "-0.02em",
                  marginBottom: "12px",
                  lineHeight: 1.25,
                }}
              >
                Everything included. Ready out of the box.
              </h3>
              <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "18px" }}>
                Open the box and start printing right away. Every {config.productName || "Bravon POS-9260-L"} shipment includes commercial-grade cables, external label stand, power supply, and official documentation:
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  `${config.productName || "Bravon POS-9260-L"} (${selectedColor === "dark" ? config.darkColorLabel || "Dark Slate" : config.whiteColorLabel || "Arctic White"})`,
                  "Multi-Functional External Label Roll & Fanfold Stand",
                  "Official Bravon POS-9260-L User Manual & Setup Guide",
                  "DC 24V / 2.5A High-Efficiency Power Adapter & Wall Cable",
                  "High-Speed USB Type-C to USB-A Connection Cable",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.85rem", color: "#0F172A" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--bravon-purple)", flexShrink: 0, marginTop: "6px" }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: "18px", fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                Gross Shipping Weight: 1.55 kg (3.42 lbs) · 100% Recyclable Packaging
              </div>
            </div>
            <div
              className="product-deep-card-img"
              style={{
                position: "relative",
                width: "100%",
                height: "340px",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 12px 36px -8px rgba(15, 23, 42, 0.12)",
              }}
            >
              <Image
                src={config.productImageInBox || "/bravon-in-the-box-v3.jpg"}
                alt={`${config.productName || "Bravon POS-9260-L"} What's In The Box: Thermal Printer, Multi-Format Label Stand, Official Bravon User Manual, Power Adapter, USB Type-C Cable`}
                fill
                sizes="(max-width: 768px) 100vw, 550px"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </section>

        {/* Customer Reviews & Verified Merchant Ratings */}
        <ReviewsSection productName={config.productName || "Bravon POS-9260-L"} defaultColor={selectedColor} />
      </main>

      {/* STICKY BOTTOM MOBILE BUY BAR */}
      <div
        className="sticky-mobile-buy-bar"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0, 0, 0, 0.08)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.06)",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 auto", marginRight: "10px" }}>
          <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "#0F172A", margin: 0, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {config.productName || "Bravon POS-9260-L"}
          </p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>
            <strong style={{ color: "#0F172A" }}>${currentPrice * qty}</strong> · {selectedColor === "dark" ? config.darkColorLabel : config.whiteColorLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="btn-apple-primary"
          style={{
            flexShrink: 0,
            padding: "10px 18px",
            fontSize: "0.88rem",
            fontWeight: 700,
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          {loading ? "..." : `Buy Now — $${currentPrice * qty}`}
        </button>
      </div>

      {/* Scoped CSS for Responsive Grid */}
      <style>{`
        .sticky-mobile-buy-bar {
          display: none !important;
        }

        .product-deep-card {
          padding: 40px 32px;
        }

        .gallery-thumbnail-strip::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 850px) {
          .product-page-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 24px !important;
          }
          .product-feature-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 16px !important;
          }
          .product-deep-card {
            padding: 22px 16px !important;
          }
          .product-deep-card-img {
            height: 220px !important;
          }
          .sticky-mobile-buy-bar {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
