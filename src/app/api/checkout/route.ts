import { NextRequest, NextResponse } from "next/server";
import { readServerConfig } from "@/lib/serverConfig";
import { getDynamicStripeClient, getDynamicBaseUrl } from "@/lib/envConfig";

export async function POST(req: NextRequest) {
  try {
    const { color, quantity = 1 } = await req.json();
    const config = await readServerConfig();
    const stripe = await getDynamicStripeClient();

    const colorLabel =
      color === "white"
        ? config.whiteColorLabel || "Arctic White"
        : config.darkColorLabel || "Dark Slate";

    const unitPriceCents = Math.round((config.price || 100) * 100);

    const origin = await getDynamicBaseUrl(req.headers.get("origin") || req.nextUrl.origin);

    // Customer only sees the exact product image for their selected color variant
    const exactProductImage =
      color === "white" ? "/exact-printer-white.png" : "/exact-printer-dark.png";
    const fullImageUrl = `${origin}${exactProductImage}`;

    const session = await stripe.checkout.sessions.create({
      // Omitting payment_method_types lets Stripe automatically enable Apple Pay, Google Pay, Link & Cards
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${config.productName || "Bravon Thermal Printer"} — ${colorLabel}`,
              description: config.productDescription || "Universal thermal label printing. Zero ink, zero toner.",
              images: [fullImageUrl],
              metadata: { color: colorLabel },
            },
            unit_amount: unitPriceCents,
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "NL", "SE", "NO", "DK"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "usd" },
            display_name: "Free Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 5 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1500, currency: "usd" },
            display_name: "Express Priority Dispatch (1-2 Days)",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 2 },
            },
          },
        },
      ],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/product`,
      metadata: {
        color: colorLabel,
        quantity: String(quantity),
        productName: config.productName || "Bravon Thermal Printer",
        currency: "USD",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Checkout error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
