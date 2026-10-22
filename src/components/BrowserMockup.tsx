"use client";

import React from "react";
import Image from "next/image";
import { Lock, RotateCw, ChevronLeft, ChevronRight } from "lucide-react";

interface BrowserMockupProps {
  src: string;
  alt: string;
  url?: string;
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}

export default function BrowserMockup({
  src,
  alt,
  url = "bravoncity.com/design",
  width = "100%",
  className = "",
  style = {},
  priority = false,
}: BrowserMockupProps) {
  return (
    <div
      className={`browser-mockup-wrapper ${className}`}
      style={{
        position: "relative",
        width: typeof width === "number" ? `${width}px` : width,
        borderRadius: "16px",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.18), 0 10px 20px -8px rgba(0,0,0,0.06)",
        userSelect: "none",
        ...style,
      }}
    >
      {/* macOS Safari Window Chrome / Header */}
      <div
        style={{
          height: "40px",
          backgroundColor: "#F3F4F6",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          gap: "12px",
        }}
      >
        {/* Left: Window Traffic Light Dots */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div
            style={{
              width: "11px",
              height: "11px",
              borderRadius: "50%",
              backgroundColor: "#FF5F56",
              border: "1px solid rgba(0,0,0,0.12)",
            }}
          />
          <div
            style={{
              width: "11px",
              height: "11px",
              borderRadius: "50%",
              backgroundColor: "#FFBD2E",
              border: "1px solid rgba(0,0,0,0.12)",
            }}
          />
          <div
            style={{
              width: "11px",
              height: "11px",
              borderRadius: "50%",
              backgroundColor: "#27C93F",
              border: "1px solid rgba(0,0,0,0.12)",
            }}
          />
        </div>

        {/* Browser Nav Arrows */}
        <div style={{ display: "none", gap: "6px", alignItems: "center" }} className="browser-nav-arrows">
          <ChevronLeft size={14} color="#9CA3AF" />
          <ChevronRight size={14} color="#D1D5DB" />
        </div>

        {/* Center: Safari Address Bar */}
        <div
          style={{
            flex: "1",
            maxWidth: "340px",
            height: "26px",
            backgroundColor: "#FFFFFF",
            borderRadius: "6px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "0 10px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          <Lock size={11} color="#10B981" />
          <span
            style={{
              fontSize: "0.75rem",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              color: "#374151",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {url}
          </span>
          <RotateCw size={10} color="#9CA3AF" style={{ marginLeft: "auto" }} />
        </div>

        {/* Right side spacer for balance */}
        <div style={{ width: "45px" }} />
      </div>

      {/* Browser Screen Content */}
      <div style={{ position: "relative", width: "100%", backgroundColor: "#FAFAFA", lineHeight: 0 }}>
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={750}
          priority={priority}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}
