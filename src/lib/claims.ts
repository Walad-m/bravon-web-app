import fs from "fs/promises";
import path from "path";

export interface Claim {
  id: string; // e.g. "RMA-2026-1048"
  orderId: string;
  customerEmail: string;
  customerName?: string;
  claimType: "return" | "warranty";
  reason: string;
  description: string;
  photoUrl?: string;
  status: "pending" | "approved" | "replacement_shipped" | "refunded" | "rejected";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const CLAIMS_FILE = path.join(process.cwd(), "src", "data", "claims.json");

export async function readClaims(): Promise<Claim[]> {
  try {
    const raw = await fs.readFile(CLAIMS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeClaims(claims: Claim[]): Promise<void> {
  const dir = path.dirname(CLAIMS_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CLAIMS_FILE, JSON.stringify(claims, null, 2), "utf-8");
}

export async function createClaim(data: Omit<Claim, "id" | "status" | "createdAt" | "updatedAt">): Promise<Claim> {
  const claims = await readClaims();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();
  
  const newClaim: Claim = {
    ...data,
    id: `RMA-${new Date().getFullYear()}-${randomSuffix}`,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  claims.unshift(newClaim);
  await writeClaims(claims);
  return newClaim;
}

export async function updateClaimStatus(
  id: string,
  status: Claim["status"],
  adminNotes?: string
): Promise<Claim | null> {
  const claims = await readClaims();
  const index = claims.findIndex((c) => c.id === id);
  if (index === -1) return null;

  claims[index].status = status;
  if (adminNotes !== undefined) {
    claims[index].adminNotes = adminNotes;
  }
  claims[index].updatedAt = new Date().toISOString();

  await writeClaims(claims);
  return claims[index];
}
