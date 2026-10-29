"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Database,
  CreditCard,
  Globe,
  Lock,
  Check,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
} from "lucide-react";
import type { EnvFieldStatus, EnvSettings } from "@/lib/envConfig";

interface EnvSettingsTabProps {
  isMobile: boolean;
}

export default function EnvSettingsTab({ isMobile }: EnvSettingsTabProps) {
  const [fields, setFields] = useState<EnvFieldStatus[]>([]);
  const [values, setValues] = useState<{ [key: string]: string }>({});
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Connection testing states
  const [testingStripe, setTestingStripe] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadEnvSettings = async () => {
    setLoading(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/admin/env", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.fields)) {
        setFields(data.fields);
        const map: { [key: string]: string } = {};
        for (const f of data.fields) {
          map[f.key] = f.value || "";
        }
        setValues(map);
      }
    } catch {
      setSaveMsg({ type: "error", text: "Failed to connect to environment configuration server." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnvSettings();
  }, []);

  const handleValueChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleToggleShow = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (key: string, val: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/admin/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMsg({ type: "success", text: data.message || "Environment settings saved successfully." });
        if (Array.isArray(data.fields)) {
          setFields(data.fields);
        }
      } else {
        setSaveMsg({ type: "error", text: data.error || "Failed to save settings." });
      }
    } catch {
      setSaveMsg({ type: "error", text: "Network error saving environment settings." });
    } finally {
      setSaving(false);
    }
  };

  const testStripe = async () => {
    setTestingStripe(true);
    setStripeTestResult(null);
    try {
      // First save or send current stripe key to test
      const res = await fetch("/api/admin/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_stripe" }),
      });
      const data = await res.json();
      setStripeTestResult({
        success: data.success,
        message: data.message || data.error || "Test failed",
      });
    } catch {
      setStripeTestResult({ success: false, message: "Could not reach verification endpoint" });
    } finally {
      setTestingStripe(false);
    }
  };

  const testSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      const res = await fetch("/api/admin/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_supabase" }),
      });
      const data = await res.json();
      setSupabaseTestResult({
        success: data.success,
        message: data.message || data.error || "Test failed",
      });
    } catch {
      setSupabaseTestResult({ success: false, message: "Could not reach verification endpoint" });
    } finally {
      setTestingSupabase(false);
    }
  };

  const stripeFields = fields.filter((f) => f.category === "stripe");
  const supabaseFields = fields.filter((f) => f.category === "supabase");
  const generalFields = fields.filter((f) => f.category === "general");
  const adminFields = fields.filter((f) => f.category === "admin");

  const stripeSecretVal = values["stripeSecretKey"] || "";
  const isStripeLive = stripeSecretVal.startsWith("sk_live_");
  const isStripeTest = stripeSecretVal.startsWith("sk_test_");

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748B", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <RefreshCw size={24} className="animate-spin" style={{ color: "#7C3AED" }} />
        <p style={{ fontSize: "0.9rem" }}>Loading system environment settings...</p>
      </div>
    );
  }

  const renderFieldInput = (f: EnvFieldStatus) => {
    const isShowing = showSecrets[f.key];
    const val = values[f.key] !== undefined ? values[f.key] : f.value || "";

    return (
      <div
        key={f.key}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          padding: "14px 16px",
          backgroundColor: "#F8FAFC",
          borderRadius: "8px",
          border: "1px solid #E2E8F0",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>{f.label}</span>
              <code style={{ fontSize: "0.74rem", backgroundColor: "#E2E8F0", padding: "2px 6px", borderRadius: "4px", color: "#475569" }}>
                {f.envVarName}
              </code>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#64748B", margin: "3px 0 0" }}>{f.description}</p>
          </div>

          {/* SOURCE BADGE */}
          <div>
            {f.source === "dashboard" && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  backgroundColor: "#ECFDF5",
                  color: "#059669",
                  fontWeight: 600,
                  border: "1px solid #A7F3D0",
                }}
              >
                <CheckCircle2 size={12} /> Dashboard Config
              </span>
            )}
            {f.source === "env" && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  backgroundColor: "#FEF3C7",
                  color: "#D97706",
                  fontWeight: 600,
                  border: "1px solid #FDE68A",
                }}
              >
                <Server size={12} /> Active via .env
              </span>
            )}
            {f.source === "not_set" && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  backgroundColor: "#F1F5F9",
                  color: "#64748B",
                  fontWeight: 500,
                  border: "1px solid #CBD5E1",
                }}
              >
                Not Configured
              </span>
            )}
          </div>
        </div>

        {/* INPUT + CONTROLS */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type={f.isSecret && !isShowing ? "password" : "text"}
              value={val}
              onChange={(e) => handleValueChange(f.key, e.target.value)}
              placeholder={`Enter ${f.label}...`}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: "0.85rem",
                fontFamily: "monospace",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                boxSizing: "border-box",
              }}
            />
          </div>

          {f.isSecret && (
            <button
              type="button"
              onClick={() => handleToggleShow(f.key)}
              title={isShowing ? "Hide Secret" : "Show Secret"}
              style={{
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#475569",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isShowing ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}

          {val && (
            <button
              type="button"
              onClick={() => handleCopy(f.key, val)}
              title="Copy to clipboard"
              style={{
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: copiedKey === f.key ? "#059669" : "#475569",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {copiedKey === f.key ? <Check size={15} /> : <Copy size={15} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* HEADER BANNER */}
      <div
        style={{
          padding: "20px 24px",
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          border: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(124, 58, 237, 0.08)", color: "#7C3AED" }}>
              <KeyRound size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                Environment & System Configuration
              </h2>
              <p style={{ fontSize: "0.82rem", color: "#64748B", margin: "2px 0 0" }}>
                Manage API keys, Stripe secrets, and Supabase credentials directly from the dashboard without redeploying.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={loadEnvSettings}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#FFFFFF",
              color: "#475569",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RefreshCw size={14} /> Reload
          </button>
        </div>
      </div>

      {saveMsg && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: saveMsg.type === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${saveMsg.type === "success" ? "#A7F3D0" : "#FECACA"}`,
            color: saveMsg.type === "success" ? "#047857" : "#B91C1C",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {saveMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{saveMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* SECTION 1: STRIPE PAYMENTS */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(99, 102, 241, 0.08)", color: "#6366F1" }}>
                <CreditCard size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                  Stripe Payment Integration
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "2px 0 0" }}>
                  Stripe handles checkout sessions, customer billing, and webhooks.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isStripeLive && (
                <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "9999px", backgroundColor: "#ECFDF5", color: "#059669", fontWeight: 700, border: "1px solid #A7F3D0" }}>
                  ● LIVE PRODUCTION MODE
                </span>
              )}
              {isStripeTest && (
                <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "9999px", backgroundColor: "#FEF3C7", color: "#D97706", fontWeight: 700, border: "1px solid #FDE68A" }}>
                  ● TEST MODE
                </span>
              )}

              <button
                type="button"
                onClick={testStripe}
                disabled={testingStripe}
                style={{
                  padding: "7px 12px",
                  borderRadius: "6px",
                  border: "1px solid #6366F1",
                  backgroundColor: "#EEF2FF",
                  color: "#4F46E5",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: testingStripe ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {testingStripe ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                <span>{testingStripe ? "Testing..." : "Test Stripe Connection"}</span>
              </button>
            </div>
          </div>

          {stripeTestResult && (
            <div
              style={{
                marginBottom: "16px",
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: stripeTestResult.success ? "#ECFDF5" : "#FEF2F2",
                border: `1px solid ${stripeTestResult.success ? "#A7F3D0" : "#FECACA"}`,
                color: stripeTestResult.success ? "#047857" : "#B91C1C",
                fontSize: "0.82rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {stripeTestResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{stripeTestResult.message}</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {stripeFields.map(renderFieldInput)}
          </div>
        </div>

        {/* SECTION 2: SUPABASE DATABASE */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.08)", color: "#10B981" }}>
                <Database size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                  Supabase Cloud Database & Storage
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "2px 0 0" }}>
                  Production database for storing orders, customer RMA claims, reviews, and site settings.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={testSupabase}
              disabled={testingSupabase}
              style={{
                padding: "7px 12px",
                borderRadius: "6px",
                border: "1px solid #10B981",
                backgroundColor: "#ECFDF5",
                color: "#059669",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: testingSupabase ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {testingSupabase ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
              <span>{testingSupabase ? "Testing..." : "Test Supabase Connection"}</span>
            </button>
          </div>

          {supabaseTestResult && (
            <div
              style={{
                marginBottom: "16px",
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: supabaseTestResult.success ? "#ECFDF5" : "#FEF2F2",
                border: `1px solid ${supabaseTestResult.success ? "#A7F3D0" : "#FECACA"}`,
                color: supabaseTestResult.success ? "#047857" : "#B91C1C",
                fontSize: "0.82rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {supabaseTestResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{supabaseTestResult.message}</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {supabaseFields.map(renderFieldInput)}
          </div>
        </div>

        {/* SECTION 3: DOMAIN & ROUTING */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(59, 130, 246, 0.08)", color: "#3B82F6" }}>
              <Globe size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                Domain & Integrations
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "2px 0 0" }}>
                Base domain for Stripe redirect URLs and third-party printing integrations.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {generalFields.map(renderFieldInput)}
          </div>
        </div>

        {/* SECTION 4: ADMIN SECURITY SECRETS */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(220, 38, 38, 0.08)", color: "#DC2626" }}>
              <Lock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                Admin Security & Session Cryptography
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "2px 0 0" }}>
                HMAC session signing secret and master admin password configuration.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {adminFields.map(renderFieldInput)}
          </div>
        </div>

        {/* SAVE BUTTON BAR */}
        <div
          style={{
            position: "sticky",
            bottom: "20px",
            padding: "16px 20px",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.12)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={18} style={{ color: "#7C3AED" }} />
            <span style={{ fontSize: "0.82rem", color: "#475569" }}>
              Changes take effect immediately across all active checkout sessions and API routes.
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#7C3AED",
              color: "#FFFFFF",
              fontSize: "0.92rem",
              fontWeight: 700,
              cursor: saving ? "wait" : "pointer",
              boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)",
            }}
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
            <span>{saving ? "Applying Changes..." : "Save Environment Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

