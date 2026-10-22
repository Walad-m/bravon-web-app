"use client";

import React from "react";
import Image from "next/image";

interface DesktopAppMockupProps {
  os: "mac" | "windows";
  src: string;
  alt: string;
  title?: string;
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}

export default function DesktopAppMockup({
  os,
  src,
  alt,
  title,
  width = "100%",
  className = "",
  style = {},
  priority = false,
}: DesktopAppMockupProps) {
  const isMac = os === "mac";
  const defaultTitle = isMac ? "Bravon Print Studio" : "Bravon Print Studio — Label Designer";
  const windowTitle = title || defaultTitle;

  return (
    <div
      className={`desktop-app-mockup-wrapper ${className}`}
      style={{
        position: "relative",
        width: typeof width === "number" ? `${width}px` : width,
        borderRadius: isMac ? "12px" : "8px",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0, 0, 0, 0.12)",
        boxShadow: "0 22px 50px -12px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.04)",
        userSelect: "none",
        ...style,
      }}
    >
      {/* Titlebar Header */}
      {isMac ? (
        // macOS Titlebar
        <div
          style={{
            height: "36px",
            backgroundColor: "#F3F4F6",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
          }}
        >
          {/* macOS 3 Traffic Light Control Dots */}
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

          {/* Centered App Title */}
          <div
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#374151",
              letterSpacing: "-0.01em",
            }}
          >
            {windowTitle}
          </div>

          {/* Right Spacer for optical centering */}
          <div style={{ width: "48px" }} />
        </div>
      ) : (
        // Windows 11 Titlebar
        <div
          style={{
            height: "36px",
            backgroundColor: "#F8FAFC",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 0 0 12px",
          }}
        >
          {/* Windows Left: App Icon & Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "3px",
                backgroundColor: "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "10px",
                fontWeight: 800,
              }}
            >
              B
            </div>
            <span
              style={{
                fontFamily:
                  "'Segoe UI Variable', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "0.78rem",
                fontWeight: 500,
                color: "#334155",
              }}
            >
              {windowTitle}
            </span>
          </div>

          {/* Windows 11 Controls: Minimize, Maximize, Close */}
          <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
            {/* Minimize */}
            <div
              style={{
                width: "44px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748B",
              }}
            >
              <div style={{ width: "10px", height: "1px", backgroundColor: "#64748B" }} />
            </div>
            {/* Maximize */}
            <div
              style={{
                width: "44px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748B",
              }}
            >
              <div
                style={{
                  width: "9px",
                  height: "9px",
                  border: "1px solid #64748B",
                  borderRadius: "1px",
                }}
              />
            </div>
            {/* Close */}
            <div
              style={{
                width: "44px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748B",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1 1L9 9M9 1L1 9"
                  stroke="#64748B"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Screen Content */}
      <div style={{ position: "relative", width: "100%", backgroundColor: "#FAFAFA", lineHeight: 0 }}>
        <Image
          src={src}
          alt={alt}
          width={1024}
          height={isMac ? 465 : 534}
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
