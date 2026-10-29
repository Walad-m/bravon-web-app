"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Cpu,
  Layers,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  Zap,
  Maximize2,
} from "lucide-react";
import { useSiteConfig } from "@/context/ConfigContext";

interface ComponentCallout {
  id: string;
  name: string;
  tag: string;
  description: string;
  spec: string;
  icon: React.ElementType;
}

const HARDWARE_COMPONENTS: ComponentCallout[] = [
  {
    id: "print-head",
    name: "Precision Print Head",
    tag: "Core Engine",
    description:
      "Commercial-grade Japanese 203 DPI (8-dot/mm) direct thermal line printhead. Engineered for crisp, smudge-free barcodes, shipping labels, and receipts at 160mm/s with zero ink and zero toner.",
    spec: "203 DPI (8 dots/mm) • 160 mm/s max speed • Direct Thermal Line",
    icon: Zap,
  },
  {
    id: "paper-regulator",
    name: "Adjustable Paper Regulator",
    tag: "Media Throat",
    description:
      "Dual-slider guide accommodates paper widths from 30mm to 110mm (up to 104mm printable width). Effortlessly handles standard 4x6\" shipping labels, self-adhesive stickers, barcode rolls, and continuous slip papers.",
    spec: "30–110mm media width • 104mm max printable width • Auto-centering guides",
    icon: Sliders,
  },
  {
    id: "roller",
    name: "High-Traction Industrial Roller",
    tag: "Feed Mechanism",
    description:
      "Precision-molded high-grip rubber drive roller guarantees continuous, jam-free media feeding during high-volume batch runs, even with thick 0.3mm label liners.",
    spec: "Non-slip vulcanized rubber • Dual-bearing synchronization",
    icon: Layers,
  },
  {
    id: "open-lid",
    name: "Easy-Open Lid & Auto-Retract",
    tag: "Operation",
    description:
      "Ergonomic quick-release side latch pops the clamshell open instantly. When closed, the printer automatically retracts the first sheet of thermal paper to calibrate alignment and eliminate wasted labels.",
    spec: "Spring-assisted clamshell • Automatic first-sheet retraction",
    icon: RotateCcw,
  },
  {
    id: "connectivity",
    name: "USB Type-C & DC Power Ports",
    tag: "Interfaces",
    description:
      "Universal reversible USB Type-C port for plug-and-play driver recognition on macOS, Windows, Linux, and Chromebooks. Paired with a heavy-duty DC 24V barrel connector and safety rocker power switch.",
    spec: "USB Type-C • DC 24V / 2.5A input • Mechanical Power Switch",
    icon: Cpu,
  },
  {
    id: "chassis",
    name: "Palm-Sized Private Mold",
    tag: "Chassis",
    description:
      "Engineered space-saving body that fits easily in a hand or bag. Combines portability with commercial durability for mobile workers, small businesses, and field logistics stations.",
    spec: "180 × 78 × 75 mm • 1.55kg unit weight with accessories • Private Mold",
    icon: Maximize2,
  },
];

export default function ProductInformationSection() {
  const { config } = useSiteConfig();
  const [activeComponentId, setActiveComponentId] = useState<string>("print-head");

  const selectedComponent =
    HARDWARE_COMPONENTS.find((c) => c.id === activeComponentId) ||
    HARDWARE_COMPONENTS[0];

  return (
    <section
      id="product-information"
      style={{
        maxWidth: "1140px",
        margin: "0 auto 80px",
        padding: "0 16px",
      }}
    >
      {/* Editorial Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <span
          className="eyebrow"
          style={{
            marginBottom: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Sparkles size={14} color="var(--bravon-purple)" />
          Hardware Architecture & Internal Anatomy
        </span>
        <h2
          className="section-title-responsive"
          style={{
            fontWeight: 700,
            letterSpacing: "-0.025em",
            marginBottom: "12px",
            color: "#0F172A",
          }}
        >
          {config.anatomyHeadline || "Engineered for precision. Labeled down to every component."}
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.02rem",
            maxWidth: "640px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          {config.anatomySubhead || `Discover the internal engineering, paper-loading mechanics, and precision-machined components that power the ${config.productName || "Bravon POS-9260-L thermal printer"}.`}
        </p>
      </div>

      {/* Main Studio White Showcase Card — Clean, Spacious & Uncluttered */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 20px 60px -15px rgba(15, 23, 42, 0.06)",
          overflow: "hidden",
        }}
      >
        {/* Top Header Strip — Minimalist Model Badge Only */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
            backgroundColor: "#FAFAFC",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--bravon-purple)",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>
              {config.productName ? config.productName.replace(" Thermal Printer", "") : "Bravon POS-9260-L"}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              · Dark Slate Edition
            </span>
          </div>

          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              backgroundColor: "rgba(124, 58, 237, 0.08)",
              color: "var(--bravon-purple)",
              padding: "4px 10px",
              borderRadius: "980px",
            }}
          >
            Private Mold
          </span>
        </div>

        {/* Crisp Anatomy Canvas */}
        <div
          style={{
            position: "relative",
            width: "100%",
            backgroundColor: "#FFFFFF",
            padding: "24px 16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "720px",
              aspectRatio: "750 / 690",
              margin: "0 auto",
            }}
          >
            <Image
              src="/bravon-pos9260-anatomy-slate.png"
              alt={`${config.productName || "Bravon POS-9260-L"} Thermal Printer Detailed Anatomy: Print Head, USB Type-C Interface, Charging Port, Power Switch, Roller, Paper Regulator, Open Lid Button`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 720px"
              style={{
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        {/* Clean Interactive Component Explorer */}
        <div
          style={{
            backgroundColor: "#FAFAFC",
            borderTop: "1px solid rgba(0, 0, 0, 0.06)",
            padding: "20px 24px 24px",
          }}
        >
          {/* Labeled Component Selector Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "0.76rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-secondary)",
                marginRight: "4px",
              }}
            >
              Inspect Part:
            </span>
            {HARDWARE_COMPONENTS.map((comp) => {
              const isSelected = activeComponentId === comp.id;
              const IconComp = comp.icon;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => setActiveComponentId(comp.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    borderRadius: "980px",
                    border: isSelected
                      ? "1px solid var(--bravon-purple)"
                      : "1px solid rgba(0, 0, 0, 0.08)",
                    backgroundColor: isSelected ? "var(--bravon-purple-subtle)" : "#FFFFFF",
                    color: isSelected ? "var(--bravon-purple)" : "#334155",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? "0 2px 8px rgba(124, 58, 237, 0.12)" : "none",
                  }}
                >
                  <IconComp size={13} />
                  {comp.name}
                </button>
              );
            })}
          </div>

          {/* Active Component Deep Dive Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "18px 20px",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "var(--bravon-purple-subtle)",
                color: "var(--bravon-purple)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <selectedComponent.icon size={20} />
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "4px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  {selectedComponent.name}
                </h3>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    backgroundColor: "rgba(124, 58, 237, 0.08)",
                    color: "var(--bravon-purple)",
                    padding: "2px 8px",
                    borderRadius: "980px",
                  }}
                >
                  {selectedComponent.tag}
                </span>
              </div>

              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {selectedComponent.description}
              </p>

              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#0F172A",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#F1F5F9",
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                <Info size={13} color="var(--bravon-purple)" />
                Spec: {selectedComponent.spec}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
