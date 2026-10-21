import { NextRequest, NextResponse } from "next/server";

const PRINTNODE_API_BASE = "https://api.printnode.com";

// GET: Fetch printers list using user's PrintNode API Key
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get("apiKey") || req.headers.get("x-printnode-key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "PrintNode API key required. Enter your key in Studio Settings." },
        { status: 400 }
      );
    }

    const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;

    const res = await fetch(`${PRINTNODE_API_BASE}/printers`, {
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `PrintNode Error: ${res.status} - ${errText}` },
        { status: res.status }
      );
    }

    const printers = await res.json();
    return NextResponse.json({ success: true, printers });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to connect to PrintNode";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Submit a silent print job
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, printerId, title, content, contentType = "raw_base64" } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "PrintNode API key required" }, { status: 400 });
    }
    if (!printerId) {
      return NextResponse.json({ error: "Printer ID required" }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: "Print content required" }, { status: 400 });
    }

    const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;

    const res = await fetch(`${PRINTNODE_API_BASE}/printjobs`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        printerId: Number(printerId),
        title: title || "Bravon Thermal Print",
        contentType: contentType,
        content: content,
        source: "Bravon Design Studio Web",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `PrintNode Print Error: ${res.status} - ${errText}` },
        { status: res.status }
      );
    }

    const jobId = await res.json();
    return NextResponse.json({ success: true, jobId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Print submission failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
