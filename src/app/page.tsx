"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Shield,
  RotateCcw,
  Truck,
  CheckCircle2,
  Monitor,
  Smartphone,
  Globe,
  Apple,
  Download,
  Star,
} from "lucide-react";
import { useSiteConfig } from "@/context/ConfigContext";
import IPhoneMockup from "@/components/IPhoneMockup";
import DesktopAppMockup from "@/components/DesktopAppMockup";
import ProductInformationSection from "@/components/ProductInformationSection";


export default function HomePage() {
  const { config } = useSiteConfig();
  const [selectedColor, setSelectedColor] = useState<"dark" | "white">(config.defaultColor || "dark");
  const [specsView, setSpecsView] = useState<"dual" | "white">("dual");

  useEffect(() => {
    if (config.defaultColor) {
      setSelectedColor(config.defaultColor);
    }
  }, [config.defaultColor]);

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "var(--text-primary)" }}>
      {/* Maintenance Mode Alert Banner if active */}
      {config.maintenanceMode && (
        <div
          style={{
            marginTop: "56px",
            backgroundColor: "#FEF2F2",
            borderBottom: "1px solid #FCA5A5",
            textAlign: "center",
            padding: "12px 16px",
            fontSize: "0.88rem",
            fontWeight: 600,
            color: "#991B1B",
          }}
        >
          ⚠️ Store Maintenance: {config.maintenanceMessage || "We are currently restocking and updating the store."}
        </div>
      )}

      {/* Top Banner (Apple-style subtle announcement) */}
      {config.showAnnouncement && !config.maintenanceMode && (
        <div
          style={{
            marginTop: "56px",
            backgroundColor: "var(--bg-apple)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
            textAlign: "center",
            padding: "10px 16px",
            fontSize: "0.84rem",
            color: "var(--text-secondary)",
            lineHeight: 1.4,
          }}
        >
          {config.announcementTag && (
            <span style={{ fontWeight: 600, color: "var(--bravon-purple)" }}>{config.announcementTag}:</span>
          )}{" "}
          {config.announcementText}
        </div>
      )}

      {/* 1. HERO SECTION — Minimalist Editorial Typography */}
      <section
        id="overview"
        style={{
          padding: config.showAnnouncement ? "48px 16px 20px" : "104px 16px 20px",
          textAlign: "center",
          maxWidth: "1050px",
          margin: "0 auto",
        }}
        className="hero-section-container"
      >
        <p className="eyebrow" style={{ marginBottom: "10px" }}>
          {config.heroEyebrow || (config.productName ? `${config.productName} · Commercial Thermal Label Printer` : "Bravon POS-9260-L · Commercial Thermal Label Printer")}
        </p>
        <h1 className="headline-hero" style={{ marginBottom: "16px" }}>
          {config.heroHeadline || config.productTagline || "Portable precision. Palm-sized power."}
        </h1>
        <p className="headline-sub" style={{ maxWidth: "680px", margin: "0 auto 24px" }}>
          {config.heroSubhead || config.productDescription || "A compact, multifunctional device combining portability and 160mm/s efficiency in a palm-sized body. Supports 30–110mm media width with auto-retract paper setup and zero ink."}
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
          className="hero-actions-container"
        >
          <Link href="/product" className="btn-apple-primary hero-btn-mobile">
            Buy Bravon — {config.currencySymbol || "$"}{config.price}
          </Link>
          <a href="#in-action" className="btn-apple-secondary hero-btn-mobile">
            See in Action <ArrowRight size={16} />
          </a>
        </div>

        {/* Color Finish Selector */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-apple)",
            padding: "5px 12px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            maxWidth: "100%",
          }}
        >
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", paddingLeft: "4px" }}>
            Finish:
          </span>
          <button
            type="button"
            onClick={() => setSelectedColor("white")}
            className={`color-swatch-btn ${selectedColor === "white" ? "active" : ""}`}
            style={{
              padding: "6px 12px",
              fontSize: "0.84rem",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                display: "inline-block",
                border: "1px solid #D1D5DB",
              }}
            />
            {config.whiteColorLabel}
          </button>
          <button
            type="button"
            onClick={() => setSelectedColor("dark")}
            className={`color-swatch-btn ${selectedColor === "dark" ? "active" : ""}`}
            style={{
              padding: "6px 12px",
              fontSize: "0.84rem",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#2B3245",
                display: "inline-block",
                border: "1px solid rgba(0,0,0,0.2)",
              }}
            />
            {config.darkColorLabel}
          </button>
        </div>
      </section>

      {/* 2. MASTER COMMERCIAL PRODUCT SHOWCASE (Unified Studio Shot) */}
      <section
        style={{
          maxWidth: "1340px",
          margin: "0 auto 60px",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            position: "relative",
            borderRadius: "28px",
            overflow: "hidden",
            boxShadow: "0 20px 60px -15px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* High-Resolution Commercial Studio Shot */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
            <Image
              src={selectedColor === "dark" ? (config.heroImageDark || "/bravon-ecosystem-dark.jpg") : (config.heroImageWhite || "/bravon-ecosystem-white.jpg")}
              alt={`Bravon Commercial Thermal Printer in ${selectedColor === "dark" ? (config.darkColorLabel || "Dark Slate") : (config.whiteColorLabel || "Arctic White")}`}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>

          {/* Bottom Highlights Strip (Responsive 2x2 grid on mobile) */}
          <div className="hero-highlights-strip">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} color="var(--bravon-purple)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1D1D1F" }}>
                160mm/s Lightning Speed
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} color="var(--bravon-purple)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1D1D1F" }}>
                Auto-Retract Paper Setup
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} color="var(--bravon-purple)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1D1D1F" }}>
                30–110mm Width (104mm Max)
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} color="var(--bravon-purple)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1D1D1F" }}>
                Mac, Windows, iOS & Android
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRINTER IN ACTION — PALM-SIZED COMMERCIAL PORTABILITY */}
      <section
        id="in-action"
        style={{
          maxWidth: "1280px",
          margin: "0 auto 80px",
          padding: "0 16px",
        }}
      >
        <div className="action-grid-container">
          {/* Action Photo */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16/9",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Image
              src={config.productImageAction || "/bravon-shipping-action-v2.jpg"}
              alt={`${config.productName || "Bravon POS-9260-L"} Portable Thermal Label Printer in compact workspace`}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Action Copy */}
          <div>
            <span className="eyebrow" style={{ marginBottom: "8px", display: "block" }}>
              {config.featureSectionEyebrow || "Palm-Sized Multifunctional Design"}
            </span>
            <h2 className="section-title-responsive" style={{ fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "14px", color: "#1D1D1F" }}>
              {config.featureSectionHeadline || "Compact portability meets high-speed efficiency."}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", lineHeight: 1.6, marginBottom: "20px" }}>
              {config.featureSectionBody1 || `With a paperless storage design, the ${config.productName || "Bravon POS-9260-L"} boasts a sleek, space-saving body that fits easily in a hand or bag—making it ideal for mobile workers, small businesses, and field logistics.`}
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "24px" }}>
              {config.featureSectionBody2 || "It supports a paper width range of 30–110mm (up to 104mm max printable size), accommodating various thermal receipt, slip, and label papers, including 4x6\" shipping labels, self-adhesive stickers, and barcodes."}
            </p>

            {/* Quick Benefits List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {[
                "Easy-open lid simplifies loading; printer automatically retracts the first sheet when closed",
                "Internal precision print head, paper regulator, and rubber roller ensure stable, clear prints",
                "160mm/s thermal line printing with zero ink, zero toner, and zero ribbon costs",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "rgba(124, 58, 237, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px", flexShrink: 0 }}>
                    <CheckCircle2 size={12} color="var(--bravon-purple)" />
                  </div>
                  <span style={{ fontSize: "0.92rem", color: "#1D1D1F", fontWeight: 500 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link href="/product" className="btn-apple-primary hero-btn-mobile">
              Order {config.productName || "Bravon POS-9260-L"} ({config.currencySymbol || "$"}{config.price})
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT INFORMATION & DIMENSIONAL HARDWARE ANATOMY */}
      <ProductInformationSection />

      {/* 5. HARDWARE SPECIFICATIONS & ENGINEERING BLUEPRINT */}
      <section
        id="specs"
        style={{
          maxWidth: "1280px",
          margin: "0 auto 90px",
          padding: "0 16px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="eyebrow" style={{ marginBottom: "8px", display: "block" }}>
            {config.specsEyebrow || "Hardware Engineering & Specs"}
          </span>
          <h2 className="section-title-responsive" style={{ fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "14px", color: "#1D1D1F" }}>
            {config.specsHeadline || "Precision engineered down to the millimeter."}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "680px", margin: "0 auto" }}>
            Designed for commercial reliability, whisper-quiet operation, and zero consumable costs. Every component is built for speed and longevity.
          </p>
        </div>

        {/* Blueprint Visual Showcase Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "28px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            padding: "36px 32px 32px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.04)",
            marginBottom: "40px",
            position: "relative",
            overflow: "hidden",
          }}
          className="blueprint-card-container"
        >
          {/* Blueprint Header with View Switcher */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "24px",
              paddingBottom: "18px",
              borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--bravon-purple)",
                  backgroundColor: "var(--bravon-purple-subtle)",
                  padding: "4px 10px",
                  borderRadius: "980px",
                  display: "inline-block",
                  marginBottom: "6px",
                }}
              >
                Dimensional Blueprint
              </span>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1D1D1F", margin: 0 }}>
                180mm × 78mm × 75mm Compact Chassis
              </h3>
            </div>

            {/* View Switcher Tabs */}
            <div
              style={{
                display: "inline-flex",
                backgroundColor: "var(--bg-apple)",
                padding: "4px",
                borderRadius: "980px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
              }}
            >
              <button
                type="button"
                onClick={() => setSpecsView("dual")}
                style={{
                  padding: "6px 14px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  borderRadius: "980px",
                  border: "none",
                  backgroundColor: specsView === "dual" ? "#FFFFFF" : "transparent",
                  color: specsView === "dual" ? "#1D1D1F" : "var(--text-secondary)",
                  boxShadow: specsView === "dual" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  touchAction: "manipulation",
                }}
              >
                Dual Edition Blueprint
              </button>
              <button
                type="button"
                onClick={() => setSpecsView("white")}
                style={{
                  padding: "6px 14px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  borderRadius: "980px",
                  border: "none",
                  backgroundColor: specsView === "white" ? "#FFFFFF" : "transparent",
                  color: specsView === "white" ? "#1D1D1F" : "var(--text-secondary)",
                  boxShadow: specsView === "white" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  touchAction: "manipulation",
                }}
              >
                Arctic White View
              </button>
            </div>
          </div>

          {/* Blueprint Graphic */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16/9",
              minHeight: "320px",
              maxHeight: "560px",
              borderRadius: "18px",
              overflow: "hidden",
              backgroundColor: "#FAFAFC",
              border: "1px solid rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={specsView === "dual" ? "/bravon-hardware-specs.png" : "/bravon-specs-white.png"}
              alt="Bravon Commercial Thermal Printer Dimensional Blueprint & Hardware Specifications"
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              style={{ objectFit: "contain", padding: "12px" }}
              priority
            />
          </div>

          {/* Quick Hardware Highlights Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(0, 0, 0, 0.06)",
            }}
            className="blueprint-subgrid"
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0 0 4px" }}>
                Physical Dimensions
              </p>
              <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1D1D1F", margin: 0 }}>
                180 × 78 × 75 mm
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0 0 4px" }}>
                Supported Media Widths
              </p>
              <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1D1D1F", margin: 0 }}>
                30–110 mm (1.18"–4.33")
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0 0 4px" }}>
                Thermal Head Life
              </p>
              <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--bravon-purple)", margin: 0 }}>
                User-Replaceable Head
              </p>
            </div>
          </div>
        </div>

        {/* 4 Apple-Style Key Metrics */}
        <div className="specs-metric-grid" style={{ marginBottom: "50px" }}>
          {/* Metric 1 */}
          <div className="spec-metric-card">
            <div className="spec-metric-number">
              160 mm/s
            </div>
            <p className="spec-metric-title">
              High-Speed Throughput
            </p>
            <div className="spec-metric-divider" />
            <p className="spec-metric-desc">
              Print a full 4"x6" shipping label in 1.2s. Up to 72 labels per minute continuous output.
            </p>
          </div>

          {/* Metric 2 */}
          <div className="spec-metric-card">
            <div className="spec-metric-number">
              203 DPI
            </div>
            <p className="spec-metric-title">
              Thermal Density
            </p>
            <div className="spec-metric-divider" />
            <p className="spec-metric-desc">
              8 dots/mm commercial printhead. 100% scannable UPC, Code128, QR & Data Matrix barcodes.
            </p>
          </div>

          {/* Metric 3 */}
          <div className="spec-metric-card">
            <div className="spec-metric-number" style={{ color: "var(--bravon-purple)" }}>
              $0.00
            </div>
            <p className="spec-metric-title">
              Zero Ink or Toner Ever
            </p>
            <div className="spec-metric-divider" />
            <p className="spec-metric-desc">
              Direct thermal heat transfer. Save hundreds of dollars every year on ink cartridges.
            </p>
          </div>

          {/* Metric 4 */}
          <div className="spec-metric-card">
            <div className="spec-metric-number">
              30–110<span style={{ fontSize: "1.3rem" }}>mm</span>
            </div>
            <p className="spec-metric-title">
              Universal Width
            </p>
            <div className="spec-metric-divider" />
            <p className="spec-metric-desc">
              Accommodates retail price tags, round badges, custom die-cuts, and standard 4"x6" labels.
            </p>
          </div>
        </div>

        {/* Comprehensive Technical Specification Sheet */}
        <div
          style={{
            backgroundColor: "var(--bg-apple)",
            borderRadius: "28px",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            padding: "40px 32px",
          }}
          className="specs-table-container"
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <span className="eyebrow" style={{ marginBottom: "6px", display: "block" }}>
              Comprehensive Specs
            </span>
            <h3 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#1D1D1F", margin: 0 }}>
              Complete Hardware Reference
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px 36px",
            }}
            className="specs-two-col-grid"
          >
            {/* Category 1: Printing Engine */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1D1D1F", marginBottom: "16px" }}>
                Printing Engine & Performance
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Model</span>
                  <span style={{ fontWeight: 700, color: "var(--bravon-purple)" }}>{config.productName ? config.productName.replace(" Thermal Printer", "") : "POS-9260-L (Bravon)"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Printing Method</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>Thermal Line Printing</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Black Print Speed</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>160 mm/s (max)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Resolution</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>203 DPI (8 dots/mm)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "2px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Style & Output</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>Monochrome (Black & White)</span>
                </div>
              </div>
            </div>

            {/* Category 2: Media & Paper Handling */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1D1D1F", marginBottom: "16px" }}>
                Media & Paper Handling
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Supported Paper Widths</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>30 mm – 110 mm</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Max Printable Paper Size</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>104 mm</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Supported Media Types</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>Shipping Labels, Stickers, Barcodes, Slips & Receipts</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "2px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Paper Loading Feature</span>
                  <span style={{ fontWeight: 600, color: "var(--bravon-purple)" }}>Auto-Retraction on Lid Close</span>
                </div>
              </div>
            </div>

            {/* Category 3: Chassis & Physical */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1D1D1F", marginBottom: "16px" }}>
                Chassis & Physical Dimensions
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Dimensions (L × W × H)</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>180 mm × 78 mm × 75 mm</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Private Mold</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>Yes (Custom Engineered)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Unit Weight</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>1.55 kg (with accessories)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "2px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Chassis Finishes</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>Arctic White · Dark Slate</span>
                </div>
              </div>
            </div>

            {/* Category 4: Connectivity & Support */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1D1D1F", marginBottom: "16px" }}>
                Connectivity & Support
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Data Interfaces</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>USB Type-C / BT / LAN / Wi-Fi (Optional)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Supported Platforms</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>macOS, Windows, iOS, Android, Linux</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Primary Use</span>
                  <span style={{ fontWeight: 600, color: "#1D1D1F" }}>Barcode Printer, Shipping & Slips</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "2px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>After-Sales Service</span>
                  <span style={{ fontWeight: 600, color: "var(--bravon-purple)" }}>Return & Replacement · Online Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. READY OUT OF THE BOX — WHAT'S IN THE BOX */}
      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto 80px",
          padding: "0 16px",
        }}
      >
        <div className="in-the-box-container">
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <span className="eyebrow" style={{ marginBottom: "8px", display: "block" }}>
              Everything Included
            </span>
            <h2 className="section-title-responsive" style={{ fontWeight: 700, letterSpacing: "-0.02em", color: "#1D1D1F", marginBottom: "8px" }}>
              Ready out of the box.
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Everything needed to start printing, including dedicated multi-format label stand.
            </p>
          </div>

          {/* Knolling Product Photograph */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16/9",
              borderRadius: "20px",
              overflow: "hidden",
              marginBottom: "28px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Image
              src={config.productImageInBox || "/bravon-in-the-box-v3.jpg"}
              alt={`${config.productName || "Bravon POS-9260-L"} Thermal Printer What's In The Box`}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* In-the-box items grid */}
          <div className="box-items-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            {[
              { title: config.productName ? config.productName.replace(" Thermal Printer", "") : "Bravon POS-9260-L", desc: "Commercial thermal hardware" },
              { title: "Multi-Format Stand", desc: "For roll & fanfold labels" },
              { title: "Official Manual", desc: "Bravon setup & driver guide" },
              { title: "Power Supply", desc: "24V heavy-duty DC adapter" },
              { title: "USB-C Data Cable", desc: "High-speed reversible connection" },
            ].map((boxItem, idx) => (
              <div
                key={idx}
                style={{
                  padding: "14px 12px",
                  borderRadius: "14px",
                  backgroundColor: "var(--bg-apple)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  textAlign: "center",
                }}
              >
                <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1D1D1F", marginBottom: "2px" }}>
                  {boxItem.title}
                </p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  {boxItem.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SOFTWARE ECOSYSTEM — DESKTOP, MOBILE & BROWSER */}
      <section
        id="software"
        style={{
          maxWidth: "1280px",
          margin: "0 auto 90px",
          padding: "0 16px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="eyebrow" style={{ marginBottom: "8px", display: "block" }}>
            {config.softwareEyebrow || "Software Ecosystem"}
          </span>
          <h2 className="section-title-responsive" style={{ fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "14px", color: "#1D1D1F" }}>
            {config.softwareHeadline || "Native apps for macOS, Windows, iOS & Android."}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "680px", margin: "0 auto" }}>
            Seamlessly print shipping labels, custom barcodes, and retail tags from your desk, warehouse, or phone. Free companion software included with every Bravon printer.
          </p>
        </div>

        {/* 2 Ecosystem Pillars Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr",
            gap: "28px",
            marginBottom: "28px",
          }}
          className="software-section-grid"
        >
          {/* Card 1: Desktop Suite (Mac & Windows) */}
          <div
            style={{
              backgroundColor: "var(--bg-apple)",
              borderRadius: "28px",
              padding: "36px 32px",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,0,0,0.08)" }}>
                    <Monitor size={20} color="var(--bravon-purple)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1D1D1F", margin: 0 }}>
                      Bravon Desktop Studio
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                      macOS (Universal) &amp; Windows 10/11
                    </p>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "20px" }}>
                Direct USB high-speed communication with zero driver lag. Includes batch spreadsheet importing, custom canvas layout, and 1-click test printing.
              </p>

              {/* Desktop App Window Mockup */}
              <div style={{ marginBottom: "24px" }}>
                <DesktopAppMockup
                  os="mac"
                  src="/bravon-desktop-dashboard-mac.png"
                  alt="Bravon Desktop Studio for Windows and Mac"
                  title="Bravon Print Studio"
                />
              </div>
            </div>

            {/* Download Quick Actions */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a
                href={config.macDownloadUrl || "/downloads/Bravon_Print_1.0.0_universal.dmg"}
                download
                className="btn-apple-primary"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 18px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <Apple size={16} /> macOS (.dmg)
              </a>
              <a
                href={config.windowsMsiUrl || "/downloads/Bravon_Print_1.0.0_x64_en-US.msi"}
                download
                className="btn-apple-secondary"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 18px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <Monitor size={16} /> Windows (.msi)
              </a>
            </div>
          </div>

          {/* Card 2: Mobile App (iOS & Android) */}
          <div
            style={{
              backgroundColor: "var(--bg-apple)",
              borderRadius: "28px",
              padding: "36px 32px",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,0,0,0.08)" }}>
                    <Smartphone size={20} color="var(--bravon-purple)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1D1D1F", margin: 0 }}>
                      Bravon Mobile
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                      iPhone, iPad &amp; Android
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bravon-purple)", backgroundColor: "var(--bravon-purple-subtle)", padding: "4px 10px", borderRadius: "980px" }}>
                  Bluetooth Wireless
                </span>
              </div>

              <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "20px" }}>
                Wirelessly print on the go via Bluetooth BLE. Crop shipping PDF waybills, scan barcodes with your camera, and batch-print from spreadsheets.
              </p>

              {/* Mobile Mockup Preview */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                <IPhoneMockup
                  src="/bravon-mobile-home-clean.png"
                  alt="Bravon Mobile App on iPhone"
                  width={185}
                  time="9:14"
                />
              </div>
            </div>

            {/* Mobile Link */}
            <Link
              href="/apps#mobile"
              className="btn-apple-secondary"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 18px",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Get Mobile App (iOS / Android) <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Browser Studio Banner Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "24px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            padding: "24px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "var(--bg-apple)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={22} color="var(--bravon-purple)" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem", color: "#1D1D1F" }}>
                Prefer to design in your browser with zero installation?
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Launch the Bravon Web Studio directly in Chrome, Safari, Edge, or Firefox.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link
              href="/design"
              className="btn-apple-primary"
              style={{
                padding: "10px 20px",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Open Web Studio <ArrowRight size={14} />
            </Link>
            <Link
              href="/apps"
              style={{
                padding: "10px 16px",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "var(--bravon-purple)",
                textDecoration: "none",
              }}
            >
              View All Apps &amp; Downloads →
            </Link>
          </div>
        </div>
      </section>

      {/* 7. PLATFORMS & CARRIERS MARQUEE */}
      <section
        style={{
          backgroundColor: "var(--bg-apple)",
          padding: "40px 16px",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", marginBottom: "20px" }}>
            Certified for all major platforms & carriers
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "24px 32px",
              flexWrap: "wrap",
            }}
          >
            {[
              "Shopify", "Amazon FBA", "Etsy", "eBay", "WooCommerce",
              "USPS", "UPS", "FedEx", "DHL Express", "Pirate Ship"
            ].map((partner) => (
              <span
                key={partner}
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#374151",
                  letterSpacing: "-0.01em",
                }}
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 6B. VERIFIED CUSTOMER REVIEWS SHOWCASE */}
      <section
        style={{
          padding: "80px 20px",
          backgroundColor: "#FAFAFC",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="eyebrow" style={{ display: "inline-block", marginBottom: "8px" }}>
              Verified Social Proof
            </span>
            <h2 className="section-title-responsive" style={{ fontWeight: 800, letterSpacing: "-0.03em", color: "#0F172A", marginBottom: "12px" }}>
              Trusted by 10,000+ High-Volume Shippers
            </h2>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", gap: "3px" }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0F172A" }}>4.9 out of 5</span>
              <span style={{ fontSize: "0.9rem", color: "#64748B" }}>· Over 38 verified merchant reviews</span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
              marginBottom: "36px",
            }}
          >
            {[
              {
                author: "Marcus Sterling",
                role: "Founder, Apex Logistics Supply",
                title: "Replaced three bulky legacy printers with this beast",
                quote: "We ship roughly 450 packages a day across Shopify and ShipStation. The POS-9260-L is whisper-quiet, lightning-fast at 160mm/s, and has zero paper jams. The rear external stand holds our 500-label fanfold stacks flawlessly.",
                finish: "Dark Slate",
              },
              {
                author: "Elena Rostova",
                role: "Operations Dir, Lumina Home Goods",
                title: "Clean desktop footprint and instant Mac compatibility",
                quote: "The Bravon plugged in via Type-C and printed our 4x6 shipping labels on the first click. The industrial dark slate matte finish looks like an Apple accessory on my packing table.",
                finish: "Dark Slate",
              },
              {
                author: "David Chen",
                role: "Owner, Chen & Co. Artisans",
                title: "The stand included is a game changer for continuous rolls",
                quote: "Most printers charge $30 extra for an external roll holder. Bravon including the dedicated multi-format stand that supports both tight rolls and fanfold paper in the ecosystem is incredible.",
                finish: "Arctic White",
              },
            ].map((t) => (
              <div
                key={t.author}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "20px",
                  padding: "28px",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={15} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#16A34A",
                      }}
                    >
                      <CheckCircle2 size={12} fill="#16A34A" color="#FFFFFF" />
                      <span>Verified Buyer</span>
                    </span>
                  </div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px", lineHeight: 1.35 }}>
                    &ldquo;{t.title}&rdquo;
                  </h4>
                  <p style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.6, marginBottom: "16px" }}>
                    {t.quote}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>{t.author}</p>
                    <p style={{ fontSize: "0.76rem", color: "#64748B", margin: 0 }}>{t.role}</p>
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#475569",
                      backgroundColor: "#F1F5F9",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {t.finish}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <Link
              href="/product#reviews"
              className="btn-apple-secondary"
              style={{ padding: "12px 28px", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <span>Read All Customer Reviews</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section
        style={{
          padding: "80px 16px",
          textAlign: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <h2 className="section-title-responsive" style={{ fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "14px" }}>
            Ready to upgrade your printing workflow?
          </h2>
          <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", marginBottom: "28px", lineHeight: 1.5 }}>
            Get the Bravon Thermal Printer for <strong style={{ color: "#1D1D1F" }}>${config.price}</strong>. Flagship direct thermal hardware and companion apps included.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/product" className="btn-apple-primary hero-btn-mobile" style={{ padding: "14px 32px" }}>
              Order Now — ${config.price}
            </Link>
            <Link href="/contact" className="btn-apple-secondary hero-btn-mobile" style={{ padding: "14px 28px" }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Responsive Styles — Mobile First Refinements */}
      <style>{`
        .section-title-responsive {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
        }

        .hero-highlights-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 20px 28px;
          background: var(--bg-apple);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .action-grid-container {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 48px;
          align-items: center;
          background-color: var(--bg-apple);
          border-radius: 36px;
          padding: 48px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .specs-metric-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          text-align: center;
        }

        .spec-metric-number {
          font-size: clamp(2.4rem, 4.5vw, 3.4rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #1D1D1F;
          margin-bottom: 6px;
        }

        .spec-metric-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1D1D1F;
          margin-bottom: 8px;
        }

        .spec-metric-divider {
          width: 32px;
          height: 1px;
          background: rgba(0,0,0,0.15);
          margin: 0 auto 10px;
        }

        .spec-metric-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .in-the-box-container {
          background-color: #FFFFFF;
          border-radius: 36px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 48px 36px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.04);
        }

        .box-items-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 14px;
        }

        @media (max-width: 960px) {
          .action-grid-container {
            grid-template-columns: 1fr !important;
            padding: 32px 20px !important;
            gap: 28px !important;
            border-radius: 24px !important;
          }
          .hero-highlights-strip {
            grid-template-columns: 1fr 1fr !important;
            padding: 16px !important;
            gap: 12px !important;
          }
          .specs-metric-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 28px 16px !important;
          }
          .specs-two-col-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .blueprint-card-container {
            padding: 24px 16px !important;
          }
          .specs-table-container {
            padding: 28px 16px !important;
          }
          .software-section-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .box-items-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        @media (max-width: 640px) {
          .hero-actions-container {
            flex-direction: column !important;
          }
          .hero-btn-mobile {
            width: 100% !important;
            text-align: center !important;
          }
          .hero-highlights-strip {
            grid-template-columns: 1fr 1fr !important;
            padding: 14px !important;
            gap: 10px !important;
          }
          .blueprint-subgrid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .in-the-box-container {
            padding: 24px 16px !important;
            border-radius: 20px !important;
          }
          .box-items-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .spec-metric-card {
            padding: 12px 6px;
          }
          .spec-metric-number {
            font-size: 2.2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
