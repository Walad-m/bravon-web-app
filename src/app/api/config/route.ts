import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readServerConfig, writeServerConfig } from "@/lib/serverConfig";
import { verifyAdminSessionToken } from "@/lib/sessionToken";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const config = await readServerConfig();
  return NextResponse.json(
    { success: true, config },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");

  if (!verifyAdminSessionToken(session?.value)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please sign in to the admin dashboard." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const updated = await writeServerConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update configuration";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
