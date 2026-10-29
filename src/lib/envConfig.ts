import fs from "fs/promises";
import path from "path";
import Stripe from "stripe";
import { getSupabaseAdmin, isSupabaseConfigured, resetSupabaseAdminClient } from "./supabase";

export interface EnvSettings {
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  stripeWebhookSecret?: string;
  appBaseUrl?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
  adminSessionSecret?: string;
  adminPassword?: string;
  printNodeApiKey?: string;
}

export interface EnvFieldStatus {
  key: keyof EnvSettings;
  label: string;
  envVarName: string;
  description: string;
  category: "stripe" | "supabase" | "general" | "admin";
  value: string;
  maskedValue: string;
  source: "dashboard" | "env" | "not_set";
  isSecret: boolean;
}

const LOCAL_ENV_SETTINGS = path.join(process.cwd(), "src", "data", "env-settings.json");
const TMP_ENV_SETTINGS = path.join("/tmp", "bravon-env-settings.json");

let memoryEnvSettings: EnvSettings | null = null;

function maskSecret(val: string): string {
  if (!val) return "";
  if (val.length <= 8) return "••••••••";
  return `${val.slice(0, 4)}••••••••${val.slice(-4)}`;
}

export async function readSavedEnvSettings(): Promise<EnvSettings> {
  if (memoryEnvSettings) {
    return memoryEnvSettings;
  }

  // 1. Check Supabase first if available
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("site_config")
          .select("config")
          .eq("id", "system_env")
          .single();

        if (!error && data?.config) {
          memoryEnvSettings = data.config as EnvSettings;
          return memoryEnvSettings;
        }
      }
    } catch (err) {
      console.warn("Supabase readSavedEnvSettings note:", err);
    }
  }

  // 2. Check local disk fallback
  try {
    const raw = await fs.readFile(LOCAL_ENV_SETTINGS, "utf-8");
    const parsed = JSON.parse(raw);
    memoryEnvSettings = parsed;
    return parsed;
  } catch {}

  // 3. Check /tmp fallback
  try {
    const raw = await fs.readFile(TMP_ENV_SETTINGS, "utf-8");
    const parsed = JSON.parse(raw);
    memoryEnvSettings = parsed;
    return parsed;
  } catch {}

  return {};
}

export async function saveEnvSettings(newSettings: Partial<EnvSettings>): Promise<EnvSettings> {
  const current = await readSavedEnvSettings();
  const merged: EnvSettings = {
    ...current,
    ...newSettings,
  };

  // Clean empty strings to undefined
  for (const k of Object.keys(merged) as (keyof EnvSettings)[]) {
    if (merged[k] !== undefined && typeof merged[k] === "string" && !merged[k]!.trim()) {
      delete merged[k];
    }
  }

  memoryEnvSettings = merged;

  // 1. Sync directly into runtime process.env for instant reactivity
  if (merged.stripeSecretKey) process.env.STRIPE_SECRET_KEY = merged.stripeSecretKey;
  if (merged.stripePublishableKey) process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = merged.stripePublishableKey;
  if (merged.stripeWebhookSecret) process.env.STRIPE_WEBHOOK_SECRET = merged.stripeWebhookSecret;
  if (merged.appBaseUrl) process.env.NEXT_PUBLIC_BASE_URL = merged.appBaseUrl;
  if (merged.supabaseUrl) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = merged.supabaseUrl;
    resetSupabaseAdminClient();
  }
  if (merged.supabaseAnonKey) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = merged.supabaseAnonKey;
  if (merged.supabaseServiceRoleKey) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = merged.supabaseServiceRoleKey;
    resetSupabaseAdminClient();
  }
  if (merged.adminSessionSecret) process.env.ADMIN_SESSION_SECRET = merged.adminSessionSecret;
  if (merged.adminPassword) process.env.ADMIN_PASSWORD = merged.adminPassword;
  if (merged.printNodeApiKey) process.env.PRINTNODE_API_KEY = merged.printNodeApiKey;

  // 2. Save to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase.from("site_config").upsert(
          {
            id: "system_env",
            config: merged,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }
    } catch (err) {
      console.warn("Supabase saveEnvSettings note:", err);
    }
  }

  // 3. Save to local file
  try {
    const dir = path.dirname(LOCAL_ENV_SETTINGS);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(LOCAL_ENV_SETTINGS, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to LOCAL_ENV_SETTINGS:", err);
  }

  // 4. Save to /tmp
  try {
    const dir = path.dirname(TMP_ENV_SETTINGS);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(TMP_ENV_SETTINGS, JSON.stringify(merged, null, 2), "utf-8");
  } catch {}

  return merged;
}

export async function getEffectiveEnvList(): Promise<EnvFieldStatus[]> {
  const saved = await readSavedEnvSettings();

  const definitions: Array<{
    key: keyof EnvSettings;
    label: string;
    envVarName: string;
    description: string;
    category: EnvFieldStatus["category"];
    envValue: string | undefined;
    isSecret: boolean;
  }> = [
    {
      key: "stripeSecretKey",
      label: "Stripe Secret Key",
      envVarName: "STRIPE_SECRET_KEY",
      description: "Backend secret key for creating checkout sessions and handling refunds (sk_test_... or sk_live_...)",
      category: "stripe",
      envValue: process.env.STRIPE_SECRET_KEY,
      isSecret: true,
    },
    {
      key: "stripePublishableKey",
      label: "Stripe Publishable Key",
      envVarName: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      description: "Client-side key used by Stripe elements or checkout (pk_test_... or pk_live_...)",
      category: "stripe",
      envValue: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      isSecret: false,
    },
    {
      key: "stripeWebhookSecret",
      label: "Stripe Webhook Signing Secret",
      envVarName: "STRIPE_WEBHOOK_SECRET",
      description: "Signing secret to verify authenticity of incoming Stripe events (whsec_...)",
      category: "stripe",
      envValue: process.env.STRIPE_WEBHOOK_SECRET,
      isSecret: true,
    },
    {
      key: "appBaseUrl",
      label: "App Base URL",
      envVarName: "NEXT_PUBLIC_BASE_URL",
      description: "Root domain used for checkout redirect callbacks and email receipts (e.g. https://bravoncity.com)",
      category: "general",
      envValue: process.env.NEXT_PUBLIC_BASE_URL,
      isSecret: false,
    },
    {
      key: "supabaseUrl",
      label: "Supabase Project URL",
      envVarName: "NEXT_PUBLIC_SUPABASE_URL",
      description: "Your Supabase project URL (https://xxxx.supabase.co)",
      category: "supabase",
      envValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
      isSecret: false,
    },
    {
      key: "supabaseAnonKey",
      label: "Supabase Anon Public Key",
      envVarName: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      description: "Public client anon key for browser-safe queries with RLS",
      category: "supabase",
      envValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isSecret: true,
    },
    {
      key: "supabaseServiceRoleKey",
      label: "Supabase Service Role Key",
      envVarName: "SUPABASE_SERVICE_ROLE_KEY",
      description: "Secret administrative key for backend API routes (bypasses RLS)",
      category: "supabase",
      envValue: process.env.SUPABASE_SERVICE_ROLE_KEY,
      isSecret: true,
    },
    {
      key: "adminSessionSecret",
      label: "Admin Session Secret Key",
      envVarName: "ADMIN_SESSION_SECRET",
      description: "Random 32+ character key used to cryptographically sign HMAC session cookies",
      category: "admin",
      envValue: process.env.ADMIN_SESSION_SECRET,
      isSecret: true,
    },
    {
      key: "adminPassword",
      label: "Master Admin Password Override",
      envVarName: "ADMIN_PASSWORD",
      description: "Master password for admin sign in (overrides default bravon2026)",
      category: "admin",
      envValue: process.env.ADMIN_PASSWORD,
      isSecret: true,
    },
    {
      key: "printNodeApiKey",
      label: "PrintNode API Key",
      envVarName: "PRINTNODE_API_KEY",
      description: "API key for silent thermal cloud printing via PrintNode integration",
      category: "general",
      envValue: process.env.PRINTNODE_API_KEY,
      isSecret: true,
    },
  ];

  return definitions.map((def) => {
    const savedVal = saved[def.key];
    const hasSaved = Boolean(savedVal && savedVal.trim());
    const hasEnv = Boolean(def.envValue && def.envValue.trim() && !def.envValue.includes("your-project-id"));

    let effective = "";
    let source: EnvFieldStatus["source"] = "not_set";

    if (hasSaved) {
      effective = savedVal!.trim();
      source = "dashboard";
    } else if (hasEnv) {
      effective = def.envValue!.trim();
      source = "env";
    }

    return {
      key: def.key,
      label: def.label,
      envVarName: def.envVarName,
      description: def.description,
      category: def.category,
      value: effective,
      maskedValue: def.isSecret ? maskSecret(effective) : effective,
      source,
      isSecret: def.isSecret,
    };
  });
}

/**
 * Returns dynamic Stripe client based on dashboard or environment key
 */
export async function getDynamicStripeClient(): Promise<Stripe> {
  const saved = await readSavedEnvSettings();
  const key = saved.stripeSecretKey || process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia" as any,
  });
}

/**
 * Returns dynamic webhook secret
 */
export async function getDynamicWebhookSecret(): Promise<string | undefined> {
  const saved = await readSavedEnvSettings();
  const secret = saved.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
  if (secret && secret.startsWith("whsec_") && !secret.includes("PASTE")) {
    return secret;
  }
  return undefined;
}

/**
 * Returns dynamic App Base URL
 */
export async function getDynamicBaseUrl(reqOrigin?: string): Promise<string> {
  const saved = await readSavedEnvSettings();
  if (saved.appBaseUrl && saved.appBaseUrl.trim()) {
    return saved.appBaseUrl.trim().replace(/\/+$/, "");
  }
  if (reqOrigin && !reqOrigin.includes("localhost")) {
    return reqOrigin.replace(/\/+$/, "");
  }
  if (process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.trim()) {
    return process.env.NEXT_PUBLIC_BASE_URL.trim().replace(/\/+$/, "");
  }
  return reqOrigin || "https://bravoncity.com";
}
