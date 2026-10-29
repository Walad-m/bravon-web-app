import fs from "fs/promises";
import path from "path";
import { DEFAULT_SITE_CONFIG, SiteConfig } from "./siteConfig";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

const LOCAL_PATH = path.join(process.cwd(), "src", "data", "site-config.json");
const TMP_PATH = path.join("/tmp", "bravon-site-config.json");

// In-memory fallback cache for fast performance
let memoryConfig: SiteConfig | null = null;

export async function readServerConfig(): Promise<SiteConfig> {
  // 1. Supabase check
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("site_config")
          .select("config")
          .eq("id", "current")
          .single();

        if (!error && data?.config) {
          const merged: SiteConfig = { ...DEFAULT_SITE_CONFIG, ...data.config };
          memoryConfig = merged;
          return merged;
        }
      }
    } catch (err) {
      console.warn("Supabase readServerConfig warning:", err);
    }
  }

  // In development without Supabase, always read from disk
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev && memoryConfig) {
    return memoryConfig;
  }

  // 2. Try reading from local repo path first (authoritative in local development)
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const merged: SiteConfig = { ...DEFAULT_SITE_CONFIG, ...parsed };
    memoryConfig = merged;
    return merged;
  } catch {}

  // 3. Fallback to /tmp
  try {
    const raw = await fs.readFile(TMP_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const merged: SiteConfig = { ...DEFAULT_SITE_CONFIG, ...parsed };
    memoryConfig = merged;
    return merged;
  } catch {}

  return DEFAULT_SITE_CONFIG;
}

export async function writeServerConfig(newConfig: Partial<SiteConfig>): Promise<SiteConfig> {
  const current = await readServerConfig();
  const merged: SiteConfig = {
    ...current,
    ...newConfig,
    price: Number(newConfig.price ?? current.price),
    comparePrice: Number(newConfig.comparePrice ?? current.comparePrice),
    inventoryCount: Number(newConfig.inventoryCount ?? current.inventoryCount),
  };

  memoryConfig = merged;

  // 1. Persist to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase.from("site_config").upsert(
          {
            id: "current",
            config: merged,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
        if (error) console.error("Supabase writeServerConfig error:", error);
      }
    } catch (err) {
      console.error("Supabase writeServerConfig exception:", err);
    }
  }

  // 2. Write to local repo path
  try {
    const dir = path.dirname(LOCAL_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(LOCAL_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to LOCAL_PATH:", err);
  }

  // 3. Keep TMP_PATH in sync
  try {
    const dir = path.dirname(TMP_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(TMP_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to TMP_PATH:", err);
  }

  return merged;
}
