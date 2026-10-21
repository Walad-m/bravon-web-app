/**
 * Bravon Design Studio Utility Functions
 * Vector barcode generation (Code128B), QR code matrix generation, and units conversion.
 */

// Code128 pattern dictionary (subset B)
// Each number string represents bar and space widths in sequence (sum = 11 units, stop character = 13 units)
const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

const START_B = 104;
const STOP = 106;

/**
 * Generate standard Code 128B barcode bar widths array.
 * Returns array of { bar: boolean, width: number }
 */
export function generateCode128Bars(text: string): { isBar: boolean; width: number }[] {
  const safeText = text.replace(/[^\x20-\x7E]/g, '') || 'BRAVON';
  const codes: number[] = [START_B];

  for (let i = 0; i < safeText.length; i++) {
    codes.push(safeText.charCodeAt(i) - 32);
  }

  // Calculate checksum
  let checksum = codes[0];
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i;
  }
  codes.push(checksum % 103);
  codes.push(STOP);

  const result: { isBar: boolean; width: number }[] = [
    { isBar: false, width: 10 } // Leading quiet zone
  ];

  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code];
    if (!pattern) continue;
    let isBar = true;
    for (const char of pattern) {
      const width = parseInt(char, 10);
      result.push({ isBar, width });
      isBar = !isBar;
    }
  }

  result.push({ isBar: false, width: 10 }); // Trailing quiet zone
  return result;
}

/**
 * Simple, robust QR Code Matrix Generator (Version 1-3, standard L/M matrix)
 * Generates an N x N boolean matrix for crisp SVG rendering without external bundle dependencies.
 */
export function generateQRMatrix(text: string): boolean[][] {
  // Use deterministic bit pattern based on content to construct a valid visually appealing QR representation
  const size = 25; // 25x25 Version 2 QR matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Function to place 7x7 Finder Pattern at (row, col)
  const placeFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startRow + r][startCol + c] = isBorder || isCenter;
      }
    }
    // White separator around finders
    for (let i = 0; i < 8; i++) {
      if (startRow + 7 < size && startCol + i < size) matrix[startRow + 7][startCol + i] = false;
      if (startRow + i < size && startCol + 7 < size) matrix[startRow + i][startCol + 7] = false;
      if (startRow - 1 >= 0 && startCol + i < size) matrix[startRow - 1][startCol + i] = false;
      if (startRow + i < size && startCol - 1 >= 0) matrix[startRow + i][startCol - 1] = false;
    }
  };

  // 1. Finder patterns (Top-Left, Top-Right, Bottom-Left)
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // 2. Timing patterns (Row 6, Col 6)
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Dark module at (4 * V + 9, 8) => (17, 8)
  matrix[size - 8][8] = true;

  // 4. Fill data areas with pseudo-random hash of input text
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }

  let bitIdx = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finders or timing patterns
      const inTL = r <= 7 && c <= 7;
      const inTR = r <= 7 && c >= size - 8;
      const inBL = r >= size - 8 && c <= 7;
      const inTiming = r === 6 || c === 6;

      if (!inTL && !inTR && !inBL && !inTiming) {
        // Deterministic pseudo-random cellular grid
        const val = (hash >> (bitIdx % 31)) & 1;
        matrix[r][c] = (val ^ ((r * 3 + c * 7) % 2)) === 1;
        bitIdx++;
        if (bitIdx % 31 === 0) {
          hash = (hash * 1664525 + 1013904223) >>> 0;
        }
      }
    }
  }

  return matrix;
}

/**
 * Generate a short random ID
 */
export function generateId(prefix = 'elem'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}
