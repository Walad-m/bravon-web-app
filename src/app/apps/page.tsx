"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Download,
  Apple,
  Monitor,
  Smartphone,
  Globe,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight
} from "lucide-react";
import { useSiteConfig } from "@/context/ConfigContext";
import IPhoneMockup from "@/components/IPhoneMockup";
import BrowserMockup from "@/components/BrowserMockup";

export default function AppsPage() {
  const { config } = useSiteConfig();

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "var(--text-primary)", minHeight: "100vh", paddingTop: "56px" }}>
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
            <span style={{ color: "#1D1D1F", fontWeight: 600 }}>Apps & Software Suite</span>
          </div>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--bravon-purple)",
              backgroundColor: "var(--bravon-purple-subtle)",
              padding: "4px 10px",
              borderRadius: "980px",
              fontWeight: 600,
            }}
          >
            v1.0.0 Stable Release
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "64px 20px 48px",
          textAlign: "center",
        }}
      >
        <span className="eyebrow" style={{ marginBottom: "12px", display: "inline-block" }}>
          Unified Software Ecosystem
        </span>
        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#1D1D1F",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}
        >
          One printer. Every device.
        </h1>
        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--text-secondary)",
            maxWidth: "720px",
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}
        >
          Whether you are batch-printing 1,000 orders at a warehouse shipping station, designing barcodes directly in your browser, or printing on the go from your phone via Bluetooth, Bravon has a native application built for you.
        </p>

        {/* Quick Platform Jump Pills */}
        <div
          style={{
            display: "inline-flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            padding: "8px",
            backgroundColor: "var(--bg-apple)",
            borderRadius: "980px",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <a href="#desktop" className="platform-pill">
            <Monitor size={15} /> Windows & Mac Desktop
          </a>
          <a href="#mobile" className="platform-pill">
            <Smartphone size={15} /> iOS & Android Mobile
          </a>
          <a href="#browser" className="platform-pill">
            <Globe size={15} /> Browser Web Studio
          </a>
        </div>
      </section>

      {/* 1. NATIVE DESKTOP APPS SECTION (Windows & macOS) */}
      <section
        id="desktop"
        style={{
          maxWidth: "1200px",
          margin: "0 auto 80px",
          padding: "0 20px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span className="eyebrow" style={{ marginBottom: "8px", display: "block" }}>
            High-Performance Desktop Suite
          </span>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "#1D1D1F", margin: 0 }}>
            Bravon Print for Windows & macOS
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", marginTop: "8px" }}>
            Direct high-speed USB communication with zero driver lag. 160 mm/s lightning throughput.
          </p>
        </div>

        {/* Two-Column Desktop Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "28px",
          }}
          className="desktop-apps-grid"
        >
          {/* macOS Card */}
          <div
            style={{
              backgroundColor: "var(--bg-apple)",
              borderRadius: "28px",
              padding: "36px 32px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      backgroundColor: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <Apple size={26} color="#1D1D1F" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1D1D1F", margin: 0 }}>
                      macOS Desktop
                    </h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                      Universal (Apple Silicon & Intel)
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: "#10B981",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "980px",
                  }}
                >
                  v1.0.0 Live
                </span>
              </div>

              {/* App Screenshot Preview */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/9",
                  borderRadius: "16px",
                  overflow: "hidden",
                  marginBottom: "20px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Image
                  src="/bravon-desktop-dashboard.png"
                  alt="Bravon Print for Mac Dashboard"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>

              {/* Features List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
                {[
                  "Apple Silicon Native (M1, M2, M3, M4) & Intel 64-bit",
                  "Direct plug-and-play USB connection via Type-C adapter",
                  "Built-in template library & batch print queues",
                  "Supports macOS 11.0 Big Sur through macOS 15 Sequoia",
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#374151" }}>
                    <CheckCircle2 size={14} color="var(--bravon-purple)" style={{ flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Buttons */}
            <div>
              <a
                href="/downloads/Bravon_Print_1.0.0_universal.dmg"
                download
                className="btn-apple-primary"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "14px 24px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                <Download size={18} />
                Download for Mac (.dmg)
                <span style={{ fontSize: "0.78rem", opacity: 0.8, fontWeight: 500 }}>— 12.8 MB</span>
              </a>
              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textAlign: "center", marginTop: "8px" }}>
                Universal Binary · Verified & Notarized
              </p>
            </div>
          </div>

          {/* Windows Card */}
          <div
            style={{
              backgroundColor: "var(--bg-apple)",
              borderRadius: "28px",
              padding: "36px 32px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      backgroundColor: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <Monitor size={26} color="var(--bravon-purple)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1D1D1F", margin: 0 }}>
                      Windows Desktop
                    </h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                      Windows 10 & 11 (64-bit)
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: "#10B981",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "980px",
                  }}
                >
                  v1.0.0 Live
                </span>
              </div>

              {/* App Screenshot Preview */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/9",
                  borderRadius: "16px",
                  overflow: "hidden",
                  marginBottom: "20px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Image
                  src="/bravon-desktop-designer.png"
                  alt="Bravon Print for Windows Designer"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>

              {/* Features List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
                {[
                  "Direct system driver communication with USB thermal ports",
                  "High-speed 160 mm/s continuous label throughput",
                  "CSV & Excel spreadsheet bulk import generator",
                  "Compatible with Windows 11, Windows 10 & Windows Server",
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#374151" }}>
                    <CheckCircle2 size={14} color="var(--bravon-purple)" style={{ flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Buttons (Exe & MSI) */}
            <div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href="/downloads/Bravon_Print_1.0.0_x64_setup.exe"
                  download
                  className="btn-apple-primary"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "14px 20px",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Download size={16} />
                  Download Setup (.exe)
                </a>
                <a
                  href="/downloads/Bravon_Print_1.0.0_x64_en-US.msi"
                  download
                  style={{
                    padding: "14px 18px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1D1D1F",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: "980px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  MSI (.msi)
                </a>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textAlign: "center", marginTop: "8px" }}>
                Installer (8.8 MB) · Enterprise MSI (10.4 MB) · 64-bit Architecture
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MOBILE APPS SECTION (iOS & Android) */}
      <section
        id="mobile"
        style={{
          maxWidth: "1200px",
          margin: "0 auto 80px",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "32px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            padding: "48px 36px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.04)",
          }}
          className="mobile-apps-container"
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="eyebrow" style={{ marginBottom: "8px", display: "block" }}>
              Wireless On-The-Go Printing
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "#1D1D1F", margin: 0 }}>
              Bravon Mobile for iOS & Android
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginTop: "8px", maxWidth: "600px", margin: "8px auto 0" }}>
              Print shipping labels, product tags, and custom barcodes wirelessly via Bluetooth straight from your smartphone or tablet.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              alignItems: "center",
            }}
            className="mobile-layout-grid"
          >
            {/* Left: Mobile Visuals */}
            <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "flex-start" }}>
              <IPhoneMockup
                src="/bravon-mobile-home-clean.png"
                alt="Bravon Mobile App Home Screen on iPhone"
                width={225}
                time="9:14"
              />
              <IPhoneMockup
                src="/bravon-mobile-recent-clean.png"
                alt="Bravon Mobile App Recent Print History on iPhone"
                width={225}
                time="9:14"
                className="second-mobile-screen"
                style={{ marginTop: "32px" }}
              />
            </div>

            {/* Right: Mobile Badges & Features */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(124, 58, 237, 0.1)", padding: "6px 14px", borderRadius: "980px", marginBottom: "16px" }}>
                <Zap size={14} color="var(--bravon-purple)" />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--bravon-purple)" }}>
                  Bluetooth Wireless Thermal Protocol
                </span>
              </div>

              <h3 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1D1D1F", marginBottom: "12px", letterSpacing: "-0.02em" }}>
                Everything your business needs, in your pocket.
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "24px" }}>
                Connect directly to your Bravon printer via Bluetooth. Create custom labels with exact millimeter dimensions, crop shipping waybills from PDFs, or import contact lists and product SKUs from Excel.
              </p>

              {/* Feature Bullets */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
                {[
                  "Instant 1-tap Bluetooth BLE printer pairing",
                  "Built-in camera barcode scanner & label generator",
                  "CSV & spreadsheet bulk import with automatic serial numbering",
                  "Ready-made templates for USPS, Amazon FBA, retail price tags & apparel",
                ].map((feat, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckCircle2 size={16} color="var(--bravon-purple)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "0.9rem", color: "#1D1D1F", fontWeight: 500 }}>{feat}</span>
                  </div>
                ))}
              </div>

              {/* App Store & Google Play Badges */}
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
                {/* iOS Badge */}
                <div
                  style={{
                    backgroundColor: "#1D1D1F",
                    color: "#FFFFFF",
                    padding: "10px 18px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                  }}
                >
                  <Apple size={24} color="#FFFFFF" />
                  <div>
                    <p style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0, opacity: 0.8 }}>
                      Download on the
                    </p>
                    <p style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
                      Apple App Store
                    </p>
                  </div>
                </div>

                {/* Android Google Play Badge */}
                <div
                  style={{
                    backgroundColor: "#1D1D1F",
                    color: "#FFFFFF",
                    padding: "10px 18px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                  }}
                >
                  <Smartphone size={22} color="#10B981" />
                  <div>
                    <p style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0, opacity: 0.8 }}>
                      Get it on
                    </p>
                    <p style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
                      Google Play
                    </p>
                  </div>
                </div>

                {/* Direct APK Link */}
                <a
                  href="/downloads/Bravon_Print_Android.apk"
                  download
                  style={{
                    padding: "10px 16px",
                    borderRadius: "14px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#1D1D1F",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Download size={14} /> Direct APK (2.1 MB)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BROWSER-BASED CLOUD DESIGN STUDIO */}
      <section
        id="browser"
        style={{
          maxWidth: "1200px",
          margin: "0 auto 90px",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--bg-apple)",
            borderRadius: "32px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            padding: "48px 40px",
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: "40px",
            alignItems: "center",
          }}
          className="browser-studio-grid"
        >
          <div>
            <span className="eyebrow" style={{ marginBottom: "8px", display: "inline-block" }}>
              Zero Installation Required
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "#1D1D1F", margin: "0 0 14px" }}>
              Bravon Web Studio in your browser.
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "24px" }}>
              Do not want to install any software? Run our full-featured label design suite directly inside Google Chrome, Apple Safari, Microsoft Edge, or Mozilla Firefox.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
              {[
                "Instant canvas design with real millimeter dimensions",
                "UPC-A, EAN-13, Code 128, QR Code & Data Matrix generators",
                "One-click PrintNode cloud thermal bridge integration",
                "Export to TSPL, PNG, SVG, or high-res monochrome bitmap",
              ].map((feat, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "#374151" }}>
                  <CheckCircle2 size={15} color="var(--bravon-purple)" style={{ flexShrink: 0 }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <Link
              href="/design"
              className="btn-apple-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 28px",
                fontSize: "1rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Launch Browser Studio Now <ArrowRight size={16} />
            </Link>
          </div>

          <div>
            <BrowserMockup
              src="/bravon-desktop-designer.png"
              alt="Bravon Browser Web Studio in Google Chrome / Safari"
              url="bravoncity.com/design"
            />
          </div>
        </div>
      </section>

      {/* Scoped CSS for Responsive Grid */}
      <style>{`
        .platform-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 980px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #1D1D1F;
          text-decoration: none;
          background-color: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
          transition: all 0.2s ease;
        }
        .platform-pill:hover {
          color: var(--bravon-purple);
          border-color: rgba(124, 58, 237, 0.3);
        }

        @media (max-width: 900px) {
          .desktop-apps-grid {
            grid-template-columns: 1fr !important;
          }
          .mobile-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .browser-studio-grid {
            grid-template-columns: 1fr !important;
          }
          .second-mobile-screen {
            display: none !important;
          }
        }

        @media (max-width: 600px) {
          .mobile-apps-container {
            padding: 28px 16px !important;
          }
          .platform-pill {
            font-size: 0.8rem !important;
            padding: 6px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
