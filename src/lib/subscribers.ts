import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export interface Subscriber {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

const LOCAL_PATH = path.join(process.cwd(), "src", "data", "subscribers.json");
const TMP_PATH = path.join("/tmp", "bravon-subscribers.json");

let memorySubscribers: Subscriber[] | null = null;

export async function readSubscribers(): Promise<Subscriber[]> {
  if (memorySubscribers) return memorySubscribers;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("site_config")
          .select("config")
          .eq("id", "subscribers")
          .single();
        if (!error && Array.isArray(data?.config)) {
          memorySubscribers = data.config;
          return memorySubscribers;
        }
      }
    } catch {}
  }

  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    memorySubscribers = parsed;
    return parsed;
  } catch {}

  try {
    const raw = await fs.readFile(TMP_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    memorySubscribers = parsed;
    return parsed;
  } catch {}

  return [];
}

export async function writeSubscribers(subscribers: Subscriber[]): Promise<void> {
  memorySubscribers = subscribers;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase.from("site_config").upsert(
          {
            id: "subscribers",
            config: subscribers,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }
    } catch {}
  }

  try {
    const dir = path.dirname(LOCAL_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(LOCAL_PATH, JSON.stringify(subscribers, null, 2), "utf-8");
  } catch {}

  try {
    const dir = path.dirname(TMP_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(TMP_PATH, JSON.stringify(subscribers, null, 2), "utf-8");
  } catch {}
}
