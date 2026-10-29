import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "@/lib/sessionToken";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");

  const isAuthenticated = verifyAdminSessionToken(session?.value);
  return NextResponse.json({ authenticated: isAuthenticated });
}
