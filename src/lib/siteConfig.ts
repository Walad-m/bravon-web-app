export interface SiteConfig {
  // Product Settings
  productName: string;
  productTagline: string;
  productDescription: string;
  price: number;
  comparePrice: number;
  saveAmountText: string;
  defaultColor: "white" | "dark";
  whiteColorLabel: string;
  darkColorLabel: string;
  stockStatus: string;
  freeShippingText: string;
  warrantyText: string;
  returnPolicyText: string;

  // Announcement & Banner
  showAnnouncement: boolean;
  announcementTag: string;
  announcementText: string;

  // Hero Section
  heroEyebrow: string;
  heroHeadline: string;
  heroSubhead: string;

  // Store & Contact Info
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
  companyAddress: string;
  socialInstagram: string;
  socialTwitter: string;
  socialYoutube: string;
  socialTiktok: string;
  socialFacebook: string;

  // Video Section Settings
  showVideoSection: boolean;
  videoHeadline: string;
  videoSubhead: string;
  videoUrl: string;
  videoPosterUrl: string;

  // Warranty & Returns
  warrantyDuration: string;
  warrantyCoverageText: string;

  // App Downloads & Software Links
  windowsMsiUrl: string;
  windowsExeUrl: string;
  macDownloadUrl: string;
  iosAppStoreUrl: string;
  androidPlayStoreUrl: string;

  // Configurable Images
  heroImageWhite: string;
  heroImageDark: string;
  productImageWhite: string;
  productImageDark: string;
  productImageInBox: string;
  productImageAction: string;
  storeLogoUrl: string;
  storeFaviconUrl: string;
  ogImageUrl: string;

  // Commerce & Inventory
  currencySymbol: string;
  currencyCode: string;
  inventoryStatus: string;
  inventoryCount: number;
  showInventoryCount: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  taxNotice: string;
  shippingSpeedText: string;

  // SEO & Social Metadata
  metaTitle: string;
  metaDescription: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  productName: "Bravon Thermal Label Printer",
  productTagline: "Commercial Grade - Direct Thermal",
  productDescription:
    "Prints crystal-clear 4x6\" shipping labels in 1 second. Zero ink, zero toner. Connects to your Mac, PC, iPhone, or Android via USB & Bluetooth.",
  price: 100,
  comparePrice: 149,
  saveAmountText: "Save $49 Today",
  defaultColor: "white",
  whiteColorLabel: "Arctic White",
  darkColorLabel: "Dark Slate",
  stockStatus: "In Stock - Ready to Ship",
  freeShippingText: "Free 2-Day Priority Shipping On All Orders",
  warrantyText: "2-Year Commercial Replacement Warranty",
  returnPolicyText: "30-Day Risk-Free Money-Back Guarantee",

  showAnnouncement: true,
  announcementTag: "Commercial Release",
  announcementText: "Bravon Thermal Printer ($100). Flagship Direct Thermal Technology.",

  heroEyebrow: "Bravon Thermal Printer",
  heroHeadline: "Engineered to print. Built to last.",
  heroSubhead:
    "Commercial high-speed thermal label printing. Zero ink, zero toner. Connects seamlessly to macOS, Windows, iOS & Android over USB and Bluetooth.",

  supportEmail: "support@bravoncity.com",
  supportPhone: "+1 (800) 555-BRAVON",
  supportHours: "Monday - Friday: 9am - 6pm EST",
  companyAddress: "Bravon Inc. - Designed in California",
  socialInstagram: "https://instagram.com/bravoncity",
  socialTwitter: "https://x.com/bravoncity",
  socialYoutube: "https://youtube.com/@bravoncity",
  socialTiktok: "https://tiktok.com/@bravoncity",
  socialFacebook: "https://facebook.com/bravoncity",

  // Video Section defaults
  showVideoSection: true,
  videoHeadline: "See Bravon in Action",
  videoSubhead: "Watch high-speed 160 mm/s direct thermal printing, wireless BLE pairing, and instant label feeding in real-time.",
  videoUrl: "/bravon-printer-demo.mp4",
  videoPosterUrl: "/bravon-shipping-action.jpg",

  // Warranty & Returns
  warrantyDuration: "2-Year Comprehensive",
  warrantyCoverageText: "Covers thermal printhead, drive motor, motherboard & logic controllers with advance replacement.",

  // App Downloads & Software defaults
  windowsMsiUrl: "/downloads/Bravon_Print_1.0.0_x64_en-US.msi",
  windowsExeUrl: "/downloads/Bravon_Print_1.0.0_x64_setup.exe",
  macDownloadUrl: "/downloads/Bravon_Print_1.0.0_universal.dmg",
  iosAppStoreUrl: "https://apps.apple.com/app/bravon-print",
  androidPlayStoreUrl: "https://play.google.com/store/apps/details?id=com.bravon.print",

  // Configurable Images defaults
  heroImageWhite: "/bravon-ecosystem-white.jpg",
  heroImageDark: "/bravon-ecosystem-dark.jpg",
  productImageWhite: "/exact-printer-white.png",
  productImageDark: "/exact-printer-dark.png",
  productImageInBox: "/bravon-in-the-box.jpg",
  productImageAction: "/bravon-shipping-action.jpg",
  storeLogoUrl: "/bravon-logo.png",
  storeFaviconUrl: "/bravon-app-icon.png",
  ogImageUrl: "/bravon-desktop-designer.png",

  // Commerce & Inventory defaults
  currencySymbol: "$",
  currencyCode: "USD",
  inventoryStatus: "In Stock - Ready to Ship",
  inventoryCount: 42,
  showInventoryCount: false,
  maintenanceMode: false,
  maintenanceMessage: "We are currently restocking and updating the store. Please check back shortly!",
  taxNotice: "Taxes calculated at checkout",
  shippingSpeedText: "Free 2-Day Priority Dispatch",

  // SEO & Social Metadata
  metaTitle: "Bravon Printer — Universal Thermal Label Printer",
  metaDescription: "Commercial high-speed thermal label printing. Zero ink, zero toner. Connects seamlessly to macOS, Windows, iOS & Android over USB and Bluetooth.",
};
