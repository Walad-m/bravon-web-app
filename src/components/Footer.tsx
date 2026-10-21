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
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
              <a
                href="https://bravoncity.com"
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
                aria-label="Website"
              >
                <Globe size={16} />
              </a>
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
                <Link href="/shipping" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Shipping &amp; Delivery</Link>
                <Link href="/returns" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>30-Day Money-Back</Link>
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
