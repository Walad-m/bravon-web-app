import fs from "fs/promises";
import path from "path";

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

export async function readClaims(): Promise<Claim[]> {
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
