"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Globe, MessageSquare } from "lucide-react";
import BravonLogo from "@/components/BravonLogo";
import { useSiteConfig } from "@/context/ConfigContext";

export default function Footer() {
  const pathname = usePathname();
  const { config } = useSiteConfig();
  const [isSubdomainOrAdmin, setIsSubdomainOrAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host.startsWith("admin.") || host.startsWith("design.") || window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/design")) {
        setIsSubdomainOrAdmin(true);
      }
    }
  }, [pathname]);

  // Do not render storefront consumer footer on admin console or design studio
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/design") || isSubdomainOrAdmin) {
    return null;
  }

  return (
    <footer
      style={{
        backgroundColor: "var(--bg-apple)",
        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
        padding: "50px 20px 36px",
        color: "var(--text-secondary)",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div className="footer-layout-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div style={{ marginBottom: "16px" }}>
              <BravonLogo size="md" />
            </div>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "20px", maxWidth: "320px" }}>
              Commercial thermal label printing ecosystem. Engineered with companion native apps for macOS, Windows, iOS & Android.
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
              {config.socialInstagram && (
                <a
                  href={config.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                  aria-label="Instagram"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              )}
              {config.socialYoutube && (
                <a
                  href={config.socialYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                  aria-label="YouTube"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {config.socialTwitter && (
                <a
                  href={config.socialTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                  aria-label="X (Twitter)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {config.socialTiktok && (
                <a
                  href={config.socialTiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                  aria-label="TikTok"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.76a8.28 8.28 0 0 0 4.83 1.55V6.86a4.85 4.85 0 0 1-1.06-.17z" />
                  </svg>
                </a>
              )}
              <Link
                href="/contact"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
                aria-label="Contact"
              >
                <MessageSquare size={16} />
              </Link>
            </div>
          </div>

          {/* Links Columns Container */}
          <div className="footer-links-grid">
            {/* Product */}
            <div>
              <h4 style={{ color: "#1D1D1F", fontWeight: 600, fontSize: "0.9rem", marginBottom: "14px" }}>
                Product
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
                <Link href="/product" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Bravon Printer (${config.price})</Link>
                <Link href="/apps" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>All Apps &amp; Downloads</Link>
                <a href="/#in-action" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Printer in Action</a>
                <a href="/#specs" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Tech Specifications</a>
              </div>
            </div>

            {/* Apps & Software */}
            <div>
              <h4 style={{ color: "#1D1D1F", fontWeight: 600, fontSize: "0.9rem", marginBottom: "14px" }}>
                Apps &amp; Software
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
                <a href="/downloads/Bravon_Print_1.0.0_universal.dmg" download style={{ color: "var(--text-secondary)", textDecoration: "none" }}>macOS App (.dmg)</a>
                <a href="/downloads/Bravon_Print_1.0.0_x64_setup.exe" download style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Windows App (.exe)</a>
                <Link href="/apps#mobile" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>iOS &amp; Android Apps</Link>
                <Link href="/design" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Browser Web Studio</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 style={{ color: "#1D1D1F", fontWeight: 600, fontSize: "0.9rem", marginBottom: "14px" }}>
                Company
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
                <Link href="/about" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>About Bravon</Link>
                <Link href="/contact" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Customer Support</Link>
                <Link href="/faq" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>FAQ &amp; Guides</Link>
                <Link href="/admin" style={{ color: "var(--text-tertiary)", textDecoration: "none", fontSize: "0.82rem" }}>Console Login</Link>
              </div>
            </div>

            {/* Legal & Buyer Protection */}
            <div>
              <h4 style={{ color: "#1D1D1F", fontWeight: 600, fontSize: "0.9rem", marginBottom: "14px" }}>
                Buyer Protection
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
                <Link href="/track" style={{ color: "var(--bravon-purple)", fontWeight: 600, textDecoration: "none" }}>Track Your Order →</Link>
                <Link href="/returns" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>30-Day Money-Back</Link>
                <Link href="/returns" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>2-Year Warranty Portal</Link>
                <Link href="/shipping" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Shipping &amp; Delivery</Link>
                <Link href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Privacy Policy</Link>
                <Link href="/terms" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Real Links */}
        <div
          style={{
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "0.82rem",
            color: "var(--text-tertiary)",
          }}
          className="footer-bottom-bar"
        >
          <p>
            © {new Date().getFullYear()} Bravon (
            <a
              href="https://bravoncity.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--bravon-purple)", textDecoration: "none", fontWeight: 500 }}
            >
              bravoncity.com
            </a>
            ). All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/privacy" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>Privacy</Link>
            <Link href="/terms" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>Terms</Link>
            <Link href="/returns" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>Returns</Link>
            <Link href="/shipping" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>Shipping</Link>
          </div>
        </div>
      </div>

      <style>{`
        .footer-layout-grid {
          display: grid;
          grid-template-columns: 1.5fr 2.5fr;
          gap: 48px;
          margin-bottom: 40px;
        }
        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 28px;
        }

        @media (max-width: 820px) {
          .footer-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .footer-links-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 28px !important;
          }
          .footer-bottom-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .footer-links-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </footer>
  );
}
