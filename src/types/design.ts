export type BarcodeType = 'CODE128' | 'EAN13' | 'UPC-A' | 'CODE39';
export type FontSize = '1' | '2' | '3' | '4' | '5' | '6';

export interface BaseElement {
  id: string;
  x: number; // mm from left
  y: number; // mm from top
  rotation: 0 | 90 | 180 | 270;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: FontSize;
  bold: boolean;
  align?: 'left' | 'center' | 'right';
  width: number; // mm
  height: number; // mm
}

export interface BarcodeElement extends BaseElement {
  type: 'barcode';
  content: string;
  barcodeType: BarcodeType;
  width: number; // mm
  height: number; // mm
  showText: boolean;
}

export interface QRCodeElement extends BaseElement {
  type: 'qrcode';
  content: string;
  size: number; // mm
}

export interface LineElement extends BaseElement {
  type: 'line';
  width: number; // mm
  thickness: number; // mm or px (1-8)
}

export interface BoxElement extends BaseElement {
  type: 'box';
  width: number; // mm
  height: number; // mm
  thickness: number; // border thickness
  fill?: boolean;
}

export interface BadgeElement extends BaseElement {
  type: 'badge';
  badgeType: 'fragile' | 'this-way-up' | 'priority' | 'eco';
  label: string;
  width: number; // mm
  height: number; // mm
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string; // Base64 data URL or public URL
  width: number; // mm
  height: number; // mm
  name?: string;
}

export type DesignElement =
  | TextElement
  | BarcodeElement
  | QRCodeElement
  | LineElement
  | BoxElement
  | BadgeElement
  | ImageElement;

export interface LabelSize {
  name: string;
  width: number;  // mm
  height: number; // mm
  description?: string;
}

export interface LabelTemplate {
  id: string;
  name: string;
  category: 'shipping' | 'retail' | 'warehouse' | 'warning' | 'custom';
  description: string;
  size: LabelSize;
  elements: DesignElement[];
}

export interface SavedLabelDocument {
  id: string;
  name: string;
  updatedAt: string;
  size: LabelSize;
  orientation: 'portrait' | 'landscape';
  elements: DesignElement[];
}

export interface PrintNodePrinter {
  id: number;
  name: string;
  description?: string;
  state: 'online' | 'offline';
  default?: boolean;
  computer?: {
    name: string;
    state: string;
  };
}

export interface PrintHistoryEntry {
  id: string;
  timestamp: string;
  title: string;
  method: 'printnode' | 'web-serial' | 'browser-dialog';
  printerName: string;
  size: string;
  copies: number;
  status: 'success' | 'failed';
}

export const PRESET_LABEL_SIZES: LabelSize[] = [
  { name: '4" × 6" Shipping (101.6 × 152.4 mm)', width: 101.6, height: 152.4, description: 'Standard Commercial Shipping Label (USPS, UPS, FedEx, DHL)' },
  { name: '100 × 75 mm (Large Product)', width: 100, height: 75, description: 'Product packaging & carton labeling' },
  { name: '80 × 50 mm (Warehouse / Storage)', width: 80, height: 50, description: 'Bin boxes, inventory racks, and QR asset tracking' },
  { name: '80 × 60 mm (Warehouse Box)', width: 80, height: 60, description: 'Heavy parcel identification & shipping warning' },
  { name: '58 × 40 mm (Retail Barcode)', width: 58, height: 40, description: 'SKU price tags, supermarket shelf barcodes' },
  { name: '40 × 30 mm (Jewelry / Compact)', width: 40, height: 30, description: 'Jewelry tags, small jar cosmetics, pricing' },
  { name: 'Custom Dimensions', width: 100, height: 100, description: 'Specify custom width and height in millimeters' },
];

/** Millimeters to display pixels conversion at 100% zoom (1mm ~ 3.78px for screen display) */
export const MM_TO_PX = 3.779527559;
