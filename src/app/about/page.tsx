"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Laptop, PackageCheck } from "lucide-react";
import { useSiteConfig } from "@/context/ConfigContext";

export default function AboutPage() {
  const { config } = useSiteConfig();

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "#1D1D1F", minHeight: "100vh", paddingTop: "56px" }}>
      {/* Editorial Hero Header */}
      <section
        style={{
          padding: "72px 20px 56px",
          textAlign: "center",
          maxWidth: "880px",
          margin: "0 auto",
        }}
      >
        <p className="eyebrow" style={{ marginBottom: "12px" }}>
          About Bravon
        </p>
        <h1
          style={{
            fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#1D1D1F",
            marginBottom: "20px",
          }}
        >
          Printing reimagined for modern commerce.
        </h1>
        <p
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: "680px",
            margin: "0 auto",
          }}
        >
          We engineered Bravon to eliminate loud, fragile, ink-bleeding printers with a clean, high-speed direct thermal device that connects effortlessly across macOS, Windows, iOS &amp; Android.
        </p>
      </section>

      {/* Hero Showcase Image */}
      <section style={{ maxWidth: "1180px", margin: "0 auto 80px", padding: "0 20px" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: "28px",
            overflow: "hidden",
            backgroundColor: "var(--bg-apple)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
          }}
        >
          <Image
            src="/bravon-ecosystem-white.jpg"
            alt="Bravon Flagship Thermal Printer Ecosystem"
            fill
            sizes="(max-width: 1200px) 100vw, 1180px"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </section>

      {/* Story Section */}
      <section style={{ padding: "0 20px 90px", maxWidth: "1080px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "56px",
            alignItems: "center",
          }}
          className="about-story-grid"
        >
          <div>
            <span className="eyebrow" style={{ marginBottom: "10px", display: "block" }}>
              Our Philosophy
            </span>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
                fontWeight: 800,
                color: "#1D1D1F",
                letterSpacing: "-0.025em",
                lineHeight: 1.2,
                marginBottom: "20px",
              }}
            >
              Born from everyday business frustration.
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "16px" }}>
              For years, e-commerce sellers and small teams were held hostage by outdated printers: proprietary drivers that crash, expensive ink cartridges that run dry midway through packing, and fragile plastic builds.
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "28px" }}>
              Bravon was founded to fix that. We paired high-precision direct thermal Japanese printheads with modern companion software built natively in Rust and modern web standards. One device that prints perfect labels in 1 second flat.
            </p>
            <Link href="/product" className="btn-apple-primary">
              Order Bravon Printer — ${config.price} <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              position: "relative",
              aspectRatio: "4/3",
              borderRadius: "24px",
              overflow: "hidden",
              backgroundColor: "var(--bg-apple)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Image
              src={config.productImageAction || "/bravon-shipping-action-v2.jpg"}
              alt="Bravon in action packing station"
              fill
              sizes="500px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* Core Principles Grid */}
      <section style={{ backgroundColor: "var(--bg-apple)", padding: "80px 20px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
            <span className="eyebrow" style={{ marginBottom: "8px", display: "block" }}>
              Core Principles
            </span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1D1D1F", letterSpacing: "-0.02em" }}>
              Built for speed, clarity, and reliability.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {[
              {
                icon: <Zap size={22} color="var(--bravon-purple)" />,
                title: "Zero Ink or Toner, Ever",
                desc: "High-density thermal heat technology means you never buy cartridges, ribbons, or ink ever again.",
              },
              {
                icon: <Laptop size={22} color="var(--bravon-purple)" />,
                title: "Universal Cross-Platform",
                desc: "Built natively for macOS, Windows 10/11, iOS, and Android over high-speed USB and Bluetooth.",
              },
              {
                icon: <PackageCheck size={22} color="var(--bravon-purple)" />,
                title: "150mm/s Commercial Speed",
                desc: "Prints a standard 4x6\" shipping label in under 1.2 seconds flat with instant barcode scannability.",
              },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "20px",
                  padding: "32px 24px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    backgroundColor: "var(--bravon-purple-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  {card.icon}
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1D1D1F", marginBottom: "8px" }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Clean CTA */}
      <section style={{ padding: "80px 20px", textAlign: "center", maxWidth: "680px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#1D1D1F", marginBottom: "14px", letterSpacing: "-0.02em" }}>
          Ready to experience Bravon?
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: "28px" }}>
          Join thousands of businesses who print faster and smarter every day.
        </p>
        <Link href="/product" className="btn-apple-primary" style={{ padding: "14px 32px" }}>
          Buy Bravon Thermal Printer — ${config.price}
        </Link>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .about-story-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </div>
  );
}
