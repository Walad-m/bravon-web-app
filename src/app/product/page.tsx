"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useSiteConfig } from "@/context/ConfigContext";

export default function ProductPage() {
  const { config } = useSiteConfig();
  const [selectedColor, setSelectedColor] = useState<"white" | "dark">(config.defaultColor || "white");
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  // Sync default color if config changes
  useEffect(() => {
    if (config.defaultColor) {
      setSelectedColor(config.defaultColor);
    }
  }, [config.defaultColor]);

  const printerOptions = [
    {
      id: "white",
      color: "white" as const,
      title: config.whiteColorLabel || "Arctic White",
      subtitle: "Flagship Edition",
      src: config.productImageWhite || "/exact-printer-white.png",
      badgeColor: "#F3F4F6",
      dotBg: "#FFFFFF",
      dotBorder: "#D1D5DB",
    },
    {
      id: "dark",
      color: "dark" as const,
      title: config.darkColorLabel || "Dark Slate",
      subtitle: "Stealth Edition",
      src: config.productImageDark || "/exact-printer-dark.png",
      badgeColor: "#2B3245",
      dotBg: "#2B3245",
      dotBorder: "rgba(0,0,0,0.2)",
    },
  ];

  const currentPrinter = selectedColor === "white" ? printerOptions[0] : printerOptions[1];

  const handleSelectColor = (color: "white" | "dark") => {
    setSelectedColor(color);
  };

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
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", paddingTop: "56px", paddingBottom: "80px" }}>
      {/* Sub-header Breadcrumb */}
      <div style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "var(--bg-apple)" }}>
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "#1D1D1F", fontWeight: 600 }}>{config.productName}</span>
          </div>
          <span
            style={{
              fontSize: "0.82rem",
              color: "#059669",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              padding: "4px 10px",
              borderRadius: "980px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
            {config.stockStatus}
          </span>
        </div>
      </div>

      {/* Main Single-Product Buy Experience */}
      <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "40px 20px 40px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr",
            gap: "48px",
            alignItems: "flex-start",
          }}
          className="product-page-grid"
        >
          {/* LEFT: PRINTER HARDWARE SHOWCASE (Strictly 2 Printers Only) */}
          <div>
            {/* Main Stage Display Card */}
            <div
              style={{
                backgroundColor: "var(--bg-apple)",
                borderRadius: "24px",
                padding: "40px 24px 32px",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
              }}
            >
              {/* Badge Overlay */}
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  backgroundColor: "#FFFFFF",
                  padding: "6px 14px",
                  borderRadius: "980px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--bravon-purple)",
                  border: "1px solid rgba(124, 58, 237, 0.15)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  zIndex: 2,
                }}
              >
                {currentPrinter.title} · {currentPrinter.subtitle}
              </div>

              {/* Main Printer Image */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "350px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
              >
                <Image
                  key={selectedColor}
                  src={currentPrinter.src}
                  alt={`${config.productName} - ${currentPrinter.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  style={{
                    objectFit: "contain",
                    padding: "12px",
                  }}
                  priority
                />
              </div>

              {/* Caption */}
              <p
                style={{
                  marginTop: "16px",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  fontWeight: 500,
                }}
              >
                Selected: <strong style={{ color: "#1D1D1F" }}>{currentPrinter.title}</strong> Edition
              </p>
            </div>

            {/* 2-Option Printer Selector Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginTop: "16px",
              }}
              className="printer-selector-strip"
            >
              {printerOptions.map((opt) => {
                const isSelected = selectedColor === opt.color;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectColor(opt.color)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "16px",
                      border: isSelected
                        ? "2px solid var(--bravon-purple)"
                        : "1px solid rgba(0,0,0,0.1)",
                      backgroundColor: isSelected ? "var(--bravon-purple-subtle)" : "#FFFFFF",
                      cursor: "pointer",
                      textAlign: "left",
                      boxShadow: isSelected ? "0 4px 14px rgba(124,58,237,0.15)" : "none",
                      transition: "all 0.2s ease",
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    aria-label={`Select ${opt.title}`}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "50px",
                        height: "50px",
                        backgroundColor: "var(--bg-apple)",
                        borderRadius: "10px",
                        overflow: "hidden",
                        flexShrink: 0,
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <Image
                        src={opt.src}
                        alt={opt.title}
                        fill
                        sizes="50px"
                        style={{ objectFit: "contain", padding: "3px" }}
                      />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: opt.dotBg,
                            border: `1px solid ${opt.dotBorder}`,
                            display: "inline-block",
                          }}
                        />
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem", color: "#1D1D1F" }}>
                          {opt.title}
                        </p>
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {opt.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Direct Link to Technical Specifications on Main Page */}
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                backgroundColor: "var(--bg-apple)",
                borderRadius: "14px",
                border: "1px solid rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Looking for dimensions & hardware specs?
              </span>
              <Link
                href="/#specs"
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--bravon-purple)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                View Specs on Home →
              </Link>
            </div>
          </div>

          {/* RIGHT: BUY BOX & INSTANT CHECKOUT */}
          <div>
            {/* Category Eyebrow (No reviews) */}
            <div style={{ marginBottom: "10px" }}>
              <span className="eyebrow" style={{ display: "inline-block" }}>
                {config.productTagline}
              </span>
            </div>

            {/* Product Title */}
            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 2.6rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#1D1D1F",
                lineHeight: 1.15,
                marginBottom: "12px",
              }}
            >
              {config.productName}
            </h1>

            <p style={{ fontSize: "0.98rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "24px" }}>
              {config.productDescription}
            </p>

            {/* Price Anchor Box */}
            <div
              style={{
                backgroundColor: "var(--bg-apple)",
                borderRadius: "18px",
                padding: "18px 20px",
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
                  <span style={{ fontSize: "2.6rem", fontWeight: 800, color: "#1D1D1F", letterSpacing: "-0.03em" }}>
                    {config.currencySymbol || "$"}{currentPrice * qty}
                  </span>
                  {currentComparePrice > currentPrice && (
                    <span style={{ fontSize: "1.25rem", color: "var(--text-tertiary)", textDecoration: "line-through" }}>
                      {config.currencySymbol || "$"}{currentComparePrice * qty}
                    </span>
                  )}
                </div>
              </div>
              {config.saveAmountText && (
                <span
                  style={{
                    background: "#10B981",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    padding: "6px 14px",
                    borderRadius: "980px",
                    boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
                  }}
                >
                  {config.saveAmountText}
                </span>
              )}
            </div>

            {/* Finish Selector Cards */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1D1D1F" }}>
                  Select Finish:
                </label>
                <span style={{ fontSize: "0.85rem", color: "var(--bravon-purple)", fontWeight: 600 }}>
                  {selectedColor === "white" ? config.whiteColorLabel : config.darkColorLabel}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {/* Arctic White Card (Default) */}
                <button
                  type="button"
                  onClick={() => handleSelectColor("white")}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "16px",
                    border: selectedColor === "white" ? "2px solid var(--bravon-purple)" : "1.5px solid rgba(0,0,0,0.1)",
                    backgroundColor: selectedColor === "white" ? "var(--bravon-purple-subtle)" : "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 0.2s ease",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                    boxShadow: selectedColor === "white" ? "0 4px 12px rgba(124, 58, 237, 0.15)" : "none",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#FFFFFF",
                      border: "2px solid #D1D5DB",
                      display: "inline-block",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1D1D1F", margin: 0 }}>
                      {config.whiteColorLabel}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                      Clean modern finish
                    </p>
                  </div>
                </button>

                {/* Dark Slate Card */}
                <button
                  type="button"
                  onClick={() => handleSelectColor("dark")}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "16px",
                    border: selectedColor === "dark" ? "2px solid var(--bravon-purple)" : "1.5px solid rgba(0,0,0,0.1)",
                    backgroundColor: selectedColor === "dark" ? "var(--bravon-purple-subtle)" : "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 0.2s ease",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                    boxShadow: selectedColor === "dark" ? "0 4px 12px rgba(124, 58, 237, 0.15)" : "none",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#2B3245",
                      border: "2px solid rgba(0,0,0,0.2)",
                      display: "inline-block",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1D1D1F", margin: 0 }}>
                      {config.darkColorLabel}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                      Stealth matte finish
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1D1D1F" }}>
                Quantity:
              </label>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1.5px solid rgba(0,0,0,0.12)",
                  borderRadius: "980px",
                  padding: "4px 8px",
                  backgroundColor: "var(--bg-apple)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{
                    width: "34px",
                    height: "34px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "#1D1D1F",
                    touchAction: "manipulation",
                  }}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span style={{ padding: "0 18px", fontWeight: 700, fontSize: "1.05rem", color: "#1D1D1F" }}>
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  style={{
                    width: "34px",
                    height: "34px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "#1D1D1F",
                    touchAction: "manipulation",
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
                padding: "18px 28px",
                fontSize: "1.15rem",
                fontWeight: 700,
                borderRadius: "980px",
                backgroundColor: "var(--bravon-purple)",
                boxShadow: "0 8px 28px rgba(124, 58, 237, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "12px",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <Lock size={18} />
              {loading ? "Connecting to Stripe..." : `Buy with Stripe — $${currentPrice * qty}`}
            </button>

            {/* Stripe Security Note */}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <span>🔒 Guaranteed Safe & Secure 256-bit Checkout via Stripe</span>
              </p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                Supports Apple Pay · Google Pay · Visa · Mastercard · Amex
              </p>
            </div>
          </div>
        </div>
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
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0, 0, 0, 0.08)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              position: "relative",
              width: "44px",
              height: "44px",
              backgroundColor: "var(--bg-apple)",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.08)",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Image
              src={selectedColor === "white" ? "/exact-printer-white.png" : "/exact-printer-dark.png"}
              alt="Bravon"
              fill
              sizes="44px"
              style={{ objectFit: "contain", padding: "2px" }}
            />
          </div>
          <div>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1D1D1F", margin: 0, lineHeight: 1.2 }}>
              {config.productName.split(" ")[0]} Thermal
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
              <strong style={{ color: "#1D1D1F" }}>${currentPrice * qty}</strong> · {selectedColor === "white" ? config.whiteColorLabel : config.darkColorLabel}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="btn-apple-primary"
          style={{
            padding: "12px 22px",
            fontSize: "0.95rem",
            fontWeight: 700,
            whiteSpace: "nowrap",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {loading ? "..." : "Buy with Stripe"}
        </button>
      </div>

      {/* Scoped CSS for Responsive Grid & Sticky Bar */}
      <style>{`
        .sticky-mobile-buy-bar {
          display: none !important;
        }

        @media (max-width: 850px) {
          .product-page-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .sticky-mobile-buy-bar {
            display: flex !important;
          }
          .printer-selector-strip {
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
