"use client";

import React from "react";
import { ExternalLink, Share2 } from "lucide-react";
import { useSiteConfig } from "@/context/ConfigContext";

export default function SocialCommunitySection() {
  const { config } = useSiteConfig();

  const channels = [
    {
      name: "Instagram",
      handle: "@bravoncity",
      url: config.socialInstagram || "https://instagram.com/bravoncity",
      desc: "Behind-the-scenes, seller workstation setups, and unboxings.",
      bg: "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      ),
    },
    {
      name: "YouTube",
      handle: "@bravoncity",
      url: config.socialYoutube || "https://youtube.com/@bravoncity",
      desc: "Hardware setup guides, speed printing tests, and driver tutorials.",
      bg: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      name: "TikTok",
      handle: "@bravoncity",
      url: config.socialTiktok || "https://tiktok.com/@bravoncity",
      desc: "Packing orders with me, thermal label tips, and packing hacks.",
      bg: "linear-gradient(135deg, #000000 0%, #111111 100%)",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" color="#FFFFFF">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.76a8.28 8.28 0 0 0 4.83 1.55V6.86a4.85 4.85 0 0 1-1.06-.17z" />
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      handle: "@bravoncity",
      url: config.socialTwitter || "https://x.com/bravoncity",
      desc: "Instant firmware alerts, driver updates, and product announcements.",
      bg: "linear-gradient(135deg, #18181B 0%, #09090B 100%)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" color="#FFFFFF">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  return (
    <section
      style={{
        padding: "80px 20px",
        backgroundColor: "var(--bg-apple)",
        borderTop: "1px solid rgba(0, 0, 0, 0.06)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
      }}
    >
      <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "980px",
              backgroundColor: "rgba(124, 58, 237, 0.1)",
              marginBottom: "14px",
            }}
          >
            <Share2 size={14} color="var(--bravon-purple)" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--bravon-purple)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Official Community &amp; Channels
            </span>
          </div>

          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 800, color: "#1D1D1F", letterSpacing: "-0.03em", margin: "0 0 10px" }}>
            Connect with the Bravon Community
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: "620px", margin: "0 auto", lineHeight: 1.6 }}>
            Follow our verified channels for printing tutorials, new software releases, merchant stories, and packaging workflows. Tag <strong>#BravonPrint</strong> to be featured!
          </p>
        </div>

        {/* Channels Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          {channels.map((ch) => (
            <a
              key={ch.name}
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.03)";
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: ch.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {ch.icon}
                  </div>
                  <ExternalLink size={16} color="#94A3B8" />
                </div>

                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1D1D1F", marginBottom: "2px" }}>
                  {ch.name}
                </div>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--bravon-purple)", marginBottom: "10px" }}>
                  {ch.handle}
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {ch.desc}
                </p>
              </div>

              <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--bravon-purple)" }}>
                  Follow Channel →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
