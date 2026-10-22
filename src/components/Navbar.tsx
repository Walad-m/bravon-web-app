"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import BravonLogo from "@/components/BravonLogo";
import { useSiteConfig } from "@/context/ConfigContext";

export default function Navbar() {
  const pathname = usePathname();
  const { config } = useSiteConfig();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isSubdomainOrAdmin, setIsSubdomainOrAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host.startsWith("admin.") || host.startsWith("design.") || window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/design")) {
        setIsSubdomainOrAdmin(true);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  // Do not render storefront consumer navbar on admin console or design studio
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/design") || isSubdomainOrAdmin) {
    return null;
  }

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled ? "rgba(255, 255, 255, 0.92)" : "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "0 16px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Authentic Official Bravon Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <BravonLogo size="md" />
          </Link>

          {/* Desktop Nav Links (Strictly hidden on mobile via CSS) */}
          <nav className="bravon-desktop-nav">
            {[
              { label: "Overview", href: "/#overview" },
              { label: "Tech Specs", href: "/#specs" },
              { label: "Apps", href: "/apps" },
              { label: "Design Studio", href: "/design" },
              { label: "Track Order", href: "/track" },
              { label: "FAQ", href: "/faq" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--bravon-purple)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-secondary)")}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action (Buy button + Mobile Menu Toggle) */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/product"
              className="btn-apple-primary"
              style={{
                fontSize: "0.85rem",
                padding: "8px 16px",
                whiteSpace: "nowrap",
              }}
            >
              Buy <span style={{ opacity: 0.85 }}>${config.price}</span>
            </Link>

            {/* Mobile Menu Hamburger Toggle (Visible strictly on small mobile screens <= 820px) */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="bravon-mobile-toggle"
              style={{
                background: "var(--bg-apple)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "8px",
                cursor: "pointer",
                color: "var(--text-primary)",
                width: "40px",
                height: "40px",
                alignItems: "center",
                justifyContent: "center",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer Menu (Rendered OUTSIDE header to avoid iOS backdrop-filter stacking trap) */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: "56px",
            left: 0,
            right: 0,
            bottom: 0,
            height: "calc(100dvh - 56px)",
            backgroundColor: "#FFFFFF",
            padding: "24px 20px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            zIndex: 9999,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-tertiary)",
                marginBottom: "8px",
              }}
            >
              Navigation
            </p>
            {[
              { label: "Overview", href: "/#overview" },
              { label: "Technical Specifications", href: "/#specs" },
              { label: "Apps & Downloads (Mac, Win, iOS, Android)", href: "/apps" },
              { label: "Design Studio (Web)", href: "/design" },
              { label: "Track Your Order", href: "/track" },
              { label: "Returns & 2-Year Warranty", href: "/returns" },
              { label: "Order Bravon ($100)", href: "/product" },
              { label: "About Bravon", href: "/about" },
              { label: "FAQ & Support", href: "/faq" },
              { label: "Contact Us", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  color: link.href === "/product" ? "var(--bravon-purple)" : "#1D1D1F",
                  textDecoration: "none",
                  fontSize: "1.2rem",
                  fontWeight: link.href === "/product" ? 700 : 600,
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  touchAction: "manipulation",
                }}
              >
                <span>{link.label}</span>
                <span style={{ fontSize: "1.2rem", opacity: 0.4 }}>›</span>
              </Link>
            ))}
          </div>

          <div style={{ paddingTop: "24px" }}>
            <Link
              href="/product"
              onClick={() => setMobileOpen(false)}
              className="btn-apple-primary"
              style={{
                width: "100%",
                padding: "16px 24px",
                fontSize: "1.1rem",
                textAlign: "center",
                display: "block",
                touchAction: "manipulation",
              }}
            >
              Order Bravon Printer — ${config.price}
            </Link>
          </div>
        </div>
      )}

      {/* Scoped CSS for Strict Responsive Display */}
      <style>{`
        .bravon-desktop-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .bravon-mobile-toggle {
          display: none !important;
        }

        @media (max-width: 820px) {
          .bravon-desktop-nav {
            display: none !important;
          }
          .bravon-mobile-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
}
