import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { saveOrder } from "@/lib/orders";
import { readServerConfig, writeServerConfig } from "@/lib/serverConfig";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  // 1. Verify Stripe Webhook Signature if secret is configured
  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid signature";
      console.error("⚠️ Stripe Webhook signature verification failed:", msg);
      return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
    }
  } else {
    // Development fallback without signature verification
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
  }

  // 2. Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail =
      session.customer_details?.email ||
      session.customer_email ||
      "customer@example.com";
    const customerName = session.customer_details?.name || undefined;
    const shippingDetails =
      session.shipping_details ||
      session.collected_information?.shipping_details;

    const amountTotal = (session.amount_total || 0) / 100;
    const color = session.metadata?.color || "Arctic White";
    const quantity = parseInt(session.metadata?.quantity || "1", 10);
    const productName = session.metadata?.productName || "Bravon Thermal Printer";

    // Record order in database
    await saveOrder({
      id: session.id,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : undefined,
      customerEmail,
      customerName,
      shipping: shippingDetails
        ? {
            name: shippingDetails.name || undefined,
            phone: session.customer_details?.phone || undefined,
            address: shippingDetails.address
              ? {
                  line1: shippingDetails.address.line1 || undefined,
                  line2: shippingDetails.address.line2 || undefined,
                  city: shippingDetails.address.city || undefined,
                  state: shippingDetails.address.state || undefined,
                  postal_code: shippingDetails.address.postal_code || undefined,
                  country: shippingDetails.address.country || undefined,
                }
              : undefined,
          }
        : undefined,
      items: [
        {
          id: "bravon-thermal-1",
          name: productName,
          color,
          quantity,
          unitPrice: amountTotal / (quantity || 1),
          totalPrice: amountTotal,
        },
      ],
      amountTotal,
      currency: "USD",
      paymentStatus: "paid",
      fulfillmentStatus: "unfulfilled",
      createdAt: new Date().toISOString(),
    });

    // Automatically decrement inventory count if tracked
    try {
      const config = await readServerConfig();
      if (typeof config.inventoryCount === "number" && config.inventoryCount > 0) {
        const nextCount = Math.max(0, config.inventoryCount - quantity);
        await writeServerConfig({ inventoryCount: nextCount });
      }
    } catch (err) {
      console.error("Error decrementing inventory:", err);
    }

    console.log(`✅ Order ${session.id} processed successfully for ${customerEmail}`);
  }

  return NextResponse.json({ received: true });
}
