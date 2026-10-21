import fs from "fs/promises";
import path from "path";
import { DEFAULT_SITE_CONFIG, SiteConfig } from "./siteConfig";

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "site-config.json");

export async function readServerConfig(): Promise<SiteConfig> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SITE_CONFIG, ...parsed };
  } catch (err) {
    console.warn("Could not read site-config.json, returning default config:", err);
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

  try {
    const dir = path.dirname(CONFIG_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write site-config.json:", err);
    throw new Error("Failed to persist site configuration");
  }

  return merged;
}
