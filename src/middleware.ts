import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // 1. Admin Subdomain Routing (e.g. admin.bravoncity.com or admin.localhost:3000)
  if (host.startsWith("admin.")) {
    // If the path contains redundant /admin prefix, redirect to root clean URL on admin subdomain
    if (url.pathname === "/admin") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    if (url.pathname.startsWith("/admin/")) {
      url.pathname = url.pathname.replace(/^\/admin/, "") || "/";
      return NextResponse.redirect(url);
    }

    // Rewrite clean root/subpaths to internal /admin route
    if (!url.pathname.startsWith("/api") && !url.pathname.startsWith("/_next")) {
      url.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // If on production bravoncity.com domain and accessing /admin, redirect to admin.bravoncity.com
  if ((host === "bravoncity.com" || host === "www.bravoncity.com") && (url.pathname === "/admin" || url.pathname.startsWith("/admin/"))) {
    const adminPath = url.pathname === "/admin" ? "/" : url.pathname.replace(/^\/admin/, "");
    const adminUrl = new URL(adminPath, "https://admin.bravoncity.com");
    return NextResponse.redirect(adminUrl);
  }

  // 2. Design Subdomain Routing (e.g. design.bravoncity.com or design.localhost:3000)
  if (host.startsWith("design.")) {
    if (url.pathname === "/design") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    if (url.pathname.startsWith("/design/")) {
      url.pathname = url.pathname.replace(/^\/design/, "") || "/";
      return NextResponse.redirect(url);
    }
    if (!url.pathname.startsWith("/api") && !url.pathname.startsWith("/_next")) {
      url.pathname = `/design${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
