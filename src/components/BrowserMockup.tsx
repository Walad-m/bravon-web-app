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
        maxWidth: "100%",
        boxSizing: "border-box",
        minWidth: 0,
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
        className="browser-safari-header"
        style={{
          height: "38px",
          backgroundColor: "#F3F4F6",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          gap: "8px",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        {/* Left: Window Traffic Light Dots */}
        <div className="browser-traffic-dots" style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, width: "36px" }}>
          <div
            className="browser-dot"
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#FF5F56",
              border: "1px solid rgba(0,0,0,0.12)",
              flexShrink: 0,
            }}
          />
          <div
            className="browser-dot"
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#FFBD2E",
              border: "1px solid rgba(0,0,0,0.12)",
              flexShrink: 0,
            }}
          />
          <div
            className="browser-dot"
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#27C93F",
              border: "1px solid rgba(0,0,0,0.12)",
              flexShrink: 0,
            }}
          />
        </div>

        {/* Browser Nav Arrows (hidden on compact) */}
        <div style={{ display: "none", gap: "6px", alignItems: "center" }} className="browser-nav-arrows">
          <ChevronLeft size={14} color="#9CA3AF" />
          <ChevronRight size={14} color="#D1D5DB" />
        </div>

        {/* Center: Safari Address Bar */}
        <div
          className="browser-address-bar"
          style={{
            flex: "1",
            maxWidth: "340px",
            minWidth: 0,
            height: "24px",
            backgroundColor: "#FFFFFF",
            borderRadius: "6px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "0 8px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <Lock size={10} color="#10B981" style={{ flexShrink: 0 }} />
          <span
            style={{
              fontSize: "0.72rem",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              color: "#374151",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
          >
            {url}
          </span>
          <RotateCw size={9} color="#9CA3AF" style={{ marginLeft: "auto", flexShrink: 0 }} />
        </div>

        {/* Right side spacer for balance */}
        <div className="browser-header-spacer" style={{ width: "36px", flexShrink: 0 }} />
      </div>

      {/* Browser Screen Content */}
      <div style={{ position: "relative", width: "100%", backgroundColor: "#FAFAFA", lineHeight: 0, overflow: "hidden" }}>
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

      {/* Scoped Responsive Styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .browser-safari-header {
            height: 32px !important;
            padding: 0 8px !important;
            gap: 6px !important;
          }
          .browser-traffic-dots {
            width: 30px !important;
            gap: 4px !important;
          }
          .browser-dot {
            width: 8px !important;
            height: 8px !important;
          }
          .browser-address-bar {
            height: 22px !important;
            padding: 0 6px !important;
          }
          .browser-header-spacer {
            width: 30px !important;
          }
        }
      `}</style>
    </div>
  );
}
