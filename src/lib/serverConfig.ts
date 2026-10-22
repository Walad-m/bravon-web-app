import fs from "fs/promises";
import path from "path";
import { DEFAULT_SITE_CONFIG, SiteConfig } from "./siteConfig";

const LOCAL_PATH = path.join(process.cwd(), "src", "data", "site-config.json");
const TMP_PATH = path.join("/tmp", "bravon-site-config.json");

// In-memory fallback cache for serverless environments
let memoryConfig: SiteConfig | null = null;

export async function readServerConfig(): Promise<SiteConfig> {
  if (memoryConfig) return memoryConfig;

  // Try reading from /tmp first (holds latest serverless writes)
  try {
    const raw = await fs.readFile(TMP_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const merged: SiteConfig = { ...DEFAULT_SITE_CONFIG, ...parsed };
    memoryConfig = merged;
    return merged;
  } catch {}

  // Fallback to local src/data/site-config.json
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const merged: SiteConfig = { ...DEFAULT_SITE_CONFIG, ...parsed };
    memoryConfig = merged;
    return merged;
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
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

  // Try writing to local repo path first (works in local dev)
  try {
    const dir = path.dirname(LOCAL_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(LOCAL_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch {}

  // Also write to /tmp for serverless instances
  try {
    await fs.writeFile(TMP_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch {}

  return merged;
}
