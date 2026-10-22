import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readClaims, createClaim, updateClaimStatus } from "@/lib/claims";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const claimId = searchParams.get("id");

  const claims = await readClaims();

  // If public customer lookup
  if (claimId) {
    const found = claims.find((c) => c.id.toLowerCase() === claimId.toLowerCase());
    if (!found) {
      return NextResponse.json({ success: false, error: "Claim reference not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, claim: found });
  }

  if (orderId) {
    const matches = claims.filter((c) => c.orderId.toLowerCase() === orderId.toLowerCase());
    return NextResponse.json({ success: true, claims: matches });
  }

  // Admin access check for viewing all claims
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true, claims });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, customerEmail, customerName, claimType, reason, description, photoUrl } = body;

    if (!orderId || !customerEmail || !claimType || !reason || !description) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (claimType !== "return" && claimType !== "warranty") {
      return NextResponse.json(
        { success: false, error: "Invalid claim type." },
        { status: 400 }
      );
    }

    const newClaim = await createClaim({
      orderId: orderId.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerName: customerName ? customerName.trim() : undefined,
      claimType,
      reason: reason.trim(),
      description: description.trim(),
      photoUrl: photoUrl ? photoUrl.trim() : undefined,
    });

    return NextResponse.json({ success: true, claim: newClaim });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create claim";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  // Admin only
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing claim ID or status" }, { status: 400 });
    }

    const updated = await updateClaimStatus(id, status, adminNotes);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, claim: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update claim";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
