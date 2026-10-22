import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bravoncity.com";

  const content = `User-agent: *
Allow: /

# Block admin and internal API routes
Disallow: /admin
Disallow: /api/
Disallow: /success

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
