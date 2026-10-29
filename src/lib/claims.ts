import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export interface Claim {
  id: string; // e.g. "RMA-2026-1048"
  orderId: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  claimType: "return" | "warranty" | "return_30d" | "warranty_2yr" | "doa";
  reason: string;
  description: string;
  serialNumber?: string;
  purchaseDate?: string;
  preferredResolution?: string;
  photoUrl?: string;
  status: "pending" | "approved" | "inspecting" | "replaced" | "refunded" | "rejected";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const LOCAL_CLAIMS = path.join(process.cwd(), "src", "data", "claims.json");
const TMP_CLAIMS = path.join("/tmp", "bravon-claims.json");

let memoryClaims: Claim[] | null = null;

function mapSupabaseToClaim(row: any): Claim {
  return {
    id: row.id,
    orderId: row.order_id,
    customerEmail: row.customer_email,
    customerName: row.customer_name || undefined,
    customerPhone: row.customer_phone || undefined,
    claimType: row.claim_type,
    reason: row.reason,
    description: row.description,
    serialNumber: row.serial_number || undefined,
    purchaseDate: row.purchase_date || undefined,
    preferredResolution: row.preferred_resolution || undefined,
    photoUrl: row.photo_url || undefined,
    status: row.status,
    adminNotes: row.admin_notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapClaimToSupabase(claim: Claim): any {
  return {
    id: claim.id,
    order_id: claim.orderId,
    customer_email: claim.customerEmail,
    customer_name: claim.customerName || null,
    customer_phone: claim.customerPhone || null,
    claim_type: claim.claimType,
    reason: claim.reason,
    description: claim.description,
    serial_number: claim.serialNumber || null,
    purchase_date: claim.purchaseDate || null,
    preferred_resolution: claim.preferredResolution || null,
    photo_url: claim.photoUrl || null,
    status: claim.status,
    admin_notes: claim.adminNotes || null,
    created_at: claim.createdAt,
    updated_at: claim.updatedAt,
  };
}

export async function readClaims(): Promise<Claim[]> {
  // 1. Supabase check
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("claims")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped = data.map(mapSupabaseToClaim);
          memoryClaims = mapped;
          return mapped;
        } else if (error) {
          console.warn("Supabase readClaims warning, falling back to local:", error.message);
        }
      }
    } catch (err) {
      console.warn("Supabase readClaims error:", err);
    }
  }

  // 2. Local fallback
  if (memoryClaims) return memoryClaims;

  try {
    const raw = await fs.readFile(TMP_CLAIMS, "utf-8");
    memoryClaims = JSON.parse(raw);
    return memoryClaims!;
  } catch {}

  try {
    const raw = await fs.readFile(LOCAL_CLAIMS, "utf-8");
    memoryClaims = JSON.parse(raw);
    return memoryClaims!;
  } catch {
    return [];
  }
}

export async function writeClaims(claims: Claim[]): Promise<void> {
  memoryClaims = claims;

  try {
    const dir = path.dirname(LOCAL_CLAIMS);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(LOCAL_CLAIMS, JSON.stringify(claims, null, 2), "utf-8");
  } catch {}

  try {
    await fs.writeFile(TMP_CLAIMS, JSON.stringify(claims, null, 2), "utf-8");
  } catch {}
}

export async function createClaim(
  data: Omit<Claim, "id" | "status" | "createdAt" | "updatedAt">
): Promise<Claim> {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();

  const newClaim: Claim = {
    ...data,
    id: `RMA-${new Date().getFullYear()}-${randomSuffix}`,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const payload = mapClaimToSupabase(newClaim);
        const { error } = await supabase.from("claims").insert(payload);
        if (error) console.error("Failed to insert claim in Supabase:", error);
      }
    } catch (err) {
      console.error("Supabase createClaim exception:", err);
    }
  }

  const claims = await readClaims();
  claims.unshift(newClaim);
  await writeClaims(claims);
  return newClaim;
}

export async function updateClaimStatus(
  id: string,
  status: Claim["status"],
  adminNotes?: string
): Promise<Claim | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const updates: any = {
          status,
          updated_at: now,
        };
        if (adminNotes !== undefined) updates.admin_notes = adminNotes;

        const { data, error } = await supabase
          .from("claims")
          .update(updates)
          .eq("id", id)
          .select("*")
          .single();

        if (!error && data) {
          const updated = mapSupabaseToClaim(data);
          if (memoryClaims) {
            const idx = memoryClaims.findIndex((c) => c.id === id);
            if (idx >= 0) memoryClaims[idx] = updated;
          }
          return updated;
        }
      }
    } catch (err) {
      console.error("Supabase updateClaimStatus exception:", err);
    }
  }

  const claims = await readClaims();
  const index = claims.findIndex((c) => c.id === id);
  if (index === -1) return null;

  claims[index].status = status;
  if (adminNotes !== undefined) {
    claims[index].adminNotes = adminNotes;
  }
  claims[index].updatedAt = now;

  await writeClaims(claims);
  return claims[index];
}
