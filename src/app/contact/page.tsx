"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Mail, Clock, MapPin, Phone, Send, CheckCircle } from "lucide-react";
import { useSiteConfig } from "@/context/ConfigContext";

export default function ContactPage() {
  const { config } = useSiteConfig();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Client-side form simulation (ready for Resend, Formspree, or custom webhook)
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "#1D1D1F", minHeight: "100vh", paddingTop: "56px" }}>
      {/* Editorial Header */}
      <section
        style={{
          padding: "72px 20px 48px",
          textAlign: "center",
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        <p className="eyebrow" style={{ marginBottom: "12px" }}>
          Customer Support
        </p>
        <h1
          style={{
            fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            color: "#1D1D1F",
            marginBottom: "16px",
          }}
        >
          We&apos;re here to help you print.
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: "540px",
            margin: "0 auto",
          }}
        >
          Have questions about your Bravon printer, setup, or app compatibility? Our team responds within 24 hours.
        </p>
      </section>

      {/* Main Contact Grid */}
      <main style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 20px 90px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.35fr",
            gap: "48px",
            alignItems: "flex-start",
          }}
          className="contact-layout-grid"
        >
          {/* Left: Contact Channels */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                backgroundColor: "var(--bg-apple)",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "var(--bravon-purple-subtle)",
                  color: "var(--bravon-purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Mail size={20} />
              </div>
              <div>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", margin: 0 }}>
                  Email Support
                </p>
                <a
                  href={`mailto:${config.supportEmail}`}
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "var(--bravon-purple)",
                    textDecoration: "none",
                    display: "inline-block",
                    marginTop: "4px",
                  }}
                >
                  {config.supportEmail}
                </a>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  For technical inquiries and order questions
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--bg-apple)",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "var(--bravon-purple-subtle)",
                  color: "var(--bravon-purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Clock size={20} />
              </div>
              <div>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", margin: 0 }}>
                  Operating Hours
                </p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "#1D1D1F", marginTop: "4px", margin: 0 }}>
                  {config.supportHours}
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Fast responses directly from our engineering team
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--bg-apple)",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "var(--bravon-purple-subtle)",
                  color: "var(--bravon-purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Phone size={20} />
              </div>
              <div>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", margin: 0 }}>
                  Support Hotline
                </p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "#1D1D1F", marginTop: "4px", margin: 0 }}>
                  {config.supportPhone}
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Toll-free telephone assistance
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--bg-apple)",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "var(--bravon-purple-subtle)",
                  color: "var(--bravon-purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MapPin size={20} />
              </div>
              <div>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", margin: 0 }}>
                  Company Location
                </p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "#1D1D1F", marginTop: "4px", margin: 0 }}>
                  {config.companyAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Clean Message Form */}
          <div
            style={{
              backgroundColor: "var(--bg-apple)",
              borderRadius: "24px",
              padding: "36px 32px",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.03)",
            }}
          >
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "#10B981",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1D1D1F", marginBottom: "8px" }}>
                  Message Received!
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "24px" }}>
                  Thank you for reaching out. One of our product specialists will reply to <strong>{form.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="btn-apple-secondary"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1D1D1F", marginBottom: "4px" }}>
                  Send us a message
                </h2>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Fill out the form below and we will get back to you right away.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }} className="contact-name-row">
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1D1D1F", marginBottom: "6px" }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Johnson"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        border: "1.5px solid rgba(0,0,0,0.12)",
                        backgroundColor: "#FFFFFF",
                        fontSize: "0.95rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1D1D1F", marginBottom: "6px" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        border: "1.5px solid rgba(0,0,0,0.12)",
                        backgroundColor: "#FFFFFF",
                        fontSize: "0.95rem",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1D1D1F", marginBottom: "6px" }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Question about Mac app setup"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: "1.5px solid rgba(0,0,0,0.12)",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.95rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1D1D1F", marginBottom: "6px" }}>
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we help your business print better?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: "1.5px solid rgba(0,0,0,0.12)",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.95rem",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-apple-primary"
                  style={{
                    padding: "14px 24px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    width: "100%",
                    marginTop: "6px",
                  }}
                >
                  <Send size={16} />
                  {sending ? "Sending Message..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .contact-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .contact-name-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
