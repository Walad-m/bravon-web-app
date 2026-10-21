import fs from "fs";
import path from "path";

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

const ORDERS_FILE = path.join(process.cwd(), "src", "data", "orders.json");

export async function readOrders(): Promise<OrderRecord[]> {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      return [];
    }
    const data = await fs.promises.readFile(ORDERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading orders:", err);
    return [];
  }
}

export async function saveOrder(order: OrderRecord): Promise<void> {
  try {
    const orders = await readOrders();
    const existingIndex = orders.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = { ...orders[existingIndex], ...order };
    } else {
      orders.unshift(order);
    }
    await fs.promises.mkdir(path.dirname(ORDERS_FILE), { recursive: true });
    await fs.promises.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving order:", err);
  }
}

export async function updateOrderFulfillment(
  orderId: string,
  fulfillmentStatus: OrderRecord["fulfillmentStatus"],
  trackingNumber?: string,
  trackingCarrier?: string
): Promise<OrderRecord | null> {
  const orders = await readOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.fulfillmentStatus = fulfillmentStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingCarrier) order.trackingCarrier = trackingCarrier;

  await fs.promises.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  return order;
}
