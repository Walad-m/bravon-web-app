import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <div style={{ maxWidth: "480px" }}>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 800,
            textTransform: "uppercase",
            color: "#7C3AED",
            letterSpacing: "0.08em",
            backgroundColor: "rgba(124, 58, 237, 0.08)",
            padding: "4px 12px",
            borderRadius: "999px",
            display: "inline-block",
            marginBottom: "16px",
          }}
        >
          404 — Page Not Found
        </span>
        <h1
          style={{
            fontSize: "2.4rem",
            fontWeight: 800,
            color: "#0F172A",
            letterSpacing: "-0.03em",
            marginBottom: "12px",
          }}
        >
          Lost in transit?
        </h1>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#64748B",
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          The page you are looking for doesn&apos;t exist, has been moved, or the link expired. Let&apos;s get you back on track.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn-apple-primary">
            <Home size={16} /> Return to Store
          </Link>
          <Link href="/product" className="btn-apple-secondary">
            View Bravon Printer
          </Link>
        </div>
      </div>
    </div>
  );
}
