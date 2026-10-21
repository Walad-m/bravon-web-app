/**
 * Bravon TSPL-II Command Generation Engine
 * Ported directly from the verified Bravon Desktop App (bravon-print-desktop).
 * Generates standard TSPL byte commands for direct silent printing via PrintNode, Web Serial, or Web Bluetooth.
 */

import { DesignElement, LabelSize } from "@/types/design";

/** Converts mm to printer dots at standard 203 DPI (8 dots per mm) */
export const mmToDots = (mm: number): number => Math.round(mm * 8);

/**
 * Generates raw TSPL text commands for direct printing on thermal hardware.
 * Specifically configured for direct thermal heads (203 DPI / 8 dots/mm).
 */
export function generateTsplString(
  elements: DesignElement[],
  size: LabelSize,
  copies: number = 1,
  paperType: "gap" | "black" | "cont" = "gap",
  density: number = 8,
  speed: number = 4
): string {
  let tspl = "";

  // 1. Initialize Label Size, Speed, Density, and Sensor Gap
  tspl += `SIZE ${size.width} mm,${size.height} mm\r\n`;
  tspl += `SPEED ${speed}\r\n`;
  tspl += `DENSITY ${density}\r\n`;
  if (paperType === "cont") {
    tspl += `GAP 0 mm,0 mm\r\n`;
  } else if (paperType === "black") {
    tspl += `BLINE 2 mm,0 mm\r\n`;
  } else {
    tspl += `GAP 2 mm,0 mm\r\n`;
  }
  tspl += `OFFSET 0 mm\r\n`;
  tspl += `DIRECTION 0,0\r\n`;
  tspl += `REFERENCE 0,0\r\n`;
  tspl += `CLS\r\n`;

  // 2. Iterate elements and draw using absolute dot coordinates
  for (const el of elements) {
    const xDots = mmToDots(el.x);
    const yDots = mmToDots(el.y);

    if (el.type === "text") {
      const sizeInt = parseInt(el.fontSize, 10) || 2;
      let multiplier = 1;
      if (sizeInt >= 2 && sizeInt < 4) multiplier = 2;
      if (sizeInt >= 4 && sizeInt < 6) multiplier = 3;
      if (sizeInt >= 6) multiplier = 4;
      const font = "3"; // Built-in monospaced bitmap font
      const safeContent = el.content.replace(/"/g, '\\"').replace(/\n/g, " ");
      tspl += `TEXT ${xDots},${yDots},"${font}",${el.rotation ?? 0},${multiplier},${multiplier},"${safeContent}"\r\n`;
    } else if (el.type === "barcode") {
      const human = el.showText ? 1 : 0;
      const heightDots = mmToDots(el.height);
      const narrow = Math.max(1, Math.min(10, Math.round(el.height / 6)));
      const wide = narrow * 2;
      const tsplTypeMap: Record<string, string> = {
        CODE128: "128",
        CODE39: "39",
        EAN13: "EAN13",
        "UPC-A": "UPCA",
      };
      const bType = tsplTypeMap[el.barcodeType] ?? "128";
      tspl += `BARCODE ${xDots},${yDots},"${bType}",${heightDots},${human},${el.rotation ?? 0},${narrow},${wide},"${el.content}"\r\n`;
    } else if (el.type === "qrcode") {
      const cellWidth = Math.max(2, Math.min(10, Math.round(el.size / 6)));
      tspl += `QRCODE ${xDots},${yDots},M,${cellWidth},A,${el.rotation ?? 0},"${el.content}"\r\n`;
    } else if (el.type === "line") {
      tspl += `BAR ${xDots},${yDots},${mmToDots(el.width)},${Math.max(2, el.thickness * 2)}\r\n`;
    } else if (el.type === "box") {
      tspl += `BOX ${xDots},${yDots},${xDots + mmToDots(el.width)},${yDots + mmToDots(el.height)},${Math.max(2, el.thickness * 2)}\r\n`;
    } else if (el.type === "badge") {
      // Draw solid filled badge with inverted text
      tspl += `BOX ${xDots},${yDots},${xDots + mmToDots(el.width)},${yDots + mmToDots(el.height)},4\r\n`;
      tspl += `TEXT ${xDots + 16},${yDots + 12},"3",${el.rotation ?? 0},2,2,"${el.label}"\r\n`;
    }
  }

  // 3. Print command
  tspl += `PRINT ${copies},1\r\n`;
  return tspl;
}

/**
 * Encodes TSPL commands to Base64 for PrintNode silent raw printing
 */
export function generateTsplBase64(
  elements: DesignElement[],
  size: LabelSize,
  copies: number = 1,
  paperType: "gap" | "black" | "cont" = "gap",
  density: number = 8,
  speed: number = 4
): string {
  const tspl = generateTsplString(elements, size, copies, paperType, density, speed);
  if (typeof window !== "undefined" && window.btoa) {
    return window.btoa(unescape(encodeURIComponent(tspl)));
  }
  return Buffer.from(tspl, "utf-8").toString("base64");
}
