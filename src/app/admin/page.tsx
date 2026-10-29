"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Megaphone,
  Building,
  Save,
  RotateCcw,
  ExternalLink,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Image as ImageIcon,
  SlidersHorizontal,
  Upload,
  RefreshCw,
  Copy,
  Download,
  Menu,
  X,
  Lock,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  Truck,
  User,
  Video,
  Play,
  Smartphone,
  Monitor,
  Star,
  ThumbsUp,
  Trash2,
  Plus,
} from "lucide-react";
import BravonLogo from "@/components/BravonLogo";
import { DEFAULT_SITE_CONFIG, SiteConfig } from "@/lib/siteConfig";
import { Review, ReviewsStats } from "@/lib/reviews";
import EnvSettingsTab from "@/components/admin/EnvSettingsTab";

type AdminTab = "orders" | "claims" | "reviews" | "product" | "media" | "hero" | "store" | "commerce" | "env" | "security";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // 2FA state during login
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Responsive mobile navigation
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>("product");
  const [form, setForm] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [storefrontUrl, setStorefrontUrl] = useState("/");

  // Media tab state
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadTarget, setActiveUploadTarget] = useState<keyof SiteConfig | null>(null);

  // Security Tab state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 2FA Management in Security Tab
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<{
    secret: string;
    otpauthUrl: string;
    qrImageUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [setupCode, setSetupCode] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [twoFactorMsg, setTwoFactorMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  // Security Audit Logs
  const [securityLogs, setSecurityLogs] = useState<Array<{ id: string; timestamp: string; action: string; ip?: string }>>([]);
  const [sessionDays, setSessionDays] = useState(7);

  // Orders & Fulfillment state
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState({ totalOrders: 0, totalRevenueUSD: 0, unfulfilled: 0 });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<{ [key: string]: { carrier: string; trackingNumber: string } }>({});

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.stats) setOrderStats(data.stats);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateFulfillment = async (orderId: string, status: "unfulfilled" | "processing" | "shipped" | "delivered") => {
    setUpdatingOrderId(orderId);
    try {
      const input = trackingInputs[orderId] || {};
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          fulfillmentStatus: status,
          trackingNumber: input.trackingNumber,
          trackingCarrier: input.carrier || "USPS",
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Returns & Warranty Claims state
  const [claims, setClaims] = useState<any[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [updatingClaimId, setUpdatingClaimId] = useState<string | null>(null);
  const [claimFilter, setClaimFilter] = useState<string>("all");
  const [adminNotesInputs, setAdminNotesInputs] = useState<{ [key: string]: string }>({});

  const loadClaims = async () => {
    setLoadingClaims(true);
    try {
      const res = await fetch("/api/claims", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setClaims(data.claims || []);
      }
    } catch (err) {
      console.error("Error loading claims:", err);
    } finally {
      setLoadingClaims(false);
    }
  };

  const handleUpdateClaimStatus = async (
    claimId: string,
    status: "pending" | "approved" | "inspecting" | "replaced" | "refunded" | "rejected",
    notes?: string
  ) => {
    setUpdatingClaimId(claimId);
    try {
      const res = await fetch("/api/claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: claimId,
          status,
          adminNotes: notes !== undefined ? notes : (adminNotesInputs[claimId] || ""),
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadClaims();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingClaimId(null);
    }
  };

  // Customer Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsStats, setReviewsStats] = useState<ReviewsStats>({
    averageRating: 5.0,
    totalReviews: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recommendRate: 100,
  });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "approved" | "pending" | "featured">("all");
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    author: "",
    role: "",
    rating: 5,
    title: "",
    comment: "",
    variantPurchased: "Dark Slate",
  });
  const [submittingAdminReview, setSubmittingAdminReview] = useState(false);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch("/api/reviews?status=all", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats) setReviewsStats(data.stats);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleUpdateReviewStatus = async (id: string, status: "approved" | "pending" | "rejected") => {
    try {
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "status", status }),
      });
      const data = await res.json();
      if (data.success) {
        loadReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeaturedReview = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "feature", isFeatured: !currentFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        loadReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) return;
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        loadReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAdminReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAdminReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReviewForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddReviewModal(false);
        setNewReviewForm({
          author: "",
          role: "",
          rating: 5,
          title: "",
          comment: "",
          variantPurchased: "Dark Slate",
        });
        loadReviews();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAdminReview(false);
    }
  };

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Storefront domain detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host.startsWith("admin.")) {
        setStorefrontUrl(host.includes("localhost") ? "http://localhost:3000" : "https://bravoncity.com");
      } else {
        setStorefrontUrl("/");
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/check", { cache: "no-store" });
      const data = await res.json();
      setAuthenticated(data.authenticated);
      if (data.authenticated) {
        loadConfig();
        loadSecurityInfo();
        loadOrders();
        loadClaims();
        loadReviews();
      }
    } catch {
      setAuthenticated(false);
    }
  };

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/config", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.config) {
        setForm(data.config);
      }
    } catch (err) {
      console.error("Failed to load config:", err);
    }
  };

  const loadSecurityInfo = async () => {
    try {
      const res = await fetch("/api/admin/security", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setTwoFactorEnabled(data.twoFactorEnabled);
        setSessionDays(data.sessionMaxAgeDays || 7);
        setSecurityLogs(data.securityLogs || []);
      }
    } catch (err) {
      console.error("Failed to load security info:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          twoFactorCode: requires2FA ? twoFactorCode : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticated(true);
        setRequires2FA(false);
        setTwoFactorCode("");
        loadConfig();
        loadSecurityInfo();
        loadOrders();
        loadClaims();
      } else if (data.requires2FA) {
        setRequires2FA(true);
        setLoginError(data.message || "Enter 6-digit authenticator code");
      } else {
        setLoginError(data.error || "Incorrect password");
      }
    } catch {
      setLoginError("Could not connect to server");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setAuthenticated(false);
      setPassword("");
      setRequires2FA(false);
      setTwoFactorCode("");
    }
  };

  const handleChange = (key: keyof SiteConfig, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setForm(data.config);
        setSaveSuccess(true);
        try {
          localStorage.setItem("bravon_config_updated", Date.now().toString());
        } catch {}
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setSaveError(data.error || "Failed to save");
      }
    } catch {
      setSaveError("Failed to reach server");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all settings to default factory values?")) {
      setForm(DEFAULT_SITE_CONFIG);
    }
  };

  // Image Upload handler
  const triggerImageUpload = (field: keyof SiteConfig) => {
    setActiveUploadTarget(field);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadTarget) return;

    setUploadingField(activeUploadTarget);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        handleChange(activeUploadTarget, data.url);
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to upload server");
    } finally {
      setUploadingField(null);
      setActiveUploadTarget(null);
    }
  };

  // Password Change handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ type: "success", text: data.message });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        loadSecurityInfo();
      } else {
        setPasswordMsg({ type: "error", text: data.error || "Failed to update password" });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Network error updating password" });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // 2FA Setup Flow
  const start2FASetup = async () => {
    setTwoFactorMsg(null);
    try {
      const res = await fetch("/api/admin/2fa?setup=1");
      const data = await res.json();
      if (data.success && data.setup) {
        setTwoFactorSetup(data.setup);
      }
    } catch {
      setTwoFactorMsg({ type: "error", text: "Could not initiate 2FA setup" });
    }
  };

  const handleVerifyAndEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorSetup) return;
    setVerifying2FA(true);
    setTwoFactorMsg(null);

    try {
      const res = await fetch("/api/admin/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enable",
          secret: twoFactorSetup.secret,
          code: setupCode,
          backupCodes: twoFactorSetup.backupCodes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTwoFactorEnabled(true);
        setTwoFactorMsg({ type: "success", text: "Two-Factor Authentication is now enabled!" });
        setTwoFactorSetup(null);
        setSetupCode("");
        loadSecurityInfo();
      } else {
        setTwoFactorMsg({ type: "error", text: data.error || "Invalid 6-digit verification code" });
      }
    } catch {
      setTwoFactorMsg({ type: "error", text: "Network error verifying 2FA" });
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "disable",
          password: disablePassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTwoFactorEnabled(false);
        setShowDisableModal(false);
        setDisablePassword("");
        setTwoFactorMsg({ type: "success", text: "2FA has been disabled" });
        loadSecurityInfo();
      } else {
        alert(data.error || "Incorrect password");
      }
    } catch {
      alert("Network error disabling 2FA");
    }
  };

  // Nav Items definition
  const NAV_ITEMS: Array<{ id: AdminTab; label: string; icon: React.ElementType; badge?: string }> = [
    { id: "orders", label: "Orders & Shipping", icon: ShoppingBag, badge: orderStats.unfulfilled > 0 ? `${orderStats.unfulfilled} New` : undefined },
    {
      id: "claims",
      label: "Returns & Warranty",
      icon: ShieldAlert,
      badge: claims.filter((c) => c.status === "pending").length > 0 ? `${claims.filter((c) => c.status === "pending").length} New` : undefined,
    },
    {
      id: "reviews",
      label: "Customer Reviews",
      icon: Star,
      badge: reviews.filter((r) => r.status === "pending").length > 0 ? `${reviews.filter((r) => r.status === "pending").length} New` : undefined,
    },
    { id: "product", label: "Product & Pricing", icon: Package },
    { id: "media", label: "Media & Images", icon: ImageIcon },
    { id: "hero", label: "Hero & Banners", icon: Megaphone },
    { id: "store", label: "Store & Contact", icon: Building },
    { id: "commerce", label: "Commerce & Inventory", icon: SlidersHorizontal },
    { id: "env", label: "Environment & API Keys", icon: KeyRound },
    { id: "security", label: "Security & 2FA", icon: ShieldCheck, badge: twoFactorEnabled ? "2FA On" : undefined },
  ];

  // 1. Loading Screen
  if (authenticated === null) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <BravonLogo size="md" iconOnly />
          <p style={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 500 }}>Loading Bravon Admin...</p>
        </div>
      </div>
    );
  }

  // 2. Authentication View (Password + 2FA support)
  if (!authenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC",
          padding: "20px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "380px",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
            padding: "32px 28px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "12px" }}>
              <BravonLogo size="md" iconOnly />
            </div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
              {requires2FA ? "Two-Factor Verification" : "Bravon Store Admin"}
            </h1>
            <p style={{ fontSize: "0.82rem", color: "#64748B", margin: 0 }}>
              {requires2FA
                ? useBackupCode
                  ? "Enter one of your 8-character emergency backup codes"
                  : "Enter the 6-digit code from your authenticator app"
                : "Sign in to configure products, media, and security"}
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {loginError && (
              <div
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#DC2626",
                  fontSize: "0.82rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            {!requires2FA ? (
              <div>
                <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Admin Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (default: bravon2026)"
                    required
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "10px 36px 10px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      fontSize: "0.9rem",
                      color: "#0F172A",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748B",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  {useBackupCode ? "Emergency Backup Code (e.g. A1B2-C3D4)" : "6-Digit Authenticator Code"}
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder={useBackupCode ? "XXXX-XXXX" : "000000"}
                  required
                  autoFocus
                  maxLength={useBackupCode ? 12 : 6}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1.5px solid #7C3AED",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    letterSpacing: useBackupCode ? "2px" : "8px",
                    textAlign: "center",
                    color: "#0F172A",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setUseBackupCode(!useBackupCode);
                    setTwoFactorCode("");
                  }}
                  style={{
                    marginTop: "8px",
                    background: "none",
                    border: "none",
                    color: "#7C3AED",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  {useBackupCode ? "← Use 6-digit Authenticator app code" : "Lost access? Use Emergency Backup Code"}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: "8px",
                backgroundColor: "#7C3AED",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                fontWeight: 600,
                border: "none",
                cursor: loggingIn ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
              }}
            >
              {loggingIn ? "Verifying..." : requires2FA ? "Verify & Sign In" : "Sign In to Admin"}
            </button>

            {requires2FA && (
              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setTwoFactorCode("");
                  setLoginError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748B",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                ← Back to password
              </button>
            )}
          </form>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Link href={storefrontUrl} style={{ fontSize: "0.8rem", color: "#64748B", textDecoration: "none" }}>
              ← Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated SaaS Console Layout (Desktop + Mobile Responsive)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        height: "100vh",
        backgroundColor: "#FFFFFF",
        color: "#0F172A",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Hidden File Input for Image Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,video/mp4,video/webm"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* MOBILE TOP BAR (Visible only on mobile < 768px) */}
      {isMobile && (
        <header
          style={{
            height: "56px",
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            zIndex: 60,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: "none",
                border: "none",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0F172A",
                cursor: "pointer",
                borderRadius: "6px",
              }}
              aria-label="Open Admin Menu"
            >
              <Menu size={22} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BravonLogo size="sm" iconOnly />
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Bravon Admin</span>
            </div>
          </div>

          {!["orders", "claims", "reviews", "security", "env"].includes(activeTab) && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  backgroundColor: saveSuccess ? "#10B981" : "#7C3AED",
                  color: "#FFFFFF",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: saving ? "wait" : "pointer",
                }}
              >
                {saveSuccess ? <Check size={14} /> : <Save size={14} />}
                {saveSuccess ? "Saved" : saving ? "..." : "Save"}
              </button>
            </div>
          )}
        </header>
      )}

      {/* MOBILE TOP HORIZONTAL TAB SCROLL (Fast 1-tap switching on phones) */}
      {isMobile && (
        <div
          style={{
            backgroundColor: "#F8FAFC",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            padding: "8px 12px",
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            whiteSpace: "nowrap",
            flexShrink: 0,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: isActive ? "1px solid #7C3AED" : "1px solid rgba(0,0,0,0.08)",
                  backgroundColor: isActive ? "#7C3AED" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#475569",
                  fontSize: "0.78rem",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <Icon size={14} color={isActive ? "#FFFFFF" : "#64748B"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* MOBILE SLIDE-OVER DRAWER MODAL */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Drawer Content */}
          <div
            style={{
              position: "relative",
              width: "280px",
              maxWidth: "80%",
              height: "100%",
              backgroundColor: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
              zIndex: 10,
            }}
          >
            <div>
              {/* Drawer Header */}
              <div
                style={{
                  padding: "16px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <BravonLogo size="sm" iconOnly />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Bravon Store</div>
                    <div style={{ fontSize: "0.7rem", color: "#64748B" }}>Admin Control Panel</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748B",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Links */}
              <nav style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: isActive ? "rgba(124, 58, 237, 0.08)" : "transparent",
                        color: isActive ? "#7C3AED" : "#334155",
                        fontWeight: isActive ? 700 : 500,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Icon size={18} color={isActive ? "#7C3AED" : "#64748B"} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            backgroundColor: isActive ? "#7C3AED" : "rgba(124, 58, 237, 0.1)",
                            color: isActive ? "#FFFFFF" : "#7C3AED",
                            fontWeight: 700,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Bottom Actions */}
            <div style={{ padding: "14px 12px 24px", borderTop: "1px solid rgba(0, 0, 0, 0.06)", display: "flex", flexDirection: "column", gap: "6px" }}>
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  color: "#475569",
                  fontSize: "0.84rem",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                <span>View Storefront</span>
                <ExternalLink size={14} color="#64748B" />
              </a>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  color: "#EF4444",
                  fontSize: "0.84rem",
                  fontWeight: 500,
                  border: "none",
                  backgroundColor: "rgba(239, 68, 68, 0.06)",
                  cursor: "pointer",
                }}
              >
                <span>Sign Out</span>
                <LogOut size={14} color="#EF4444" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR NAVIGATION (Hidden on mobile) */}
      {!isMobile && (
        <aside
          style={{
            width: "230px",
            backgroundColor: "#FFFFFF",
            borderRight: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            zIndex: 50,
            flexShrink: 0,
          }}
        >
          <div>
            {/* Brand Header */}
            <div
              style={{
                padding: "18px 16px",
                borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <BravonLogo size="sm" iconOnly />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Bravon Store</div>
                <div style={{ fontSize: "0.7rem", color: "#64748B" }}>Admin Control</div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav style={{ padding: "12px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: isActive ? "rgba(124, 58, 237, 0.08)" : "transparent",
                      color: isActive ? "#7C3AED" : "#475569",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Icon size={16} color={isActive ? "#7C3AED" : "#64748B"} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          padding: "1px 6px",
                          borderRadius: "10px",
                          backgroundColor: isActive ? "#7C3AED" : "rgba(124, 58, 237, 0.1)",
                          color: isActive ? "#FFFFFF" : "#7C3AED",
                          fontWeight: 700,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div style={{ padding: "12px 8px 24px", borderTop: "1px solid rgba(0, 0, 0, 0.06)", display: "flex", flexDirection: "column", gap: "2px" }}>
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "8px",
                color: "#475569",
                fontSize: "0.82rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.12s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span>View Storefront</span>
              <ExternalLink size={13} color="#64748B" />
            </a>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "8px",
                color: "#DC2626",
                fontSize: "0.82rem",
                fontWeight: 500,
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                transition: "all 0.12s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span>Sign Out</span>
              <LogOut size={13} color="#DC2626" />
            </button>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F8FAFC",
          overflowY: "auto",
          width: "100%",
        }}
      >
        {/* Desktop Top Header Bar */}
        {!isMobile && (
          <header
            style={{
              height: "54px",
              backgroundColor: "#FFFFFF",
              borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              position: "sticky",
              top: 0,
              zIndex: 40,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748B" }}>Store Settings</span>
              <span style={{ color: "#CBD5E1" }}>/</span>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>
                {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
              </span>
            </div>

            {!["orders", "claims", "reviews", "security", "env"].includes(activeTab) && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#FFFFFF",
                    color: "#475569",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 16px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: saveSuccess ? "#10B981" : "#7C3AED",
                    color: "#FFFFFF",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: saving ? "wait" : "pointer",
                    boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {saveSuccess ? <Check size={14} /> : <Save size={14} />}
                  <span>{saveSuccess ? "Changes Saved!" : saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            )}
          </header>
        )}

        {/* Global Save Banners */}
        {saveError && (
          <div style={{ margin: "16px 20px 0", padding: "10px 14px", borderRadius: "8px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={15} />
            <span>{saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div style={{ margin: "16px 20px 0", padding: "10px 14px", borderRadius: "8px", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", color: "#047857", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={15} />
            <span>Settings saved successfully. Changes are live on your storefront!</span>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div style={{ padding: isMobile ? "16px 14px 100px" : "24px 28px 60px", maxWidth: "1000px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

          {/* TAB 0: ORDERS & FULFILLMENT */}
          {activeTab === "orders" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Top KPI Cards */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "12px" }}>
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "18px 20px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Total Revenue (USD)</span>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
                    ${orderStats.totalRevenueUSD.toFixed(2)}
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#16A34A", fontWeight: 600 }}>Stripe Verified Gross</span>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "18px 20px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Total Paid Orders</span>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
                    {orderStats.totalOrders}
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#64748B" }}>Thermal hardware units</span>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "18px 20px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Pending Dispatch</span>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: orderStats.unfulfilled > 0 ? "#D97706" : "#16A34A", marginTop: "4px" }}>
                    {orderStats.unfulfilled}
                  </div>
                  <span style={{ fontSize: "0.72rem", color: orderStats.unfulfilled > 0 ? "#D97706" : "#16A34A", fontWeight: 600 }}>
                    {orderStats.unfulfilled > 0 ? "Awaiting carrier shipment" : "All orders fulfilled"}
                  </span>
                </div>
              </div>

              {/* Orders Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    Customer Orders ({orders.length})
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "#64748B", margin: "2px 0 0" }}>
                    Live customer purchases captured via Stripe Checkout & Webhook
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadOrders}
                  disabled={loadingOrders}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.12)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw size={13} className={loadingOrders ? "animate-spin" : ""} />
                  {loadingOrders ? "Refreshing..." : "Refresh Orders"}
                </button>
              </div>

              {/* Orders List */}
              {orders.length === 0 ? (
                <div style={{ backgroundColor: "#FFFFFF", border: "1px dashed rgba(0,0,0,0.15)", borderRadius: "12px", padding: "48px 24px", textAlign: "center" }}>
                  <ShoppingBag size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
                    No Orders Recorded Yet
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#64748B", maxWidth: "420px", margin: "0 auto" }}>
                    When customers purchase a Bravon Thermal Printer via Stripe Checkout, their shipping details, selected color, and invoice reference will appear here for fulfillment.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {orders.map((ord) => {
                    const isShipped = ord.fulfillmentStatus === "shipped" || ord.fulfillmentStatus === "delivered";
                    const isUpdating = updatingOrderId === ord.id;
                    const trackingData = trackingInputs[ord.id] || { carrier: ord.trackingCarrier || "USPS", trackingNumber: ord.trackingNumber || "" };

                    return (
                      <div
                        key={ord.id}
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: "12px",
                          padding: "18px 20px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                        }}
                      >
                        {/* Top row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0F172A" }}>
                                {ord.customerName || ord.customerEmail}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  backgroundColor: isShipped ? "#ECFDF5" : "#FEF3C7",
                                  color: isShipped ? "#047857" : "#B45309",
                                  border: `1px solid ${isShipped ? "#A7F3D0" : "#FDE68A"}`,
                                  textTransform: "uppercase",
                                }}
                              >
                                {ord.fulfillmentStatus}
                              </span>
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                              {new Date(ord.createdAt).toLocaleString()} · Ref: {ord.id.slice(0, 20)}...
                            </span>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#7C3AED" }}>
                              ${ord.amountTotal?.toFixed(2)} USD
                            </div>
                            <span style={{ fontSize: "0.72rem", color: "#16A34A", fontWeight: 600 }}>● Paid via Stripe</span>
                          </div>
                        </div>

                        {/* Order Details Body */}
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr", gap: "16px", padding: "12px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.05)", marginBottom: "14px" }}>
                          <div>
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Purchased Items</span>
                            <div style={{ marginTop: "4px" }}>
                              {ord.items?.map((it: any, i: number) => (
                                <div key={i} style={{ fontSize: "0.85rem", color: "#0F172A", fontWeight: 600 }}>
                                  {it.name} <span style={{ color: "#7C3AED" }}>({it.color})</span> × {it.quantity}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Shipping Address</span>
                            <div style={{ fontSize: "0.82rem", color: "#334155", marginTop: "4px", lineHeight: 1.4 }}>
                              {ord.shipping?.address ? (
                                <>
                                  <div>{ord.shipping.name || ord.customerName}</div>
                                  <div>{ord.shipping.address.line1} {ord.shipping.address.line2}</div>
                                  <div>{ord.shipping.address.city}, {ord.shipping.address.state} {ord.shipping.address.postal_code} {ord.shipping.address.country}</div>
                                </>
                              ) : (
                                <div style={{ color: "#64748B" }}>Digital fulfillment / No street address recorded</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Fulfillment Action Form */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", flex: 1 }}>
                            <select
                              value={trackingData.carrier}
                              onChange={(e) => setTrackingInputs({ ...trackingInputs, [ord.id]: { ...trackingData, carrier: e.target.value } })}
                              style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.8rem", backgroundColor: "#FFFFFF" }}
                            >
                              <option value="USPS">USPS</option>
                              <option value="FedEx">FedEx</option>
                              <option value="UPS">UPS</option>
                              <option value="DHL">DHL Express</option>
                            </select>

                            <input
                              type="text"
                              placeholder="Enter tracking number"
                              value={trackingData.trackingNumber}
                              onChange={(e) => setTrackingInputs({ ...trackingInputs, [ord.id]: { ...trackingData, trackingNumber: e.target.value } })}
                              style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.8rem", minWidth: isMobile ? "100%" : "220px", flex: 1 }}
                            />
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            {!isShipped ? (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateFulfillment(ord.id, "shipped")}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  backgroundColor: "#059669",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "7px 14px",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  cursor: isUpdating ? "wait" : "pointer",
                                }}
                              >
                                <Truck size={13} /> {isUpdating ? "Saving..." : "Mark as Shipped"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateFulfillment(ord.id, "unfulfilled")}
                                style={{
                                  backgroundColor: "#F1F5F9",
                                  color: "#475569",
                                  border: "1px solid rgba(0,0,0,0.1)",
                                  borderRadius: "6px",
                                  padding: "7px 12px",
                                  fontSize: "0.76rem",
                                  cursor: isUpdating ? "wait" : "pointer",
                                }}
                              >
                                Revert to Unfulfilled
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: RETURNS & WARRANTY CLAIMS (RMA) */}
          {activeTab === "claims" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Claims KPI Stats */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr 1fr", gap: "12px" }}>
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "18px 20px" }}>
                  <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>Total Claims</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>{claims.length}</div>
                  <div style={{ fontSize: "0.74rem", color: "#64748B", marginTop: "2px" }}>Lifetime RMA tickets</div>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "18px 20px" }}>
                  <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.04em" }}>Pending Review</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#D97706", marginTop: "4px" }}>
                    {claims.filter((c) => c.status === "pending").length}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "#64748B", marginTop: "2px" }}>Awaiting triage</div>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "18px 20px" }}>
                  <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.04em" }}>In Process</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2563EB", marginTop: "4px" }}>
                    {claims.filter((c) => c.status === "approved" || c.status === "inspecting").length}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "#64748B", marginTop: "2px" }}>Approved / Inspecting</div>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "18px 20px" }}>
                  <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#16A34A", textTransform: "uppercase", letterSpacing: "0.04em" }}>Resolved</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#16A34A", marginTop: "4px" }}>
                    {claims.filter((c) => c.status === "replaced" || c.status === "refunded").length}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "#64748B", marginTop: "2px" }}>Replacements & refunds</div>
                </div>
              </div>

              {/* Claims Controls & Filter Tabs */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "16px 14px" : "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    { id: "all", label: "All Tickets" },
                    { id: "pending", label: "Pending" },
                    { id: "approved", label: "Approved" },
                    { id: "inspecting", label: "Inspecting" },
                    { id: "replaced", label: "Replaced" },
                    { id: "refunded", label: "Refunded" },
                    { id: "rejected", label: "Rejected" },
                  ].map((filter) => {
                    const count = filter.id === "all" ? claims.length : claims.filter((c) => c.status === filter.id).length;
                    const isActive = claimFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setClaimFilter(filter.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: isActive ? "1px solid #7C3AED" : "1px solid rgba(0,0,0,0.08)",
                          backgroundColor: isActive ? "rgba(124, 58, 237, 0.08)" : "#FFFFFF",
                          color: isActive ? "#7C3AED" : "#64748B",
                          fontSize: "0.78rem",
                          fontWeight: isActive ? 700 : 500,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>{filter.label}</span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "1px 5px",
                            borderRadius: "10px",
                            backgroundColor: isActive ? "#7C3AED" : "#F1F5F9",
                            color: isActive ? "#FFFFFF" : "#64748B",
                            fontWeight: 700,
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <a
                    href="/returns"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid rgba(0,0,0,0.1)",
                      backgroundColor: "#FFFFFF",
                      color: "#475569",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    <span>Customer Portal</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    type="button"
                    onClick={loadClaims}
                    disabled={loadingClaims}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid rgba(0,0,0,0.1)",
                      backgroundColor: "#FFFFFF",
                      color: "#475569",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <RefreshCw size={12} className={loadingClaims ? "animate-spin" : ""} />
                    <span>{loadingClaims ? "Refreshing..." : "Refresh"}</span>
                  </button>
                </div>
              </div>

              {/* Claims List */}
              {claims.length === 0 ? (
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "48px 24px", textAlign: "center" }}>
                  <ShieldAlert size={36} color="#94A3B8" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
                    No warranty or return claims yet
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "#64748B", margin: 0 }}>
                    When customers submit returns or warranty claims at <span style={{ fontFamily: "monospace" }}>/returns</span>, tickets will appear here instantly.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {claims
                    .filter((c) => claimFilter === "all" || c.status === claimFilter)
                    .map((claim) => {
                      const isUpdating = updatingClaimId === claim.id;
                      const statusColors: { [key: string]: { bg: string; text: string; border: string } } = {
                        pending: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
                        approved: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
                        inspecting: { bg: "#EDE9FE", text: "#5B21B6", border: "#DDD6FE" },
                        replaced: { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0" },
                        refunded: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
                        rejected: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
                      };
                      const color = statusColors[claim.status] || { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" };

                      return (
                        <div
                          key={claim.id}
                          style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "12px",
                            border: "1px solid rgba(0,0,0,0.08)",
                            padding: isMobile ? "16px 14px" : "20px 24px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                          }}
                        >
                          {/* Claim Header */}
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  backgroundColor: "#F8FAFC",
                                  border: "1px solid rgba(0,0,0,0.06)",
                                  fontFamily: "monospace",
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  color: "#0F172A",
                                }}
                              >
                                {claim.id}
                              </div>

                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  padding: "3px 8px",
                                  borderRadius: "999px",
                                  backgroundColor: color.bg,
                                  color: color.text,
                                  border: `1px solid ${color.border}`,
                                }}
                              >
                                {claim.status}
                              </span>

                              <span
                                style={{
                                  fontSize: "0.74rem",
                                  fontWeight: 600,
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  backgroundColor: claim.claimType === "warranty" ? "rgba(124, 58, 237, 0.08)" : "rgba(37, 99, 235, 0.08)",
                                  color: claim.claimType === "warranty" ? "#7C3AED" : "#2563EB",
                                }}
                              >
                                {claim.claimType === "warranty" ? "Warranty Claim" : "Return / Refund"}
                              </span>
                            </div>

                            <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                              Submitted {new Date(claim.createdAt).toLocaleDateString()} at {new Date(claim.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          {/* Customer & Order details grid */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                              gap: "12px",
                              backgroundColor: "#F8FAFC",
                              padding: "12px 14px",
                              borderRadius: "8px",
                              fontSize: "0.8rem",
                            }}
                          >
                            <div>
                              <div style={{ color: "#64748B", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 600 }}>Customer</div>
                              <div style={{ fontWeight: 600, color: "#0F172A", marginTop: "2px" }}>{claim.customerName || "Customer"}</div>
                              <div style={{ color: "#475569" }}>{claim.customerEmail}</div>
                              {claim.customerPhone && <div style={{ color: "#64748B", fontSize: "0.74rem" }}>{claim.customerPhone}</div>}
                            </div>

                            <div>
                              <div style={{ color: "#64748B", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 600 }}>Order Reference</div>
                              <div style={{ fontWeight: 600, color: "#0F172A", marginTop: "2px", fontFamily: "monospace" }}>{claim.orderId}</div>
                              {claim.serialNumber && (
                                <div style={{ color: "#64748B", fontSize: "0.74rem", marginTop: "2px" }}>
                                  Serial: <span style={{ fontFamily: "monospace", color: "#0F172A" }}>{claim.serialNumber}</span>
                                </div>
                              )}
                              {claim.purchaseDate && <div style={{ color: "#64748B", fontSize: "0.74rem" }}>Purchased: {claim.purchaseDate}</div>}
                            </div>

                            <div>
                              <div style={{ color: "#64748B", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 600 }}>Reason for Request</div>
                              <div style={{ fontWeight: 600, color: "#0F172A", marginTop: "2px" }}>{claim.reason}</div>
                              {claim.preferredResolution && (
                                <div style={{ color: "#64748B", fontSize: "0.74rem", marginTop: "2px" }}>
                                  Prefers: {claim.preferredResolution}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Issue Description */}
                          <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B", marginBottom: "4px" }}>
                              Customer Description:
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "#334155", backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", padding: "10px 12px", borderRadius: "6px", lineHeight: 1.5 }}>
                              {claim.description}
                            </div>
                          </div>

                          {/* Admin Notes & Status Transitions */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: isMobile ? "column" : "row",
                              alignItems: isMobile ? "stretch" : "center",
                              justifyContent: "space-between",
                              gap: "12px",
                              borderTop: "1px solid rgba(0,0,0,0.06)",
                              paddingTop: "12px",
                            }}
                          >
                            {/* Internal Note Input */}
                            <div style={{ display: "flex", gap: "6px", flex: 1, maxWidth: isMobile ? "100%" : "380px" }}>
                              <input
                                type="text"
                                placeholder={claim.adminNotes ? `Note: ${claim.adminNotes}` : "Add internal note..."}
                                value={adminNotesInputs[claim.id] !== undefined ? adminNotesInputs[claim.id] : ""}
                                onChange={(e) => setAdminNotesInputs((prev) => ({ ...prev, [claim.id]: e.target.value }))}
                                style={{
                                  flex: 1,
                                  padding: "6px 10px",
                                  fontSize: "0.78rem",
                                  borderRadius: "6px",
                                  border: "1px solid rgba(0,0,0,0.12)",
                                  outline: "none",
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateClaimStatus(claim.id, claim.status, adminNotesInputs[claim.id])}
                                disabled={isUpdating}
                                style={{
                                  padding: "6px 10px",
                                  fontSize: "0.76rem",
                                  fontWeight: 600,
                                  borderRadius: "6px",
                                  border: "1px solid rgba(0,0,0,0.1)",
                                  backgroundColor: "#FFFFFF",
                                  color: "#334155",
                                  cursor: "pointer",
                                }}
                              >
                                Save Note
                              </button>
                            </div>

                            {/* Status Change Buttons */}
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: isMobile ? "stretch" : "flex-end" }}>
                              {claim.status === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateClaimStatus(claim.id, "approved")}
                                    disabled={isUpdating}
                                    style={{
                                      padding: "7px 12px",
                                      borderRadius: "6px",
                                      backgroundColor: "#2563EB",
                                      color: "#FFFFFF",
                                      border: "none",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: isUpdating ? "wait" : "pointer",
                                    }}
                                  >
                                    Approve RMA
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateClaimStatus(claim.id, "rejected")}
                                    disabled={isUpdating}
                                    style={{
                                      padding: "7px 12px",
                                      borderRadius: "6px",
                                      backgroundColor: "#FEE2E2",
                                      color: "#991B1B",
                                      border: "1px solid #FECACA",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: isUpdating ? "wait" : "pointer",
                                    }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {claim.status === "approved" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateClaimStatus(claim.id, "inspecting")}
                                    disabled={isUpdating}
                                    style={{
                                      padding: "7px 12px",
                                      borderRadius: "6px",
                                      backgroundColor: "#7C3AED",
                                      color: "#FFFFFF",
                                      border: "none",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: isUpdating ? "wait" : "pointer",
                                    }}
                                  >
                                    Mark Inspecting
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateClaimStatus(claim.id, "replaced")}
                                    disabled={isUpdating}
                                    style={{
                                      padding: "7px 12px",
                                      borderRadius: "6px",
                                      backgroundColor: "#16A34A",
                                      color: "#FFFFFF",
                                      border: "none",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: isUpdating ? "wait" : "pointer",
                                    }}
                                  >
                                    Issue Replacement
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateClaimStatus(claim.id, "refunded")}
                                    disabled={isUpdating}
                                    style={{
                                      padding: "7px 12px",
                                      borderRadius: "6px",
                                      backgroundColor: "#059669",
                                      color: "#FFFFFF",
                                      border: "none",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: isUpdating ? "wait" : "pointer",
                                    }}
                                  >
                                    Issue Refund
                                  </button>
                                </>
                              )}

                              {claim.status === "inspecting" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateClaimStatus(claim.id, "replaced")}
                                    disabled={isUpdating}
                                    style={{
                                      padding: "7px 12px",
                                      borderRadius: "6px",
                                      backgroundColor: "#16A34A",
                                      color: "#FFFFFF",
                                      border: "none",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: isUpdating ? "wait" : "pointer",
                                    }}
                                  >
                                    Mark Replaced
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateClaimStatus(claim.id, "refunded")}
                                    disabled={isUpdating}
                                    style={{
                                      padding: "7px 12px",
                                      borderRadius: "6px",
                                      backgroundColor: "#059669",
                                      color: "#FFFFFF",
                                      border: "none",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: isUpdating ? "wait" : "pointer",
                                    }}
                                  >
                                    Mark Refunded
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateClaimStatus(claim.id, "rejected")}
                                    disabled={isUpdating}
                                    style={{
                                      padding: "7px 12px",
                                      borderRadius: "6px",
                                      backgroundColor: "#FEE2E2",
                                      color: "#991B1B",
                                      border: "1px solid #FECACA",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: isUpdating ? "wait" : "pointer",
                                    }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {(claim.status === "replaced" || claim.status === "refunded" || claim.status === "rejected") && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateClaimStatus(claim.id, "pending")}
                                  disabled={isUpdating}
                                  style={{
                                    padding: "7px 12px",
                                    borderRadius: "6px",
                                    backgroundColor: "#FFFFFF",
                                    border: "1px solid rgba(0,0,0,0.12)",
                                    color: "#475569",
                                    fontSize: "0.76rem",
                                    cursor: isUpdating ? "wait" : "pointer",
                                  }}
                                >
                                  Reopen as Pending
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* TAB: CUSTOMER REVIEWS & MODERATION */}
          {activeTab === "reviews" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Header Card */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  padding: isMobile ? "18px 14px" : "22px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "center",
                  flexDirection: isMobile ? "column" : "row",
                  gap: "16px",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 6px", color: "#0F172A" }}>
                    Customer Reviews & Moderation
                  </h2>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B" }}>
                    Manage customer reviews, moderate submissions, feature top testimonials on the homepage, and inspect buyer sentiment.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={loadReviews}
                    disabled={loadingReviews}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      backgroundColor: "#FFFFFF",
                      color: "#475569",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <RefreshCw size={14} className={loadingReviews ? "animate-spin" : ""} />
                    <span>Refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddReviewModal(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#7C3AED",
                      color: "#FFFFFF",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Review</span>
                  </button>
                </div>
              </div>

              {/* Review Metrics KPI Strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
                  gap: "14px",
                }}
              >
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "16px" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Total Reviews
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
                    {reviews.length}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#16A34A", marginTop: "2px", fontWeight: 600 }}>
                    {reviewsStats.totalReviews} live on storefront
                  </div>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "16px" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Average Rating
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0F172A", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{reviewsStats.averageRating.toFixed(1)}</span>
                    <Star size={20} fill="#F59E0B" color="#F59E0B" />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "2px" }}>
                    Out of 5.0 stars
                  </div>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "16px" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    5-Star Reviews
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
                    {reviewsStats.ratingCounts[5] || 0}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "2px" }}>
                    {reviewsStats.totalReviews > 0 ? Math.round(((reviewsStats.ratingCounts[5] || 0) / reviewsStats.totalReviews) * 100) : 0}% top satisfaction
                  </div>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "16px" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Recommendation
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#7C3AED", marginTop: "4px" }}>
                    {reviewsStats.recommendRate}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "2px" }}>
                    Recommend to colleagues
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { id: "all", label: `All Reviews (${reviews.length})` },
                  { id: "pending", label: `Pending Moderation (${reviews.filter((r) => r.status === "pending").length})` },
                  { id: "approved", label: `Approved & Live (${reviews.filter((r) => r.status === "approved").length})` },
                  { id: "featured", label: `Featured on Home (${reviews.filter((r) => r.isFeatured).length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setReviewFilter(f.id as any)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      border: reviewFilter === f.id ? "1px solid #7C3AED" : "1px solid rgba(0,0,0,0.08)",
                      backgroundColor: reviewFilter === f.id ? "#7C3AED" : "#FFFFFF",
                      color: reviewFilter === f.id ? "#FFFFFF" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Reviews List */}
              {loadingReviews ? (
                <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF", borderRadius: "12px", color: "#94A3B8" }}>
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF", borderRadius: "12px", color: "#64748B" }}>
                  No customer reviews found. Click &quot;Add Review&quot; above to create one.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {reviews
                    .filter((r) => {
                      if (reviewFilter === "all") return true;
                      if (reviewFilter === "pending") return r.status === "pending";
                      if (reviewFilter === "approved") return r.status === "approved";
                      if (reviewFilter === "featured") return r.isFeatured;
                      return true;
                    })
                    .map((rev) => {
                      const initials = rev.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <div
                          key={rev.id}
                          style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "12px",
                            border: "1px solid rgba(0,0,0,0.08)",
                            padding: isMobile ? "16px 14px" : "20px 24px",
                            boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              flexWrap: "wrap",
                              gap: "12px",
                              marginBottom: "12px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div
                                style={{
                                  width: "38px",
                                  height: "38px",
                                  borderRadius: "50%",
                                  backgroundColor: "#0F172A",
                                  color: "#FFFFFF",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                }}
                              >
                                {initials}
                              </div>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>
                                    {rev.author}
                                  </span>
                                  {rev.verified && (
                                    <span style={{ fontSize: "0.72rem", color: "#16A34A", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                      <CheckCircle2 size={12} fill="#16A34A" color="#FFFFFF" /> Verified
                                    </span>
                                  )}
                                  <span
                                    style={{
                                      fontSize: "0.72rem",
                                      fontWeight: 600,
                                      color: "#475569",
                                      backgroundColor: "#F1F5F9",
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    Finish: {rev.variantPurchased || "Dark Slate"}
                                  </span>
                                </div>
                                <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                                  {rev.role || "Verified Buyer"} · {rev.date}
                                </div>
                              </div>
                            </div>

                            {/* Status & Featured Badges */}
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              {rev.isFeatured && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "3px 8px",
                                    borderRadius: "999px",
                                    backgroundColor: "rgba(124, 58, 237, 0.1)",
                                    color: "#7C3AED",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  <Star size={11} fill="#7C3AED" /> Featured on Home
                                </span>
                              )}
                              <span
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: "999px",
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  backgroundColor:
                                    rev.status === "approved"
                                      ? "rgba(22, 163, 74, 0.1)"
                                      : rev.status === "pending"
                                      ? "rgba(217, 119, 6, 0.1)"
                                      : "rgba(239, 68, 68, 0.1)",
                                  color:
                                    rev.status === "approved"
                                      ? "#16A34A"
                                      : rev.status === "pending"
                                      ? "#D97706"
                                      : "#DC2626",
                                }}
                              >
                                {rev.status === "approved" ? "Live" : rev.status === "pending" ? "Pending" : "Hidden"}
                              </span>
                            </div>
                          </div>

                          {/* Star Rating & Title */}
                          <div style={{ marginBottom: "8px" }}>
                            <div style={{ display: "flex", gap: "2px", marginBottom: "4px" }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={14}
                                  fill={s <= rev.rating ? "#F59E0B" : "none"}
                                  color={s <= rev.rating ? "#F59E0B" : "#CBD5E1"}
                                />
                              ))}
                            </div>
                            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>
                              &ldquo;{rev.title}&rdquo;
                            </h4>
                            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                              {rev.comment}
                            </p>
                          </div>

                          {/* Action Buttons Bar */}
                          <div
                            style={{
                              borderTop: "1px solid rgba(0,0,0,0.06)",
                              paddingTop: "12px",
                              marginTop: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "8px",
                            }}
                          >
                            <span style={{ fontSize: "0.75rem", color: "#94A3B8", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <ThumbsUp size={12} /> {rev.helpfulCount || 0} found helpful
                            </span>

                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <button
                                type="button"
                                onClick={() => handleToggleFeaturedReview(rev.id, rev.isFeatured)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  border: rev.isFeatured ? "1px solid #7C3AED" : "1px solid rgba(0,0,0,0.1)",
                                  backgroundColor: rev.isFeatured ? "rgba(124, 58, 237, 0.08)" : "#FFFFFF",
                                  color: rev.isFeatured ? "#7C3AED" : "#64748B",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                <Star size={12} fill={rev.isFeatured ? "#7C3AED" : "none"} />
                                <span>{rev.isFeatured ? "Unfeature" : "Feature on Home"}</span>
                              </button>

                              {rev.status !== "approved" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateReviewStatus(rev.id, "approved")}
                                  style={{
                                    padding: "5px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid #16A34A",
                                    backgroundColor: "rgba(22, 163, 74, 0.08)",
                                    color: "#16A34A",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Approve & Publish
                                </button>
                              )}

                              {rev.status !== "rejected" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateReviewStatus(rev.id, "rejected")}
                                  style={{
                                    padding: "5px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    backgroundColor: "#FFFFFF",
                                    color: "#64748B",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Hide / Reject
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev.id)}
                                style={{
                                  padding: "5px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid rgba(239, 68, 68, 0.2)",
                                  backgroundColor: "rgba(239, 68, 68, 0.05)",
                                  color: "#DC2626",
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Add Review Modal for Admin */}
              {showAddReviewModal && (
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9999,
                    backgroundColor: "rgba(15, 23, 42, 0.65)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                  }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setShowAddReviewModal(false);
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "16px",
                      padding: "28px",
                      maxWidth: "520px",
                      width: "100%",
                      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                      maxHeight: "90vh",
                      overflowY: "auto",
                      position: "relative",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowAddReviewModal(false)}
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        background: "none",
                        border: "none",
                        color: "#64748B",
                        cursor: "pointer",
                      }}
                    >
                      <X size={20} />
                    </button>

                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
                      Add Customer Review / Testimonial
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "#64748B", margin: "0 0 20px" }}>
                      Manually add verified customer feedback to display on the storefront.
                    </p>

                    <form onSubmit={handleCreateAdminReview}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                            Customer Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={newReviewForm.author}
                            onChange={(e) => setNewReviewForm({ ...newReviewForm, author: e.target.value })}
                            placeholder="e.g. Jordan Hayes"
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                            Role / Business
                          </label>
                          <input
                            type="text"
                            value={newReviewForm.role}
                            onChange={(e) => setNewReviewForm({ ...newReviewForm, role: e.target.value })}
                            placeholder="e.g. Shopify Store Owner"
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                            Rating (1 to 5 Stars)
                          </label>
                          <select
                            value={newReviewForm.rating}
                            onChange={(e) => setNewReviewForm({ ...newReviewForm, rating: Number(e.target.value) })}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", backgroundColor: "#FFFFFF" }}
                          >
                            <option value={5}>5 Stars — Outstanding</option>
                            <option value={4}>4 Stars — Great</option>
                            <option value={3}>3 Stars — Average</option>
                            <option value={2}>2 Stars — Poor</option>
                            <option value={1}>1 Star — Bad</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                            Purchased Finish
                          </label>
                          <select
                            value={newReviewForm.variantPurchased}
                            onChange={(e) => setNewReviewForm({ ...newReviewForm, variantPurchased: e.target.value })}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", backgroundColor: "#FFFFFF" }}
                          >
                            <option value="Dark Slate">Dark Slate</option>
                            <option value="Arctic White">Arctic White</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: "14px" }}>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                          Review Headline *
                        </label>
                        <input
                          type="text"
                          required
                          value={newReviewForm.title}
                          onChange={(e) => setNewReviewForm({ ...newReviewForm, title: e.target.value })}
                          placeholder="e.g. Best investment for our daily order fulfillment"
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem" }}
                        />
                      </div>

                      <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                          Review Comment *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={newReviewForm.comment}
                          onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                          placeholder="Write the detailed testimonial..."
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", resize: "vertical" }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => setShowAddReviewModal(false)}
                          style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", backgroundColor: "#FFFFFF", color: "#475569", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingAdminReview}
                          style={{ padding: "8px 20px", borderRadius: "6px", border: "none", backgroundColor: "#7C3AED", color: "#FFFFFF", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
                        >
                          {submittingAdminReview ? "Saving..." : "Add Review"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: PRODUCT & PRICING */}
          {activeTab === "product" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 16px", color: "#0F172A" }}>
                  Product Details
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={form.productName}
                      onChange={(e) => handleChange("productName", e.target.value)}
                      placeholder="Bravon POS-9260-L Thermal Printer"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "5px" }}>
                      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>
                        Homepage Hero Headline (H1)
                      </label>
                      <span style={{ fontSize: "0.7rem", color: "#7C3AED", fontWeight: 600 }}>Displayed prominently at top of homepage</span>
                    </div>
                    <input
                      type="text"
                      value={form.heroHeadline}
                      onChange={(e) => handleChange("heroHeadline", e.target.value)}
                      placeholder="Portable precision. Palm-sized power."
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "5px" }}>
                      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>
                        Homepage Hero Subhead / Summary
                      </label>
                      <span style={{ fontSize: "0.7rem", color: "#7C3AED", fontWeight: 600 }}>Displayed directly beneath hero title</span>
                    </div>
                    <textarea
                      rows={3}
                      value={form.heroSubhead}
                      onChange={(e) => handleChange("heroSubhead", e.target.value)}
                      placeholder="A compact, multifunctional device combining portability and 160mm/s efficiency in a palm-sized body..."
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", resize: "vertical" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Tagline / Category Eyebrow
                    </label>
                    <input
                      type="text"
                      value={form.productTagline}
                      onChange={(e) => handleChange("productTagline", e.target.value)}
                      placeholder="Portable Thermal Label & Slip Printer"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Product Buy Page Description
                    </label>
                    <textarea
                      rows={3}
                      value={form.productDescription}
                      onChange={(e) => handleChange("productDescription", e.target.value)}
                      placeholder="Detailed product overview used in the /product buy box and technical specifications"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Box */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 16px", color: "#0F172A" }}>
                  Pricing & Stripe Checkout
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Selling Price ({form.currencySymbol || "$"})
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Compare-At Price ({form.currencySymbol || "$"})
                    </label>
                    <input
                      type="number"
                      value={form.comparePrice}
                      onChange={(e) => handleChange("comparePrice", parseFloat(e.target.value) || 0)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Discount Tag Text
                    </label>
                    <input
                      type="text"
                      value={form.saveAmountText}
                      onChange={(e) => handleChange("saveAmountText", e.target.value)}
                      placeholder="Save $49 Today"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>

              {/* Colorways and Policies */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 16px", color: "#0F172A" }}>
                  Hardware Finishes & Badges
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      White Edition Label
                    </label>
                    <input
                      type="text"
                      value={form.whiteColorLabel}
                      onChange={(e) => handleChange("whiteColorLabel", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Dark Slate Edition Label
                    </label>
                    <input
                      type="text"
                      value={form.darkColorLabel}
                      onChange={(e) => handleChange("darkColorLabel", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Free Shipping Notice
                    </label>
                    <input
                      type="text"
                      value={form.freeShippingText}
                      onChange={(e) => handleChange("freeShippingText", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Warranty Guarantee Text
                    </label>
                    <input
                      type="text"
                      value={form.warrantyText}
                      onChange={(e) => handleChange("warrantyText", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA & CONFIGURABLE IMAGES (Requested by user) */}
          {activeTab === "media" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#0F172A" }}>
                      Configurable Storefront Images
                    </h2>
                    <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0 }}>
                      Change hero photography, cutout product images, and branding assets with instant upload or custom URLs.
                    </p>
                  </div>
                </div>

                {/* Media Image Cards Grid */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {[
                    {
                      key: "heroImageWhite" as keyof SiteConfig,
                      label: "Hero Showcase — Arctic White Model",
                      desc: "Main hero showcase photography for white finish",
                      defaultUrl: "/bravon-ecosystem-white.jpg",
                      presets: [
                        { name: "White Ecosystem", url: "/bravon-ecosystem-white.jpg" },
                        { name: "Shipping Action", url: "/bravon-shipping-action.jpg" },
                        { name: "White Hardware", url: "/printer-white.jpg" },
                      ],
                    },
                    {
                      key: "heroImageDark" as keyof SiteConfig,
                      label: "Hero Showcase — Dark Slate Model",
                      desc: "Main hero showcase photography for dark slate finish",
                      defaultUrl: "/bravon-ecosystem-dark.jpg",
                      presets: [
                        { name: "Dark Ecosystem", url: "/bravon-ecosystem-dark.jpg" },
                        { name: "Dark Hardware", url: "/printer-dark.jpg" },
                      ],
                    },
                    {
                      key: "productImageWhite" as keyof SiteConfig,
                      label: "Product Buy Box — White Cutout",
                      desc: "Transparent cutout PNG for buy-box white selection",
                      defaultUrl: "/exact-printer-white.png",
                      presets: [
                        { name: "White Isolated Cutout", url: "/exact-printer-white.png" },
                        { name: "White Hardware Shot", url: "/printer-white.jpg" },
                      ],
                    },
                    {
                      key: "productImageDark" as keyof SiteConfig,
                      label: "Product Buy Box — Dark Slate Cutout",
                      desc: "Transparent cutout PNG for buy-box dark selection",
                      defaultUrl: "/exact-printer-dark.png",
                      presets: [
                        { name: "Dark Isolated Cutout", url: "/exact-printer-dark.png" },
                        { name: "Dark Hardware Shot", url: "/printer-dark.jpg" },
                      ],
                    },
                    {
                      key: "productImageInBox" as keyof SiteConfig,
                      label: "What's In The Box Shot",
                      desc: "Packaging and bundled accessories overview image",
                      defaultUrl: "/bravon-in-the-box-v3.jpg",
                      presets: [
                        { name: "In The Box Flatlay", url: "/bravon-in-the-box-v3.jpg" },
                      ],
                    },
                    {
                      key: "productImageAction" as keyof SiteConfig,
                      label: "In Action / Small Business Setup",
                      desc: "High-speed shipping station lifestyle photo",
                      defaultUrl: "/bravon-shipping-action-v2.jpg",
                      presets: [
                        { name: "Shipping Station", url: "/bravon-shipping-action-v2.jpg" },
                      ],
                    },
                    {
                      key: "storeLogoUrl" as keyof SiteConfig,
                      label: "Store Brand Logo",
                      desc: "Header and invoice brand logo image",
                      defaultUrl: "/bravon-logo.png",
                      presets: [
                        { name: "Official Logo", url: "/bravon-logo.png" },
                        { name: "Transparent Logo", url: "/bravon-logo-transparent.png" },
                      ],
                    },
                  ].map((item) => {
                    const currentUrl = (form[item.key] as string) || item.defaultUrl;
                    const isUploading = uploadingField === item.key;

                    return (
                      <div
                        key={item.key}
                        style={{
                          borderRadius: "10px",
                          border: "1px solid rgba(0,0,0,0.08)",
                          padding: "16px",
                          backgroundColor: "#FBFBFC",
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          gap: "16px",
                          alignItems: isMobile ? "stretch" : "center",
                        }}
                      >
                        {/* Image Preview Box */}
                        <div
                          style={{
                            width: isMobile ? "100%" : "130px",
                            height: isMobile ? "140px" : "90px",
                            borderRadius: "8px",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid rgba(0,0,0,0.1)",
                            position: "relative",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={currentUrl}
                            alt={item.label}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              // Fallback if URL is broken
                              e.currentTarget.src = item.defaultUrl;
                            }}
                          />
                        </div>

                        {/* Controls */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>
                              {item.label}
                            </span>
                            <p style={{ fontSize: "0.74rem", color: "#64748B", margin: "2px 0 0" }}>
                              {item.desc}
                            </p>
                          </div>

                          {/* URL input */}
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <input
                              type="text"
                              value={currentUrl}
                              onChange={(e) => handleChange(item.key, e.target.value)}
                              placeholder="Image URL or upload..."
                              style={{
                                flex: 1,
                                minWidth: "200px",
                                padding: "7px 10px",
                                borderRadius: "6px",
                                border: "1px solid rgba(0,0,0,0.12)",
                                fontSize: "0.8rem",
                                outline: "none",
                              }}
                            />

                            <button
                              type="button"
                              onClick={() => triggerImageUpload(item.key)}
                              disabled={isUploading}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "7px 12px",
                                borderRadius: "6px",
                                border: "1px solid rgba(124, 58, 237, 0.3)",
                                backgroundColor: "rgba(124, 58, 237, 0.06)",
                                color: "#7C3AED",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                cursor: isUploading ? "wait" : "pointer",
                              }}
                            >
                              <Upload size={13} />
                              <span>{isUploading ? "Uploading..." : "Upload File"}</span>
                            </button>

                            {currentUrl !== item.defaultUrl && (
                              <button
                                type="button"
                                onClick={() => handleChange(item.key, item.defaultUrl)}
                                title="Reset to default image"
                                style={{
                                  padding: "7px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid rgba(0,0,0,0.1)",
                                  backgroundColor: "#FFFFFF",
                                  color: "#64748B",
                                  fontSize: "0.76rem",
                                  cursor: "pointer",
                                }}
                              >
                                Reset
                              </button>
                            )}
                          </div>

                          {/* Quick Presets */}
                          {item.presets && item.presets.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
                              <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>Presets:</span>
                              {item.presets.map((preset) => (
                                <button
                                  key={preset.url}
                                  type="button"
                                  onClick={() => handleChange(item.key, preset.url)}
                                  style={{
                                    border: currentUrl === preset.url ? "1px solid #7C3AED" : "1px solid rgba(0,0,0,0.08)",
                                    backgroundColor: currentUrl === preset.url ? "rgba(124, 58, 237, 0.08)" : "#FFFFFF",
                                    color: currentUrl === preset.url ? "#7C3AED" : "#64748B",
                                    borderRadius: "4px",
                                    padding: "2px 8px",
                                    fontSize: "0.72rem",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                  }}
                                >
                                  {preset.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* VIDEO SHOWCASE SECTION (Client requested dynamic video management) */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Video size={18} color="#7C3AED" />
                      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                        Homepage Video Showcase
                      </h2>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "4px 0 0" }}>
                      Control the printer demonstration video displayed on your storefront. Upload an MP4 or paste any video link.
                    </p>
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.showVideoSection ?? true}
                      onChange={(e) => handleChange("showVideoSection", e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#7C3AED" }}
                    />
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>
                      {form.showVideoSection ? "Section Enabled" : "Section Hidden"}
                    </span>
                  </label>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Headline & Subhead */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                        Section Headline
                      </label>
                      <input
                        type="text"
                        value={form.videoHeadline || ""}
                        onChange={(e) => handleChange("videoHeadline", e.target.value)}
                        placeholder="See Bravon in Action"
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                        Section Subhead / Description
                      </label>
                      <input
                        type="text"
                        value={form.videoSubhead || ""}
                        onChange={(e) => handleChange("videoSubhead", e.target.value)}
                        placeholder="Watch high-speed 160 mm/s direct thermal printing..."
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  {/* Video URL & Upload */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Video File URL (MP4 / WebM / CDN Link)
                    </label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <input
                        type="text"
                        value={form.videoUrl || ""}
                        onChange={(e) => handleChange("videoUrl", e.target.value)}
                        placeholder="/bravon-printer-demo.mp4 or https://..."
                        style={{ flex: 1, minWidth: "220px", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", outline: "none" }}
                      />
                      <button
                        type="button"
                        onClick={() => triggerImageUpload("videoUrl")}
                        disabled={uploadingField === "videoUrl"}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "6px",
                          border: "1px solid rgba(124, 58, 237, 0.3)",
                          backgroundColor: "rgba(124, 58, 237, 0.08)",
                          color: "#7C3AED",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: uploadingField === "videoUrl" ? "wait" : "pointer",
                        }}
                      >
                        <Upload size={14} />
                        <span>{uploadingField === "videoUrl" ? "Uploading Video..." : "Upload Video (.mp4)"}</span>
                      </button>

                      {form.videoUrl !== "/bravon-printer-demo.mp4" && (
                        <button
                          type="button"
                          onClick={() => handleChange("videoUrl", "/bravon-printer-demo.mp4")}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid rgba(0,0,0,0.1)",
                            backgroundColor: "#FFFFFF",
                            color: "#64748B",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                          }}
                        >
                          Reset Demo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Poster Thumbnail Image */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Video Poster Thumbnail Image
                    </label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <input
                        type="text"
                        value={form.videoPosterUrl || ""}
                        onChange={(e) => handleChange("videoPosterUrl", e.target.value)}
                        placeholder="/bravon-shipping-action-v2.jpg or image URL..."
                        style={{ flex: 1, minWidth: "220px", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", outline: "none" }}
                      />
                      <button
                        type="button"
                        onClick={() => triggerImageUpload("videoPosterUrl")}
                        disabled={uploadingField === "videoPosterUrl"}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "6px",
                          border: "1px solid rgba(124, 58, 237, 0.3)",
                          backgroundColor: "rgba(124, 58, 237, 0.08)",
                          color: "#7C3AED",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: uploadingField === "videoPosterUrl" ? "wait" : "pointer",
                        }}
                      >
                        <Upload size={14} />
                        <span>{uploadingField === "videoPosterUrl" ? "Uploading..." : "Upload Poster"}</span>
                      </button>
                    </div>

                    {/* Presets */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                      <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>Poster presets:</span>
                      {[
                        { name: "Shipping Action", url: "/bravon-shipping-action-v2.jpg" },
                        { name: "White Ecosystem", url: "/bravon-ecosystem-white.jpg" },
                        { name: "In The Box", url: "/bravon-in-the-box-v3.jpg" },
                      ].map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => handleChange("videoPosterUrl", preset.url)}
                          style={{
                            border: form.videoPosterUrl === preset.url ? "1px solid #7C3AED" : "1px solid rgba(0,0,0,0.08)",
                            backgroundColor: form.videoPosterUrl === preset.url ? "rgba(124, 58, 237, 0.08)" : "#FFFFFF",
                            color: form.videoPosterUrl === preset.url ? "#7C3AED" : "#64748B",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            fontSize: "0.72rem",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Video Preview in Admin Card */}
                  <div style={{ marginTop: "10px", padding: "14px", backgroundColor: "#0F172A", borderRadius: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Live Video Player Preview
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#64748B" }}>
                        Previewing {form.videoUrl || "default"}
                      </span>
                    </div>

                    <div style={{ position: "relative", width: "100%", maxHeight: "320px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {form.videoUrl ? (
                        <video
                          key={form.videoUrl}
                          src={form.videoUrl}
                          poster={form.videoPosterUrl || undefined}
                          controls
                          playsInline
                          preload="metadata"
                          style={{ width: "100%", maxHeight: "320px", objectFit: "contain", display: "block" }}
                        />
                      ) : (
                        <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748B" }}>
                          <Video size={32} style={{ margin: "0 auto 8px" }} />
                          <p style={{ margin: 0, fontSize: "0.82rem" }}>No video URL set</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HERO & BANNERS */}
          {activeTab === "hero" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Announcement Bar */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#0F172A" }}>
                      Top Announcement Bar
                    </h2>
                    <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0 }}>
                      Subtle alert banner displayed above the navigation header
                    </p>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.showAnnouncement}
                      onChange={(e) => handleChange("showAnnouncement", e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#7C3AED" }}
                    />
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>Enabled</span>
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Badge Tag
                    </label>
                    <input
                      type="text"
                      value={form.announcementTag}
                      onChange={(e) => handleChange("announcementTag", e.target.value)}
                      placeholder="Commercial Release"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Banner Text
                    </label>
                    <input
                      type="text"
                      value={form.announcementText}
                      onChange={(e) => handleChange("announcementText", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>

              {/* Hero Headlines */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 16px", color: "#0F172A" }}>
                  Hero Typography
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Eyebrow Header
                    </label>
                    <input
                      type="text"
                      value={form.heroEyebrow}
                      onChange={(e) => handleChange("heroEyebrow", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Main Headline
                    </label>
                    <input
                      type="text"
                      value={form.heroHeadline}
                      onChange={(e) => handleChange("heroHeadline", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Subhead Paragraph
                    </label>
                    <textarea
                      rows={3}
                      value={form.heroSubhead}
                      onChange={(e) => handleChange("heroSubhead", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STORE & CONTACT */}
          {activeTab === "store" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 16px", color: "#0F172A" }}>
                  Customer Support Channels
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={form.supportEmail}
                      onChange={(e) => handleChange("supportEmail", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Support Phone Number
                    </label>
                    <input
                      type="text"
                      value={form.supportPhone}
                      onChange={(e) => handleChange("supportPhone", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Support Operating Hours
                    </label>
                    <input
                      type="text"
                      value={form.supportHours}
                      onChange={(e) => handleChange("supportHours", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Company Address Line
                    </label>
                    <input
                      type="text"
                      value={form.companyAddress}
                      onChange={(e) => handleChange("companyAddress", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Instagram Profile URL
                    </label>
                    <input
                      type="text"
                      value={form.socialInstagram || ""}
                      onChange={(e) => handleChange("socialInstagram", e.target.value)}
                      placeholder="https://instagram.com/bravoncity"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      X / Twitter Profile URL
                    </label>
                    <input
                      type="text"
                      value={form.socialTwitter || ""}
                      onChange={(e) => handleChange("socialTwitter", e.target.value)}
                      placeholder="https://x.com/bravoncity"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      YouTube Channel URL
                    </label>
                    <input
                      type="text"
                      value={form.socialYoutube || ""}
                      onChange={(e) => handleChange("socialYoutube", e.target.value)}
                      placeholder="https://youtube.com/@bravoncity"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      TikTok Profile URL
                    </label>
                    <input
                      type="text"
                      value={form.socialTiktok || ""}
                      onChange={(e) => handleChange("socialTiktok", e.target.value)}
                      placeholder="https://tiktok.com/@bravoncity"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Facebook Page URL
                    </label>
                    <input
                      type="text"
                      value={form.socialFacebook || ""}
                      onChange={(e) => handleChange("socialFacebook", e.target.value)}
                      placeholder="https://facebook.com/bravoncity"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>

              {/* WARRANTY & BUYER PROTECTION */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#0F172A" }}>
                  Warranty & Buyer Protection Policies
                </h2>
                <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "0 0 16px" }}>
                  Displayed in the buyer protection banner and throughout checkout guarantees.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Warranty Duration Title
                    </label>
                    <input
                      type="text"
                      value={form.warrantyDuration || ""}
                      onChange={(e) => handleChange("warrantyDuration", e.target.value)}
                      placeholder="2-Year Comprehensive"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Return Policy Headline
                    </label>
                    <input
                      type="text"
                      value={form.returnPolicyText || ""}
                      onChange={(e) => handleChange("returnPolicyText", e.target.value)}
                      placeholder="30-Day Risk-Free Money-Back Guarantee"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Warranty Detailed Coverage Summary
                    </label>
                    <textarea
                      rows={2}
                      value={form.warrantyCoverageText || ""}
                      onChange={(e) => handleChange("warrantyCoverageText", e.target.value)}
                      placeholder="Covers thermal printhead, drive motor, motherboard & logic controllers with advance replacement."
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>

              {/* APPS & SOFTWARE DOWNLOAD URLS */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Download size={18} color="#7C3AED" />
                      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                        Apps & Software Download URLs
                      </h2>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "4px 0 0" }}>
                      Manage the download links and app store URLs presented on the /apps page and in the design studio.
                    </p>
                  </div>

                  <a
                    href="/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "0.8rem",
                      color: "#7C3AED",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <span>Preview /apps</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Windows MSI (Default) */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>
                        Windows Installer (.msi) — Recommended Default
                      </label>
                      <span style={{ fontSize: "0.72rem", color: "#16A34A", fontWeight: 700 }}>Primary Download Button</span>
                    </div>
                    <input
                      type="text"
                      value={form.windowsMsiUrl || ""}
                      onChange={(e) => handleChange("windowsMsiUrl", e.target.value)}
                      placeholder="/downloads/Bravon_Print_1.0.0_x64_en-US.msi"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Windows EXE (Secondary) */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Windows Standalone Setup (.exe) — Secondary
                    </label>
                    <input
                      type="text"
                      value={form.windowsExeUrl || ""}
                      onChange={(e) => handleChange("windowsExeUrl", e.target.value)}
                      placeholder="/downloads/Bravon_Print_1.0.0_x64_setup.exe"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Mac DMG */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      macOS Universal Installer (.dmg)
                    </label>
                    <input
                      type="text"
                      value={form.macDownloadUrl || ""}
                      onChange={(e) => handleChange("macDownloadUrl", e.target.value)}
                      placeholder="/downloads/Bravon_Print_1.0.0_universal.dmg"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
                    {/* iOS App Store */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                        Apple App Store URL (iOS)
                      </label>
                      <input
                        type="text"
                        value={form.iosAppStoreUrl || ""}
                        onChange={(e) => handleChange("iosAppStoreUrl", e.target.value)}
                        placeholder="https://apps.apple.com/app/bravon-print"
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>

                    {/* Android Google Play */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                        Google Play Store URL (Android)
                      </label>
                      <input
                        type="text"
                        value={form.androidPlayStoreUrl || ""}
                        onChange={(e) => handleChange("androidPlayStoreUrl", e.target.value)}
                        placeholder="https://play.google.com/store/apps/details?id=com.bravon.print"
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COMMERCE & INVENTORY (Requested by user) */}
          {activeTab === "commerce" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Commerce Settings */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 16px", color: "#0F172A" }}>
                  Currency & Inventory Management
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Store Currency
                    </label>
                    <div
                      style={{
                        padding: "9px 12px",
                        borderRadius: "6px",
                        border: "1px solid rgba(0,0,0,0.08)",
                        backgroundColor: "#F8FAFC",
                        color: "#0F172A",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span style={{ color: "#7C3AED", fontWeight: 800 }}>$</span>
                      <span>USD (United States Dollar)</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Stock Status Badge
                    </label>
                    <select
                      value={form.inventoryStatus || "In Stock - Ready to Ship"}
                      onChange={(e) => handleChange("inventoryStatus", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", backgroundColor: "#FFFFFF" }}
                    >
                      <option value="In Stock - Ready to Ship">In Stock - Ready to Ship</option>
                      <option value="Low Stock - Few Left">Low Stock - Few Left</option>
                      <option value="Pre-Order - Batch Shipping Soon">Pre-Order - Batch Shipping Soon</option>
                      <option value="Temporarily Sold Out">Temporarily Sold Out</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Shipping Speed Notice
                    </label>
                    <input
                      type="text"
                      value={form.shippingSpeedText || "Free 2-Day Priority Dispatch"}
                      onChange={(e) => handleChange("shippingSpeedText", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#0F172A" }}>
                      Store Maintenance Mode
                    </h2>
                    <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0 }}>
                      Temporarily display a maintenance alert across all storefront pages
                    </p>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.maintenanceMode || false}
                      onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#DC2626" }}
                    />
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: form.maintenanceMode ? "#DC2626" : "#334155" }}>
                      {form.maintenanceMode ? "Active" : "Disabled"}
                    </span>
                  </label>
                </div>

                {form.maintenanceMode && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Maintenance Banner Message
                    </label>
                    <input
                      type="text"
                      value={form.maintenanceMessage || ""}
                      onChange={(e) => handleChange("maintenanceMessage", e.target.value)}
                      placeholder="We are currently restocking. Check back soon!"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                )}
              </div>

              {/* SEO Metadata */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 16px", color: "#0F172A" }}>
                  Search Engine Optimization (SEO)
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Meta Page Title
                    </label>
                    <input
                      type="text"
                      value={form.metaTitle || ""}
                      onChange={(e) => handleChange("metaTitle", e.target.value)}
                      placeholder="Bravon Printer — Universal Thermal Label Printer"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Meta Description
                    </label>
                    <textarea
                      rows={2}
                      value={form.metaDescription || ""}
                      onChange={(e) => handleChange("metaDescription", e.target.value)}
                      placeholder="Commercial high-speed thermal label printing. Zero ink, zero toner."
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ENVIRONMENT & API KEYS */}
          {activeTab === "env" && (
            <EnvSettingsTab isMobile={isMobile} />
          )}

          {/* TAB 6: SECURITY & 2FA (Requested by user) */}
          {activeTab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* CARD 1: CHANGE ADMIN PASSWORD */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(124, 58, 237, 0.08)", color: "#7C3AED" }}>
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 2px", color: "#0F172A" }}>
                      Change Admin Password
                    </h2>
                    <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0 }}>
                      Update the master password used to access this console
                    </p>
                  </div>
                </div>

                {passwordMsg && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      backgroundColor: passwordMsg.type === "success" ? "#ECFDF5" : "#FEF2F2",
                      border: `1px solid ${passwordMsg.type === "success" ? "#A7F3D0" : "#FECACA"}`,
                      color: passwordMsg.type === "success" ? "#047857" : "#B91C1C",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {passwordMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                        New Password (min 6 characters)
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
                          required
                          style={{ width: "100%", padding: "9px 34px 9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748B", cursor: "pointer" }}
                        >
                          {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      disabled={updatingPassword}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "6px",
                        backgroundColor: "#7C3AED",
                        color: "#FFFFFF",
                        fontSize: "0.84rem",
                        fontWeight: 600,
                        border: "none",
                        cursor: updatingPassword ? "wait" : "pointer",
                      }}
                    >
                      {updatingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD 2: TWO-FACTOR AUTHENTICATION (2FA / TOTP) */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: twoFactorEnabled ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)", color: twoFactorEnabled ? "#10B981" : "#64748B" }}>
                      <Shield size={20} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                          Two-Factor Authentication (2FA)
                        </h2>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            backgroundColor: twoFactorEnabled ? "#ECFDF5" : "#F1F5F9",
                            color: twoFactorEnabled ? "#047857" : "#64748B",
                            border: `1px solid ${twoFactorEnabled ? "#A7F3D0" : "rgba(0,0,0,0.06)"}`,
                          }}
                        >
                          {twoFactorEnabled ? "Protected (TOTP)" : "Disabled"}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "2px 0 0" }}>
                        Secure admin sign-in with Google Authenticator, Apple Passwords, or 1Password
                      </p>
                    </div>
                  </div>

                  {!twoFactorEnabled ? (
                    !twoFactorSetup && (
                      <button
                        type="button"
                        onClick={start2FASetup}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          backgroundColor: "#7C3AED",
                          color: "#FFFFFF",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <ShieldCheck size={14} />
                        <span>Enable 2FA</span>
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDisableModal(true)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "6px",
                        backgroundColor: "#FEF2F2",
                        border: "1px solid #FECACA",
                        color: "#DC2626",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Disable 2FA
                    </button>
                  )}
                </div>

                {twoFactorMsg && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      backgroundColor: twoFactorMsg.type === "success" ? "#ECFDF5" : "#FEF2F2",
                      border: `1px solid ${twoFactorMsg.type === "success" ? "#A7F3D0" : "#FECACA"}`,
                      color: twoFactorMsg.type === "success" ? "#047857" : "#B91C1C",
                      fontSize: "0.85rem",
                    }}
                  >
                    {twoFactorMsg.text}
                  </div>
                )}

                {/* 2FA SETUP WIZARD */}
                {twoFactorSetup && !twoFactorEnabled && (
                  <div style={{ backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1.5px solid #7C3AED", padding: "20px", marginTop: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#7C3AED" }}>
                        Step 1: Scan QR Code with Authenticator App
                      </span>
                      <button
                        type="button"
                        onClick={() => setTwoFactorSetup(null)}
                        style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer" }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "20px", alignItems: "center" }}>
                      {/* QR Code Container */}
                      <div
                        style={{
                          backgroundColor: "#FFFFFF",
                          padding: "12px",
                          borderRadius: "10px",
                          border: "1px solid rgba(0,0,0,0.1)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <img
                          src={twoFactorSetup.qrImageUrl}
                          alt="2FA QR Code"
                          style={{ width: "180px", height: "180px", display: "block" }}
                        />
                        <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>Scan in Google Auth / 1Password</span>
                      </div>

                      {/* Manual Code & Verification form */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "#64748B", marginBottom: "4px" }}>
                            Can't scan? Enter this secret manually:
                          </label>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <code style={{ flex: 1, padding: "8px 10px", backgroundColor: "#FFFFFF", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "1px" }}>
                              {twoFactorSetup.secret}
                            </code>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(twoFactorSetup.secret);
                                setCopiedSecret(true);
                                setTimeout(() => setCopiedSecret(false), 2000);
                              }}
                              style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.1)", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "0.78rem" }}
                            >
                              <Copy size={13} />
                              <span>{copiedSecret ? "Copied!" : "Copy"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Emergency Backup Codes */}
                        <div>
                          <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "#64748B", marginBottom: "4px" }}>
                            Emergency Backup Codes (Save these in case you lose your phone):
                          </label>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", padding: "8px", backgroundColor: "#FFFFFF", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.1)" }}>
                            {twoFactorSetup.backupCodes.map((code) => (
                              <code key={code} style={{ fontSize: "0.74rem", color: "#334155" }}>{code}</code>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(twoFactorSetup.backupCodes.join("\n"));
                                setCopiedBackupCodes(true);
                                setTimeout(() => setCopiedBackupCodes(false), 2000);
                              }}
                              style={{ border: "none", background: "none", color: "#7C3AED", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                            >
                              {copiedBackupCodes ? "✓ Copied to clipboard" : "Copy All Backup Codes"}
                            </button>
                          </div>
                        </div>

                        {/* Verification Input */}
                        <form onSubmit={handleVerifyAndEnable2FA} style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
                              Step 2: Enter 6-digit code to confirm
                            </label>
                            <input
                              type="text"
                              value={setupCode}
                              onChange={(e) => setSetupCode(e.target.value)}
                              placeholder="000000"
                              maxLength={6}
                              required
                              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1.5px solid #7C3AED", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "4px", textAlign: "center", boxSizing: "border-box" }}
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={verifying2FA}
                            style={{ padding: "10px 18px", borderRadius: "6px", backgroundColor: "#7C3AED", color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: verifying2FA ? "wait" : "pointer" }}
                          >
                            {verifying2FA ? "Verifying..." : "Verify & Turn On"}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 3: SECURITY AUDIT TRAIL */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: isMobile ? "18px 14px" : "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 2px", color: "#0F172A" }}>
                      Security Activity Log
                    </h2>
                    <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0 }}>
                      Audit trail of recent admin logins and credential changes
                    </p>
                  </div>
                </div>

                {securityLogs.length === 0 ? (
                  <p style={{ fontSize: "0.82rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>
                    No security events recorded yet.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {securityLogs.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          backgroundColor: "#F8FAFC",
                          border: "1px solid rgba(0,0,0,0.05)",
                          fontSize: "0.8rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Clock size={13} color="#64748B" />
                          <span style={{ fontWeight: 600, color: "#0F172A" }}>{log.action}</span>
                        </div>
                        <span style={{ color: "#64748B", fontSize: "0.74rem" }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MOBILE BOTTOM FLOATING ACTION BAR (Thumb-friendly saving) */}
        {isMobile && !["orders", "claims", "reviews", "security", "env"].includes(activeTab) && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "12px 16px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(0, 0, 0, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              zIndex: 50,
              boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.05)",
            }}
          >
            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(0, 0, 0, 0.12)",
                backgroundColor: "#FFFFFF",
                color: "#475569",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reset
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: saveSuccess ? "#10B981" : "#7C3AED",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: saving ? "wait" : "pointer",
                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)",
              }}
            >
              {saveSuccess ? <Check size={16} /> : <Save size={16} />}
              <span>{saveSuccess ? "Changes Saved!" : saving ? "Saving..." : "Save All Changes"}</span>
            </button>
          </div>
        )}
      </main>

      {/* DISABLE 2FA CONFIRMATION MODAL */}
      {showDisableModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px", color: "#DC2626" }}>
              Disable Two-Factor Authentication?
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#64748B", margin: "0 0 16px" }}>
              Please enter your admin password to confirm disabling two-factor authentication.
            </p>

            <form onSubmit={handleDisable2FA} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoFocus
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.9rem", boxSizing: "border-box" }}
              />

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setShowDisableModal(false)}
                  style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", background: "#FFFFFF", cursor: "pointer", fontSize: "0.82rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#DC2626", color: "#FFFFFF", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem" }}
                >
                  Confirm Disable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
