import fs from "fs";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export interface OrderItem {
  id: string;
  name: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerShipping {
  name?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export interface OrderRecord {
  id: string; // Stripe checkout session id or order id
  paymentIntentId?: string;
  customerEmail: string;
  customerName?: string;
  shipping?: CustomerShipping;
  items: OrderItem[];
  amountTotal: number; // in USD dollars
  currency: string;
  paymentStatus: "paid" | "refunded" | "failed";
  fulfillmentStatus: "unfulfilled" | "processing" | "shipped" | "delivered";
  trackingNumber?: string;
  trackingCarrier?: string;
  createdAt: string;
}

const LOCAL_ORDERS = path.join(process.cwd(), "src", "data", "orders.json");
const TMP_ORDERS = path.join("/tmp", "bravon-orders.json");

let memoryOrders: OrderRecord[] | null = null;

function mapSupabaseToOrder(row: any): OrderRecord {
  return {
    id: row.id,
    paymentIntentId: row.payment_intent_id || undefined,
    customerEmail: row.customer_email,
    customerName: row.customer_name || undefined,
    shipping: row.shipping || undefined,
    items: row.items || [],
    amountTotal: Number(row.amount_total),
    currency: row.currency || "USD",
    paymentStatus: row.payment_status || "paid",
    fulfillmentStatus: row.fulfillment_status || "unfulfilled",
    trackingNumber: row.tracking_number || undefined,
    trackingCarrier: row.tracking_carrier || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapOrderToSupabase(order: OrderRecord): any {
  return {
    id: order.id,
    payment_intent_id: order.paymentIntentId || null,
    customer_email: order.customerEmail,
    customer_name: order.customerName || null,
    shipping: order.shipping || null,
    items: order.items || [],
    amount_total: order.amountTotal,
    currency: order.currency || "USD",
    payment_status: order.paymentStatus || "paid",
    fulfillment_status: order.fulfillmentStatus || "unfulfilled",
    tracking_number: order.trackingNumber || null,
    tracking_carrier: order.trackingCarrier || null,
    created_at: order.createdAt || new Date().toISOString(),
  };
}

export async function readOrders(): Promise<OrderRecord[]> {
  // 1. Check Supabase First if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped = data.map(mapSupabaseToOrder);
          memoryOrders = mapped;
          return mapped;
        } else if (error) {
          console.warn("Supabase readOrders warning, falling back to local:", error.message);
        }
      }
    } catch (err) {
      console.warn("Supabase readOrders error:", err);
    }
  }

  // 2. Fallback to in-memory / local JSON (local development)
  if (memoryOrders) return memoryOrders;

  try {
    if (fs.existsSync(TMP_ORDERS)) {
      const data = await fs.promises.readFile(TMP_ORDERS, "utf-8");
      memoryOrders = JSON.parse(data);
      return memoryOrders!;
    }
  } catch {}

  try {
    if (fs.existsSync(LOCAL_ORDERS)) {
      const data = await fs.promises.readFile(LOCAL_ORDERS, "utf-8");
      memoryOrders = JSON.parse(data);
      return memoryOrders!;
    }
  } catch {}

  return [];
}

export async function saveOrder(order: OrderRecord): Promise<void> {
  // 1. Save to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const payload = mapOrderToSupabase(order);
        const { error } = await supabase.from("orders").upsert(payload, { onConflict: "id" });
        if (error) {
          console.error("Failed to save order to Supabase:", error);
        }
      }
    } catch (err) {
      console.error("Supabase saveOrder exception:", err);
    }
  }

  // 2. Local fallback sync
  const orders = await readOrders();
  const existingIndex = orders.findIndex((o) => o.id === order.id);
  if (existingIndex >= 0) {
    orders[existingIndex] = { ...orders[existingIndex], ...order };
  } else {
    orders.unshift(order);
  }

  memoryOrders = orders;

  try {
    await fs.promises.mkdir(path.dirname(LOCAL_ORDERS), { recursive: true });
    await fs.promises.writeFile(LOCAL_ORDERS, JSON.stringify(orders, null, 2), "utf-8");
  } catch {}

  try {
    await fs.promises.writeFile(TMP_ORDERS, JSON.stringify(orders, null, 2), "utf-8");
  } catch {}
}

export async function updateOrderFulfillment(
  orderId: string,
  fulfillmentStatus: OrderRecord["fulfillmentStatus"],
  trackingNumber?: string,
  trackingCarrier?: string
): Promise<OrderRecord | null> {
  // 1. Update in Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const updates: any = {
          fulfillment_status: fulfillmentStatus,
        };
        if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
        if (trackingCarrier !== undefined) updates.tracking_carrier = trackingCarrier;

        const { data, error } = await supabase
          .from("orders")
          .update(updates)
          .eq("id", orderId)
          .select("*")
          .single();

        if (!error && data) {
          const updated = mapSupabaseToOrder(data);
          if (memoryOrders) {
            const idx = memoryOrders.findIndex((o) => o.id === orderId);
            if (idx >= 0) memoryOrders[idx] = updated;
          }
          return updated;
        }
      }
    } catch (err) {
      console.error("Supabase updateOrderFulfillment exception:", err);
    }
  }

  // 2. Local fallback
  const orders = await readOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.fulfillmentStatus = fulfillmentStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingCarrier) order.trackingCarrier = trackingCarrier;

  memoryOrders = orders;

  try {
    await fs.promises.writeFile(LOCAL_ORDERS, JSON.stringify(orders, null, 2), "utf-8");
  } catch {}

  try {
    await fs.promises.writeFile(TMP_ORDERS, JSON.stringify(orders, null, 2), "utf-8");
  } catch {}

  return order;
}
