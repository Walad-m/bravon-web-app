"use client";

import React from "react";
import Image from "next/image";

interface IPhoneMockupProps {
  src: string;
  alt: string;
  width?: number; // width in pixels, defaults to 260
  time?: string; // status bar time, defaults to "9:14"
  batteryLevel?: number; // 0 to 100, defaults to 100
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}

export default function IPhoneMockup({
  src,
  alt,
  width = 260,
  time = "9:14",
  batteryLevel = 100,
  className = "",
  style = {},
  priority = false,
}: IPhoneMockupProps) {
  // iPhone aspect ratio ~ 19.5:9
  // We calculate proportional scaling relative to a base width of 260px
  const scale = width / 260;
  const chassisRadius = Math.round(44 * scale);
  const screenRadius = Math.round(36 * scale);
  const bezelPadding = Math.max(6, Math.round(7 * scale));
  const notchWidth = Math.round(112 * scale);
  const notchHeight = Math.round(22 * scale);
  const speakerWidth = Math.round(36 * scale);
  const speakerHeight = Math.max(3, Math.round(3.5 * scale));
  const cameraSize = Math.max(6, Math.round(7.5 * scale));
  const homeBarWidth = Math.round(110 * scale);
  const homeBarHeight = Math.max(3.5, Math.round(4.5 * scale));

  return (
    <div
      className={`iphone-device-wrapper ${className}`}
      style={{
        position: "relative",
        width: `${width}px`,
        display: "inline-block",
        userSelect: "none",
        ...style,
      }}
    >
      {/* Physical Hardware Buttons */}
      {/* Left side: Mute / Action Switch */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `-${Math.max(2.5, 3 * scale)}px`,
          top: `${Math.round(80 * scale)}px`,
          width: `${Math.max(2.5, 3 * scale)}px`,
          height: `${Math.round(20 * scale)}px`,
          background: "linear-gradient(to right, #1f2023, #3a3c42)",
          borderTopLeftRadius: "2px",
          borderBottomLeftRadius: "2px",
          boxShadow: "-1px 0 2px rgba(0,0,0,0.3)",
        }}
      />
      {/* Left side: Volume Up */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `-${Math.max(2.5, 3 * scale)}px`,
          top: `${Math.round(112 * scale)}px`,
          width: `${Math.max(2.5, 3 * scale)}px`,
          height: `${Math.round(38 * scale)}px`,
          background: "linear-gradient(to right, #1f2023, #3a3c42)",
          borderTopLeftRadius: "2px",
          borderBottomLeftRadius: "2px",
          boxShadow: "-1px 0 2px rgba(0,0,0,0.3)",
        }}
      />
      {/* Left side: Volume Down */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `-${Math.max(2.5, 3 * scale)}px`,
          top: `${Math.round(158 * scale)}px`,
          width: `${Math.max(2.5, 3 * scale)}px`,
          height: `${Math.round(38 * scale)}px`,
          background: "linear-gradient(to right, #1f2023, #3a3c42)",
          borderTopLeftRadius: "2px",
          borderBottomLeftRadius: "2px",
          boxShadow: "-1px 0 2px rgba(0,0,0,0.3)",
        }}
      />
      {/* Right side: Power / Siri Button */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: `-${Math.max(2.5, 3 * scale)}px`,
          top: `${Math.round(124 * scale)}px`,
          width: `${Math.max(2.5, 3 * scale)}px`,
          height: `${Math.round(52 * scale)}px`,
          background: "linear-gradient(to left, #1f2023, #3a3c42)",
          borderTopRightRadius: "2px",
          borderBottomRightRadius: "2px",
          boxShadow: "1px 0 2px rgba(0,0,0,0.3)",
        }}
      />

      {/* Main Outer Phone Chassis */}
      <div
        style={{
          width: "100%",
          padding: `${bezelPadding}px`,
          background: "linear-gradient(145deg, #2c2e33 0%, #151619 40%, #0c0d0f 100%)",
          borderRadius: `${chassisRadius}px`,
          boxShadow: `
            0 25px 60px -15px rgba(0, 0, 0, 0.35),
            0 12px 28px -10px rgba(0, 0, 0, 0.22),
            0 0 0 1px rgba(255, 255, 255, 0.18),
            inset 0 1px 2px rgba(255, 255, 255, 0.3),
            inset 0 -1px 2px rgba(0, 0, 0, 0.9)
          `,
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Inner Black Bezel Frame */}
        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: `${screenRadius}px`,
            overflow: "hidden",
            backgroundColor: "#000000",
            boxShadow: "inset 0 0 0 2px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* iOS Status Bar */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: `${Math.round(36 * scale)}px`,
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `0 ${Math.round(16 * scale)}px`,
              boxSizing: "border-box",
              zIndex: 10,
            }}
          >
            {/* Status Bar: Time */}
            <div
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif",
                fontSize: `${Math.round(12.5 * scale)}px`,
                fontWeight: 700,
                color: "#000000",
                letterSpacing: "-0.01em",
                lineHeight: 1,
                paddingLeft: `${Math.round(4 * scale)}px`,
              }}
            >
              {time}
            </div>

            {/* Top Notch (Centered Speaker & Front Camera) */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: `${notchWidth}px`,
                height: `${notchHeight}px`,
                backgroundColor: "#000000",
                borderBottomLeftRadius: `${Math.round(14 * scale)}px`,
                borderBottomRightRadius: `${Math.round(14 * scale)}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: `${Math.round(8 * scale)}px`,
                zIndex: 20,
              }}
            >
              {/* Speaker Slit Mesh */}
              <div
                style={{
                  width: `${speakerWidth}px`,
                  height: `${speakerHeight}px`,
                  backgroundColor: "#1c1d1f",
                  borderRadius: "2px",
                  boxShadow: "inset 0 1px 1px rgba(0,0,0,0.8)",
                }}
              />
              {/* Front Camera Lens with Reflection */}
              <div
                style={{
                  width: `${cameraSize}px`,
                  height: `${cameraSize}px`,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 35% 35%, #1e3a8a 0%, #0f172a 50%, #020617 100%)",
                  boxShadow: "inset 0 0 2px rgba(96, 165, 250, 0.4)",
                }}
              />
            </div>

            {/* Status Bar: Cellular, Wi-Fi & Battery Icons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: `${Math.round(5 * scale)}px`,
                color: "#000000",
                paddingRight: `${Math.round(2 * scale)}px`,
              }}
            >
              {/* Cellular Signal: 4 Vertical Bars */}
              <svg
                width={Math.round(15 * scale)}
                height={Math.round(10 * scale)}
                viewBox="0 0 17 11"
                fill="currentColor"
                style={{ display: "block" }}
              >
                <rect x="0" y="8" width="3" height="3" rx="0.8" />
                <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.8" />
                <rect x="9" y="3" width="3" height="8" rx="0.8" />
                <rect x="13.5" y="0" width="3" height="11" rx="0.8" />
              </svg>

              {/* Wi-Fi Icon: Curved Arcs */}
              <svg
                width={Math.round(14 * scale)}
                height={Math.round(10 * scale)}
                viewBox="0 0 16 12"
                fill="currentColor"
                style={{ display: "block" }}
              >
                <path d="M8 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-4.24-4.24a6 6 0 0 1 8.48 0 .8.8 0 1 0 1.13-1.13 7.6 7.6 0 0 0-10.74 0 .8.8 0 0 0 1.13 1.13zm-2.83-2.83a10 10 0 0 1 14.14 0 .8.8 0 0 0 1.13-1.13 11.6 11.6 0 0 0-16.4 0 .8.8 0 0 0 1.13 1.13z" />
              </svg>

              {/* Battery Icon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <svg
                  width={Math.round(22 * scale)}
                  height={Math.round(11 * scale)}
                  viewBox="0 0 25 12"
                  fill="none"
                  style={{ display: "block" }}
                >
                  {/* Outer Battery Border */}
                  <rect
                    x="0.6"
                    y="0.6"
                    width="21"
                    height="10.8"
                    rx="3"
                    stroke="#000000"
                    strokeWidth="1.2"
                  />
                  {/* Battery Fill Level */}
                  <rect
                    x="2"
                    y="2"
                    width={Math.round(18 * (Math.max(15, batteryLevel) / 100))}
                    height="8"
                    rx="1.8"
                    fill="#000000"
                  />
                  {/* Battery Terminal Knob */}
                  <path
                    d="M23 4.2C23.6 4.6 24 5.3 24 6C24 6.7 23.6 7.4 23 7.8V4.2Z"
                    fill="#000000"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Screen Content (App Screenshot) */}
          <div
            style={{
              position: "relative",
              width: "100%",
              backgroundColor: "#FFFFFF",
              lineHeight: 0,
            }}
          >
            <Image
              src={src}
              alt={alt}
              width={458}
              height={917}
              priority={priority}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "contain",
              }}
            />
          </div>

          {/* iOS Bottom Safe Area & Home Indicator */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: `${Math.round(22 * scale)}px`,
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            {/* iOS Home Indicator Bar */}
            <div
              style={{
                width: `${homeBarWidth}px`,
                height: `${homeBarHeight}px`,
                backgroundColor: "#000000",
                borderRadius: "999px",
                opacity: 0.9,
              }}
            />
          </div>

          {/* Subtle Glass Sheen / Reflection Overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 40%, rgba(255,255,255,0) 65%)",
              pointerEvents: "none",
              zIndex: 25,
            }}
          />
        </div>
      </div>
    </div>
  );
}
