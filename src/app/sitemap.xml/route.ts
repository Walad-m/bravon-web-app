import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bravoncity.com";
  const now = new Date().toISOString().split("T")[0];

  const urls = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/product", priority: "0.9", changefreq: "weekly" },
    { loc: "/apps", priority: "0.8", changefreq: "monthly" },
    { loc: "/design", priority: "0.8", changefreq: "monthly" },
    { loc: "/track", priority: "0.7", changefreq: "never" },
    { loc: "/returns", priority: "0.7", changefreq: "monthly" },
    { loc: "/faq", priority: "0.6", changefreq: "monthly" },
    { loc: "/about", priority: "0.6", changefreq: "monthly" },
    { loc: "/contact", priority: "0.6", changefreq: "monthly" },
    { loc: "/shipping", priority: "0.5", changefreq: "monthly" },
    { loc: "/warranty", priority: "0.5", changefreq: "monthly" },
    { loc: "/privacy", priority: "0.4", changefreq: "yearly" },
    { loc: "/terms", priority: "0.4", changefreq: "yearly" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
