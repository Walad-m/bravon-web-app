import { NextRequest, NextResponse } from "next/server";
import { readSubscribers, writeSubscribers, Subscriber } from "@/lib/subscribers";

export async function POST(req: NextRequest) {
  try {
    const { email, source = "footer" } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const list = await readSubscribers();

    const exists = list.some((s) => s.email.toLowerCase() === cleanEmail);
    if (exists) {
      return NextResponse.json({ success: true, message: "You are already subscribed to updates!" });
    }

    const newSub: Subscriber = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      source,
      createdAt: new Date().toISOString(),
    };

    list.unshift(newSub);
    await writeSubscribers(list);

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing! You will receive future product updates and releases.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error saving subscriber";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

