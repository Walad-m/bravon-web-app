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

const LOCAL_ORDERS = path.join(process.cwd(), "src", "data", "orders.json");
const TMP_ORDERS = path.join("/tmp", "bravon-orders.json");

let memoryOrders: OrderRecord[] | null = null;

export async function readOrders(): Promise<OrderRecord[]> {
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
