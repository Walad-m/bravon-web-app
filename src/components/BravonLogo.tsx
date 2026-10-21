import React from "react";
import Image from "next/image";

interface BravonLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  iconOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}

export function BravonLogo({
  size = "md",
  iconOnly = false,
  className = "",
  style,
  priority = true,
}: BravonLogoProps) {
  // Optically tuned dimensions matching the official Bravon Design System
  const dimensions = {
    xs: { height: 18, width: iconOnly ? 18 : 80 },
    sm: { height: 22, width: iconOnly ? 22 : 98 },
    md: { height: 28, width: iconOnly ? 28 : 124 },
    lg: { height: 36, width: iconOnly ? 36 : 160 },
    xl: { height: 48, width: iconOnly ? 48 : 212 },
  };

  const current = dimensions[size] || dimensions.md;
  const src = iconOnly ? "/bravon-mark.png" : "/bravon-logo-transparent.png";

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        userSelect: "none",
        ...style,
      }}
    >
      <img
        src={src}
        alt="BRAVON"
        width={current.width}
        height={current.height}
        style={{
          height: `${current.height}px`,
          width: iconOnly ? `${current.height}px` : "auto",
          display: "block",
          objectFit: "contain",
        }}
        draggable={false}
      />
    </div>
  );
}

export default BravonLogo;
