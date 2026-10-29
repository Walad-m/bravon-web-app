import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "@/lib/sessionToken";
import { getEffectiveEnvList, saveEnvSettings, EnvSettings, getDynamicStripeClient } from "@/lib/envConfig";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");

  if (!verifyAdminSessionToken(session?.value)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fields = await getEffectiveEnvList();
    return NextResponse.json({
      success: true,
      fields,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load environment settings";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");

  if (!verifyAdminSessionToken(session?.value)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();

    // 1. Action: Test Stripe Connection
    if (json.action === "test_stripe") {
      try {
        const stripe = await getDynamicStripeClient();
        // Lightweight call to verify credentials
        const balance = await stripe.balance.retrieve();
        const livemode = balance.livemode;
        return NextResponse.json({
          success: true,
          message: `Stripe connection verified successfully! (${livemode ? "Live Production Mode" : "Test Mode"})`,
          livemode,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Stripe connection failed";
        return NextResponse.json({
          success: false,
          error: `Stripe verification failed: ${msg}`,
        });
      }
    }

    // 2. Action: Test Supabase Connection
    if (json.action === "test_supabase") {
      try {
        if (!isSupabaseConfigured()) {
          return NextResponse.json({
            success: false,
            error: "Supabase URL or Key is missing. Please enter your credentials first.",
          });
        }
        const supabase = getSupabaseAdmin();
        if (!supabase) {
          return NextResponse.json({
            success: false,
            error: "Could not initialize Supabase client with current credentials.",
          });
        }
        // Query orders table limit 1
        const { error } = await supabase.from("orders").select("id").limit(1);
        if (error) {
          return NextResponse.json({
            success: false,
            error: `Supabase query returned an error: ${error.message}. (Did you run the supabase/schema.sql script in Supabase SQL editor?)`,
          });
        }
        return NextResponse.json({
          success: true,
          message: "Supabase database connection verified successfully! Tables are reachable.",
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Supabase connection failed";
        return NextResponse.json({
          success: false,
          error: `Supabase verification failed: ${msg}`,
        });
      }
    }

    // 3. Default Action: Save Environment Settings
    const settings = json.settings || json;
    delete settings.action;

    const updated = await saveEnvSettings(settings);
    const fields = await getEffectiveEnvList();

    return NextResponse.json({
      success: true,
      message: "Environment variables successfully saved and applied to active runtime.",
      settings: updated,
      fields,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process environment settings";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
