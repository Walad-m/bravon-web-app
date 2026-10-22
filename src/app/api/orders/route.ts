import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readOrders, updateOrderFulfillment } from "@/lib/orders";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const lookupId = searchParams.get("order_id") || searchParams.get("id");
  const email = searchParams.get("email");

  // 1. If looking up by session_id, order_id, or id (public tracking for customer)
  const targetId = sessionId || lookupId;
  if (targetId) {
    const orders = await readOrders();
    let order = orders.find(
      (o) =>
        o.id.toLowerCase() === targetId.toLowerCase() ||
        (o.paymentIntentId && o.paymentIntentId.toLowerCase() === targetId.toLowerCase())
    );

    // Fallback: If not found in DB but is a valid Stripe Checkout Session ID, retrieve directly from Stripe
    if (!order && sessionId && sessionId.startsWith("cs_") && process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2025-02-24.acacia" as any,
        });
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session && session.payment_status === "paid") {
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

          const newOrder = {
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
            paymentStatus: "paid" as const,
            fulfillmentStatus: "unfulfilled" as const,
            createdAt: new Date().toISOString(),
          };

          const { saveOrder } = await import("@/lib/orders");
          await saveOrder(newOrder);
          order = newOrder;
        }
      } catch (stripeErr) {
        console.warn("Direct Stripe session fetch note:", stripeErr);
      }
    }

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found. Please check your order ID." }, { status: 404 });
    }

    if (email && order.customerEmail.toLowerCase() !== email.toLowerCase().trim()) {
      return NextResponse.json(
        { success: false, error: "Email address does not match order records." },
        { status: 403 }
      );
    }

    // Return sanitized customer receipt & tracking info
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        items: order.items,
        amountTotal: order.amountTotal,
        currency: order.currency,
        fulfillmentStatus: order.fulfillmentStatus || "unfulfilled",
        trackingNumber: order.trackingNumber || null,
        trackingCarrier: order.trackingCarrier || null,
        createdAt: order.createdAt,
        shipping: order.shipping,
      },
    });
  }

  // 2. Otherwise requires admin session
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orders = await readOrders();
  return NextResponse.json({
    success: true,
    orders,
    stats: {
      totalOrders: orders.length,
      totalRevenueUSD: orders.reduce((acc, o) => acc + (o.amountTotal || 0), 0),
      unfulfilled: orders.filter((o) => o.fulfillmentStatus === "unfulfilled").length,
    },
  });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, fulfillmentStatus, trackingNumber, trackingCarrier } = await req.json();
    if (!orderId || !fulfillmentStatus) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const updated = await updateOrderFulfillment(
      orderId,
      fulfillmentStatus,
      trackingNumber,
      trackingCarrier
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating order";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
