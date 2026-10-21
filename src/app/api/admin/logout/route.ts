import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const host = req.headers.get("host") || "";
  const isProdBravon = host.includes("bravoncity.com");
  const cookieStore = await cookies();
  
  if (isProdBravon) {
    cookieStore.delete({
      name: "bravon_admin_session",
      path: "/",
      domain: ".bravoncity.com",
    });
  }
  cookieStore.delete("bravon_admin_session");

  return NextResponse.json({ success: true, message: "Logged out" });
}
