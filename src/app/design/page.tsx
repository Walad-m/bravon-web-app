"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Type,
  Barcode,
  QrCode,
  Minus,
  Square,
  ShieldAlert,
  Printer,
  RotateCcw,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Copy,
  Sliders,
  Layers,
  Download,
  FolderOpen,
  Check,
  ChevronDown,
  RotateCw,
  AlignCenterHorizontal,
  Plus,
  X,
  FileText,
  Save,
  HardDrive,
  Settings,
  Wifi,
  WifiOff,
  Usb,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  LayoutDashboard,
  Palette,
  History as HistoryIcon,
  Search,
  ArrowRight,
  PlayCircle,
  Menu,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Apple,
  Monitor,
  Smartphone,
} from "lucide-react";
import BravonLogo from "@/components/BravonLogo";
import {
  DesignElement,
  LabelSize,
  PRESET_LABEL_SIZES,
  MM_TO_PX,
  TextElement,
  BarcodeElement,
  QRCodeElement,
  LineElement,
  BoxElement,
  BadgeElement,
  ImageElement,
  LabelTemplate,
  SavedLabelDocument,
  PrintNodePrinter,
  PrintHistoryEntry,
} from "@/types/design";
import { generateCode128Bars, generateQRMatrix, generateId } from "@/lib/designUtils";
import { generateTsplString, generateTsplBase64 } from "@/lib/tspl";
import { DEFAULT_DESIGN_TEMPLATES } from "@/data/designTemplates";
import { useSiteConfig } from "@/context/ConfigContext";

export default function DesignStudioPage() {
  const { config } = useSiteConfig();
  // Active App Section / View: 'dashboard' | 'editor' | 'templates' | 'printers' | 'history' | 'settings'
  const [activeView, setActiveView] = useState<"dashboard" | "editor" | "templates" | "printers" | "history" | "settings">("dashboard");

  // Label and Document State
  const [labelTitle, setLabelTitle] = useState("Commercial Shipping Label (4x6)");
  const [labelSize, setLabelSize] = useState<LabelSize>(PRESET_LABEL_SIZES[0]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [customWidth, setCustomWidth] = useState("100");
  const [customHeight, setCustomHeight] = useState("100");

  // Elements & Selection
  const [elements, setElements] = useState<DesignElement[]>(DEFAULT_DESIGN_TEMPLATES[0].elements);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<DesignElement[][]>([DEFAULT_DESIGN_TEMPLATES[0].elements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Canvas Viewport & Zoom
  const [zoom, setZoom] = useState(1);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"properties" | "layers">("properties");

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Desktop & Mobile Apps Download Modal
  const [showAppsModal, setShowAppsModal] = useState(false);

  // PrintNode Silent Printing State
  const [printNodeKey, setPrintNodeKey] = useState<string>("");
  const [printers, setPrinters] = useState<PrintNodePrinter[]>([]);
  const [selectedPrinterId, setSelectedPrinterId] = useState<number | null>(null);
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [printStatus, setPrintStatus] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [printCopies, setPrintCopies] = useState<number>(1);

  // Saved documents & print history in LocalStorage
  const [savedDocuments, setSavedDocuments] = useState<SavedLabelDocument[]>([]);
  const [printHistory, setPrintHistory] = useState<PrintHistoryEntry[]>([]);

  // User Preferences
  const [unitPreference, setUnitPreference] = useState<"mm" | "in">("mm");
  const [sensorType, setSensorType] = useState<"gap" | "black" | "cont">("gap");
  const [thermalDensity, setThermalDensity] = useState<number>(8);
  const [thermalSpeed, setThermalSpeed] = useState<number>(4);

  // Template Search & Category Filter
  const [templateCategory, setTemplateCategory] = useState<string>("all");
  const [templateSearch, setTemplateSearch] = useState<string>("");

  // Canvas Dragging & Interaction State
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 0, h: 0 });

  // Effective dimensions in mm (considering orientation)
  const effectiveWidth = orientation === "portrait" ? labelSize.width : labelSize.height;
  const effectiveHeight = orientation === "portrait" ? labelSize.height : labelSize.width;

  // Selected element helper
  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  // Notification Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mobile Responsiveness States
  const [isMobile, setIsMobile] = useState(false);
  const [showAddElementSheet, setShowAddElementSheet] = useState(false);
  const [showPropertiesSheet, setShowPropertiesSheet] = useState(false);
  const [showLayersSheet, setShowLayersSheet] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        const mobile = window.innerWidth < 850;
        setIsMobile(mobile);
        if (mobile && zoom === 1) {
          setZoom(0.7);
        }
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [zoom]);

  // Nudge selected element by delta mm (essential for mobile precision)
  const handleNudge = (dx: number, dy: number) => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    const newX = Math.max(0, Math.min(effectiveWidth - 5, Math.round((el.x + dx) * 10) / 10));
    const newY = Math.max(0, Math.min(effectiveHeight - 5, Math.round((el.y + dy) * 10) / 10));
    commitUpdate(selectedId, { x: newX, y: newY });
  };

  // Load Saved PrintNode Key, Documents, and History on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("bravon_printnode_key") || "";
      const savedPrinter = localStorage.getItem("bravon_selected_printer_id");
      const savedDocs = localStorage.getItem("bravon_saved_labels");
      const savedHistory = localStorage.getItem("bravon_print_history");
      const savedUnit = localStorage.getItem("bravon_unit_pref");
      const savedSensor = localStorage.getItem("bravon_sensor_pref");

      if (savedKey) {
        setPrintNodeKey(savedKey);
        fetchPrintNodePrinters(savedKey);
      }
      if (savedPrinter) {
        setSelectedPrinterId(Number(savedPrinter));
      }
      if (savedDocs) {
        try {
          setSavedDocuments(JSON.parse(savedDocs));
        } catch {
          // ignore
        }
      }
      if (savedHistory) {
        try {
          setPrintHistory(JSON.parse(savedHistory));
        } catch {
          // ignore
        }
      }
      if (savedUnit === "mm" || savedUnit === "in") setUnitPreference(savedUnit);
      if (savedSensor === "gap" || savedSensor === "black" || savedSensor === "cont") setSensorType(savedSensor);
      const savedDensity = localStorage.getItem("bravon_density_pref");
      if (savedDensity) setThermalDensity(Number(savedDensity));
      const savedSpeed = localStorage.getItem("bravon_speed_pref");
      if (savedSpeed) setThermalSpeed(Number(savedSpeed));
    }
  }, []);

  // Fetch Printers from PrintNode API via server proxy
  const fetchPrintNodePrinters = async (key: string) => {
    if (!key) return;
    setLoadingPrinters(true);
    try {
      const res = await fetch(`/api/printnode?apiKey=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.printers)) {
        setPrinters(data.printers);
        if (!selectedPrinterId && data.printers.length > 0) {
          const defaultOrFirst = data.printers.find((p: PrintNodePrinter) => p.state === "online") || data.printers[0];
          setSelectedPrinterId(defaultOrFirst.id);
          localStorage.setItem("bravon_selected_printer_id", String(defaultOrFirst.id));
        }
      } else if (data.error) {
        setPrintStatus(data.error);
      }
    } catch {
      setPrintStatus("Failed to communicate with PrintNode proxy");
    } finally {
      setLoadingPrinters(false);
    }
  };

  // Save PrintNode API Key
  const handleSavePrintNodeKey = (key: string) => {
    setPrintNodeKey(key);
    localStorage.setItem("bravon_printnode_key", key);
    fetchPrintNodePrinters(key);
    showToast("Saved PrintNode API Key");
  };

  // Push new state to history
  const pushHistory = useCallback((newElements: DesignElement[]) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newElements];
    });
    setHistoryIndex((prev) => prev + 1);
    setElements(newElements);
  }, [historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setElements(history[prevIdx]);
    }
  }, [historyIndex, history]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setElements(history[nextIdx]);
    }
  }, [historyIndex, history]);

  // Update single element
  const updateElement = useCallback((id: string, updates: Partial<DesignElement>) => {
    setElements((prev) => {
      return prev.map((el) => (el.id === id ? ({ ...el, ...updates } as DesignElement) : el));
    });
  }, []);

  // Commit update to history
  const commitUpdate = useCallback((id: string, updates: Partial<DesignElement>) => {
    setElements((prev) => {
      const updated = prev.map((el) => (el.id === id ? ({ ...el, ...updates } as DesignElement) : el));
      pushHistory(updated);
      return updated;
    });
  }, [pushHistory]);

  // Add new element
  const handleAddElement = (type: DesignElement["type"]) => {
    let newEl: DesignElement;

    switch (type) {
      case "text":
        newEl = {
          id: generateId("txt"),
          type: "text",
          content: "Enter Label Text",
          fontSize: "3",
          bold: false,
          align: "left",
          x: 10,
          y: 15,
          width: 45,
          height: 8,
          rotation: 0,
        };
        break;
      case "barcode":
        newEl = {
          id: generateId("bar"),
          type: "barcode",
          content: "7940123984",
          barcodeType: "CODE128",
          x: 10,
          y: 30,
          width: 55,
          height: 18,
          showText: true,
          rotation: 0,
        };
        break;
      case "qrcode":
        newEl = {
          id: generateId("qr"),
          type: "qrcode",
          content: "https://bravoncity.com",
          size: 22,
          x: 10,
          y: 52,
          rotation: 0,
        };
        break;
      case "line":
        newEl = {
          id: generateId("line"),
          type: "line",
          x: 8,
          y: 25,
          width: Math.max(20, effectiveWidth - 16),
          thickness: 2,
          rotation: 0,
        };
        break;
      case "box":
        newEl = {
          id: generateId("box"),
          type: "box",
          x: 8,
          y: 10,
          width: Math.max(30, effectiveWidth - 16),
          height: 35,
          thickness: 2,
          fill: false,
          rotation: 0,
        };
        break;
      case "badge":
        newEl = {
          id: generateId("bdg"),
          type: "badge",
          badgeType: "fragile",
          label: "FRAGILE",
          x: 10,
          y: 12,
          width: 50,
          height: 12,
          rotation: 0,
        };
        break;
      case "image":
        newEl = {
          id: generateId("img"),
          type: "image",
          src: "/bravon-mark.png",
          width: 25,
          height: 25,
          x: 10,
          y: 10,
          rotation: 0,
        };
        break;
    }

    const updated = [...elements, newEl];
    pushHistory(updated);
    setSelectedId(newEl.id);
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const newImg: ImageElement = {
        id: generateId("img"),
        type: "image",
        src,
        width: 30,
        height: 30,
        x: 10,
        y: 10,
        rotation: 0,
        name: file.name,
      };
      const updated = [...elements, newImg];
      pushHistory(updated);
      setSelectedId(newImg.id);
      showToast(`Added image: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Delete element
  const handleDeleteElement = useCallback((id: string) => {
    const updated = elements.filter((el) => el.id !== id);
    pushHistory(updated);
    if (selectedId === id) setSelectedId(null);
  }, [elements, pushHistory, selectedId]);

  // Duplicate element
  const handleDuplicate = (id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const clone: DesignElement = {
      ...el,
      id: generateId(el.type),
      x: Math.min(effectiveWidth - 10, el.x + 4),
      y: Math.min(effectiveHeight - 10, el.y + 4),
    };
    const updated = [...elements, clone];
    pushHistory(updated);
    setSelectedId(clone.id);
  };

  // Reorder layers
  const handleMoveLayer = (id: string, direction: "up" | "down") => {
    const index = elements.findIndex((e) => e.id === id);
    if (index === -1) return;
    const newElements = [...elements];
    if (direction === "up" && index < newElements.length - 1) {
      const temp = newElements[index];
      newElements[index] = newElements[index + 1];
      newElements[index + 1] = temp;
      pushHistory(newElements);
    } else if (direction === "down" && index > 0) {
      const temp = newElements[index];
      newElements[index] = newElements[index - 1];
      newElements[index - 1] = temp;
      pushHistory(newElements);
    }
  };

  // Center Horizontally
  const handleCenterHorizontal = (id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const elWidth = "width" in el ? el.width : el.type === "qrcode" ? el.size : 30;
    const newX = Math.max(0, Math.round(((effectiveWidth - elWidth) / 2) * 10) / 10);
    commitUpdate(id, { x: newX });
  };

  // Save current label to localStorage
  const handleSaveDocument = () => {
    const newDoc: SavedLabelDocument = {
      id: generateId("doc"),
      name: labelTitle || "Untitled Label",
      updatedAt: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      size: labelSize,
      orientation,
      elements,
    };
    const updatedDocs = [newDoc, ...savedDocuments.filter((d) => d.name !== labelTitle)];
    setSavedDocuments(updatedDocs);
    localStorage.setItem("bravon_saved_labels", JSON.stringify(updatedDocs));
    showToast(`Saved "${newDoc.name}" to library`);
  };

  // Load document from library into Studio
  const handleLoadDocument = (doc: SavedLabelDocument) => {
    setLabelTitle(doc.name);
    setLabelSize(doc.size);
    setOrientation(doc.orientation);
    setElements(doc.elements);
    pushHistory(doc.elements);
    setSelectedId(null);
    setActiveView("editor");
    showToast(`Loaded "${doc.name}"`);
  };

  // Create new blank label
  const handleCreateBlankLabel = (preset: LabelSize) => {
    setLabelSize(preset);
    setLabelTitle(`Untitled ${preset.name.split(" ")[0]} Label`);
    setElements([]);
    pushHistory([]);
    setSelectedId(null);
    setActiveView("editor");
    showToast(`Created blank ${preset.name}`);
  };

  // Delete saved document
  const handleDeleteSavedDocument = (id: string) => {
    const updated = savedDocuments.filter((d) => d.id !== id);
    setSavedDocuments(updated);
    localStorage.setItem("bravon_saved_labels", JSON.stringify(updated));
  };

  // Record completed print into history
  const logPrintJob = (method: PrintHistoryEntry["method"], printerName: string, status: "success" | "failed") => {
    const newEntry: PrintHistoryEntry = {
      id: generateId("job"),
      timestamp: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      title: labelTitle,
      method,
      printerName,
      size: labelSize.name,
      copies: printCopies,
      status,
    };
    const updated = [newEntry, ...printHistory.slice(0, 49)];
    setPrintHistory(updated);
    localStorage.setItem("bravon_print_history", JSON.stringify(updated));
  };

  // 1. Silent Cloud Print via PrintNode
  const handlePrintNodeSilentPrint = async () => {
    if (!printNodeKey) {
      setActiveView("printers");
      showToast("Please enter your PrintNode API Key");
      return;
    }
    if (!selectedPrinterId) {
      setActiveView("printers");
      showToast("Please choose an active printer");
      return;
    }

    setIsPrinting(true);
    setPrintStatus("Generating TSPL instructions...");

    try {
      const base64Content = generateTsplBase64(elements, labelSize, printCopies, sensorType, thermalDensity, thermalSpeed);
      const targetPrinter = printers.find((p) => p.id === selectedPrinterId);

      const res = await fetch("/api/printnode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: printNodeKey,
          printerId: selectedPrinterId,
          title: `Bravon Print — ${labelTitle}`,
          content: base64Content,
          contentType: "raw_base64",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Printed silently! Job #${data.jobId}`);
        setPrintStatus(`Job #${data.jobId} sent successfully to printer.`);
        logPrintJob("printnode", targetPrinter?.name || "PrintNode Cloud", "success");
      } else {
        alert(data.error || "Silent print failed. Check printer connection.");
        logPrintJob("printnode", targetPrinter?.name || "PrintNode Cloud", "failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Print error";
      alert(`Print failed: ${msg}`);
      logPrintJob("printnode", "PrintNode Cloud", "failed");
    } finally {
      setIsPrinting(false);
    }
  };

  // 2. Direct Driverless USB Hardware Print (WebUSB & WebSerial — 100% Free / Zero Accounts)
  const handleDirectUsbPrint = async () => {
    const hasSerial = typeof navigator !== "undefined" && "serial" in navigator;
    const hasUsb = typeof navigator !== "undefined" && "usb" in navigator;

    if (!hasSerial && !hasUsb) {
      alert("Direct USB printing requires Google Chrome, Microsoft Edge, Brave, or Opera. For other browsers, please use the standard print dialog.");
      return;
    }

    setIsPrinting(true);

    // Try WebSerial first on Windows (seamless virtual COM port access without driver locks)
    if (hasSerial) {
      try {
        const port = await (navigator as any).serial.requestPort();
        await port.open({ baudRate: 9600 });
        const writer = port.writable.getWriter();
        const tsplCommand = generateTsplString(elements, labelSize, printCopies, sensorType, thermalDensity, thermalSpeed);
        const data = new TextEncoder().encode(tsplCommand);
        await writer.write(data);
        writer.releaseLock();
        await port.close();
        showToast("Printed silently via USB!");
        logPrintJob("web-serial", "Direct USB Cable", "success");
        setIsPrinting(false);
        return;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("No port selected") || msg.includes("User cancelled")) {
          setIsPrinting(false);
          return;
        }
        console.warn("WebSerial fallback to WebUSB:", err);
      }
    }

    // Try WebUSB
    if (hasUsb) {
      try {
        const device = await (navigator as any).usb.requestDevice({ filters: [] });
        await device.open();
        if (device.configuration === null) {
          await device.selectConfiguration(1);
        }
        await device.claimInterface(0);

        const iface = device.configuration.interfaces[0];
        const endpoint = iface.alternate.endpoints.find((e: any) => e.direction === "out");
        const endpointNum = endpoint ? endpoint.endpointNumber : 1;

        const tsplCommand = generateTsplString(elements, labelSize, printCopies, sensorType, thermalDensity, thermalSpeed);
        const data = new TextEncoder().encode(tsplCommand);

        await device.transferOut(endpointNum, data);
        await device.close();

        showToast(`Printed directly to ${device.productName || "USB Thermal Printer"}!`);
        logPrintJob("web-serial", device.productName || "Direct USB", "success");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "USB error";
        if (!msg.includes("No device selected") && !msg.includes("cancelled")) {
          alert(`Direct USB error: ${msg}`);
          logPrintJob("web-serial", "Direct USB Cable", "failed");
        }
      } finally {
        setIsPrinting(false);
      }
    } else {
      setIsPrinting(false);
    }
  };

  // 3. Browser System Print Dialog Fallback
  const handleSystemPrint = () => {
    logPrintJob("browser-dialog", "System Print Dialog", "success");
    window.print();
  };

  // Master Smart Print Action
  const handleSmartPrint = () => {
    if (activePrinter) {
      handlePrintNodeSilentPrint();
    } else {
      handleDirectUsbPrint();
    }
  };

  // Load a pre-built template
  const loadTemplate = (tmpl: LabelTemplate) => {
    setLabelSize(tmpl.size);
    setLabelTitle(tmpl.name);
    setElements(tmpl.elements);
    pushHistory(tmpl.elements);
    setSelectedId(null);
    setActiveView("editor");
    showToast(`Loaded ${tmpl.name}`);
  };

  // Export JSON Project File
  const handleExportJSON = () => {
    const data = {
      title: labelTitle,
      size: labelSize,
      orientation,
      elements,
      version: "2.0",
      app: "Bravon Studio",
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${labelTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}_bravon.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded label JSON project");
  };

  // Active printer helper
  const activePrinter = printers.find((p) => p.id === selectedPrinterId);

  // Filtered Templates
  const filteredTemplates = DEFAULT_DESIGN_TEMPLATES.filter((t) => {
    const matchesCat = templateCategory === "all" || t.category === templateCategory;
    const matchesQuery = !templateSearch || t.name.toLowerCase().includes(templateSearch.toLowerCase()) || t.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Drag and Resize Handlers
  const handleMouseDownElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setDraggingId(id);
    const el = elements.find((item) => item.id === id);
    if (el) {
      setDragOffset({
        x: e.clientX - el.x * MM_TO_PX * zoom,
        y: e.clientY - el.y * MM_TO_PX * zoom,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId) {
      const newX = Math.max(0, Math.round(((e.clientX - dragOffset.x) / (MM_TO_PX * zoom)) * 10) / 10);
      const newY = Math.max(0, Math.round(((e.clientY - dragOffset.y) / (MM_TO_PX * zoom)) * 10) / 10);
      updateElement(draggingId, { x: newX, y: newY });
    } else if (resizingId) {
      const deltaX = (e.clientX - resizeStart.x) / (MM_TO_PX * zoom);
      const deltaY = (e.clientY - resizeStart.y) / (MM_TO_PX * zoom);
      const newW = Math.max(5, Math.round((resizeStart.w + deltaX) * 10) / 10);
      const newH = Math.max(5, Math.round((resizeStart.h + deltaY) * 10) / 10);

      const targetEl = elements.find((el) => el.id === resizingId);
      if (targetEl) {
        if (targetEl.type === "qrcode") {
          updateElement(resizingId, { size: Math.max(10, Math.round(newW)) });
        } else if (targetEl.type === "line") {
          updateElement(resizingId, { width: newW });
        } else {
          updateElement(resizingId, { width: newW, height: newH });
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (draggingId || resizingId) {
      pushHistory(elements);
      setDraggingId(null);
      setResizingId(null);
    }
  };

  const isEditor = activeView === "editor";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        height: "100vh",
        backgroundColor: "#FFFFFF",
        color: "#0F172A",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, sans-serif",
      }}
    >
      {/* MOBILE STUDIO TOP BAR */}
      {isMobile && (
        <header
          style={{
            height: "52px",
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            zIndex: 60,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BravonLogo size="sm" iconOnly />
            <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0F172A" }}>Bravon Studio</span>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#7C3AED",
                backgroundColor: "rgba(124, 58, 237, 0.08)",
                padding: "2px 8px",
                borderRadius: "10px",
                textTransform: "capitalize",
              }}
            >
              {activeView === "editor" ? "Canvas" : activeView}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setShowAppsModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "#F1F5F9",
                color: "#7C3AED",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: "12px",
                padding: "4px 8px",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
              title="Download Desktop & Mobile Apps"
            >
              <Download size={12} />
              <span>Apps</span>
            </button>

            <div
              onClick={() => setActiveView("printers")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 8px",
                borderRadius: "12px",
                backgroundColor: activePrinter ? "#ECFDF5" : "#F1F5F9",
                border: `1px solid ${activePrinter ? "#A7F3D0" : "rgba(0,0,0,0.06)"}`,
                cursor: "pointer",
              }}
            >
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: activePrinter ? "#22C55E" : "#94A3B8" }} />
              <span style={{ fontSize: "0.68rem", fontWeight: 600, color: activePrinter ? "#047857" : "#64748B" }}>
                {activePrinter ? "Online" : "Offline"}
              </span>
            </div>

            {isEditor && (
              <button
                type="button"
                onClick={handleSmartPrint}
                disabled={isPrinting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  backgroundColor: "#7C3AED",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: isPrinting ? "wait" : "pointer",
                }}
              >
                <Printer size={13} />
                <span>Print</span>
              </button>
            )}
          </div>
        </header>
      )}

      {/* 1. DESKTOP APP SIDEBAR NAVIGATION (Hidden on mobile) */}
      {!isMobile && (
        <aside
          style={{
            width: isEditor ? "58px" : "220px",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid rgba(0, 0, 0, 0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 50,
          transition: "width 0.18s ease",
          boxShadow: "1px 0 3px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div>
          {/* App Header Brand */}
          <div
            style={{
              padding: isEditor ? "18px 0" : "18px 16px",
              borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: isEditor ? "center" : "flex-start",
              gap: "10px",
            }}
          >
            <BravonLogo size="sm" iconOnly />
            {!isEditor && (
              <div style={{ fontWeight: 700, fontSize: "0.98rem", color: "#0F172A", letterSpacing: "-0.01em" }}>
                Bravon Studio
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: isEditor ? "12px 6px" : "12px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "editor", label: "Studio Canvas", icon: Palette },
              { id: "templates", label: "Templates", icon: FolderOpen },
              { id: "printers", label: "Printers", icon: Printer },
              { id: "history", label: "Print History", icon: HistoryIcon },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  onClick={() => setActiveView(item.id as any)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isEditor ? "center" : "flex-start",
                    gap: "10px",
                    width: "100%",
                    padding: isEditor ? "10px 0" : "9px 12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: isActive ? "rgba(124, 58, 237, 0.08)" : "transparent",
                    color: isActive ? "#7C3AED" : "#475569",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Icon size={17} color={isActive ? "#7C3AED" : "#64748B"} />
                  {!isEditor && item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Hardware Status */}
        <div
          onClick={() => setActiveView("printers")}
          title={activePrinter ? `Printer: ${activePrinter.name}` : "Printer Offline"}
          style={{
            margin: isEditor ? "0 6px 64px" : "0 10px 64px",
            padding: isEditor ? "10px 0" : "10px 12px",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: isEditor ? "center" : "stretch",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#7C3AED";
            e.currentTarget.style.backgroundColor = "rgba(124, 58, 237, 0.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.backgroundColor = "#FFFFFF";
          }}
        >
          {isEditor ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  backgroundColor: activePrinter ? "#22C55E" : "#94A3B8",
                }}
              />
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Hardware
                </span>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: activePrinter ? "#22C55E" : "#94A3B8",
                  }}
                />
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {activePrinter ? activePrinter.name : "Printer Offline"}
              </div>
            </>
          )}

          {/* Desktop & Mobile Apps Quick Link */}
          <div
            onClick={() => setShowAppsModal(true)}
            style={{
              marginTop: "8px",
              padding: isEditor ? "8px 0" : "8px 10px",
              backgroundColor: "rgba(124, 58, 237, 0.08)",
              borderRadius: "8px",
              border: "1px solid rgba(124, 58, 237, 0.2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: isEditor ? "center" : "flex-start",
              gap: "8px",
              color: "#7C3AED",
              transition: "all 0.15s ease",
            }}
            title="Download Desktop & Mobile Apps"
          >
            <Download size={14} />
            {!isEditor && (
              <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>
                Desktop &amp; Mobile Apps
              </span>
            )}
          </div>
        </div>
      </aside>
      )}

      {/* 2. MAIN APPLICATION WORKSPACE CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* VIEW 1: DASHBOARD (HOME) */}
        {activeView === "dashboard" && (
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "18px 14px 90px" : "32px 36px", backgroundColor: "#FFFFFF" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
              {/* Dashboard Banner */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h1 style={{ fontSize: isMobile ? "1.45rem" : "1.85rem", fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em", margin: 0, marginBottom: "6px" }}>
                    Bravon Studio
                  </h1>
                  <p style={{ fontSize: isMobile ? "0.82rem" : "0.92rem", color: "#64748B", margin: 0, lineHeight: 1.5, maxWidth: "560px" }}>
                    Create custom labels or choose a pre-formatted template to start designing.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setActiveView("editor")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "#7C3AED",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 18px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    <Palette size={16} />
                    Open Canvas
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("printers")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "#F8FAFC",
                      color: "#0F172A",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: "8px",
                      padding: "10px 16px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Printer size={16} color={activePrinter ? "#16A34A" : "#64748B"} />
                    {activePrinter ? "Hardware Ready" : "Setup Printer"}
                  </button>
                </div>
              </div>

              {/* Native Apps & Downloads Banner */}
              <div
                style={{
                  backgroundColor: "rgba(124, 58, 237, 0.05)",
                  border: "1px solid rgba(124, 58, 237, 0.18)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  marginBottom: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      backgroundColor: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(124, 58, 237, 0.15)",
                    }}
                  >
                    <Download size={18} color="#7C3AED" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.92rem", color: "#1D1D1F" }}>
                      Bravon Native Apps available for Windows, macOS, iOS &amp; Android
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748B" }}>
                      Get direct high-speed USB printing on your computer or print wirelessly via Bluetooth from your phone.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setShowAppsModal(true)}
                    style={{
                      backgroundColor: "#7C3AED",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 14px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Download size={13} />
                    Download Desktop / Mobile Apps
                  </button>
                  <Link
                    href="/apps"
                    target="_blank"
                    style={{
                      color: "#64748B",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      padding: "6px 10px",
                    }}
                  >
                    All Apps →
                  </Link>
                </div>
              </div>

              {/* SECTION 1: START BLANK CANVAS PRESETS */}
              <div style={{ marginBottom: "36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A" }}>
                    Standard Sizes
                  </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(190px, 1fr))", gap: "10px" }}>
                  {[
                    { size: PRESET_LABEL_SIZES[0], label: "4″ × 6″ Shipping", desc: "100×150mm · UPS / FedEx / DHL", aspect: "100 / 150" },
                    { size: PRESET_LABEL_SIZES[4], label: "2.25″ × 1.25″ Retail", desc: "58×40mm · SKU / Amazon FBA", aspect: "58 / 40" },
                    { size: PRESET_LABEL_SIZES[2], label: "3″ × 2″ Warehouse", desc: "80×50mm · Bin / Pallet QR", aspect: "80 / 50" },
                    { size: PRESET_LABEL_SIZES[1], label: "1.5″ × 1″ Jewelry", desc: "40×30mm · Small Barcode", aspect: "40 / 30" },
                    { size: PRESET_LABEL_SIZES[3], label: "4″ × 3″ Master Carton", desc: "100×75mm · Shipping Box", aspect: "100 / 75" },
                  ].map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCreateBlankLabel(preset.size)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        borderRadius: "10px",
                        padding: "16px 14px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#7C3AED";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(124, 58, 237, 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.08)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <div style={{ width: "26px", height: "26px", borderRadius: "6px", backgroundColor: "rgba(124, 58, 237, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Square size={14} color="#7C3AED" />
                        </div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>
                          {preset.label}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "#64748B", margin: 0, marginBottom: "12px", lineHeight: 1.3 }}>
                        {preset.desc}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.72rem", color: "#7C3AED", fontWeight: 600 }}>
                        <span>Open Canvas</span>
                        <Plus size={13} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: POPULAR READY-TO-PRINT TEMPLATES */}
              <div style={{ marginBottom: "36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>
                      Featured Ready-to-Print Templates
                    </h2>
                    <p style={{ fontSize: "0.78rem", color: "#64748B", margin: 0 }}>
                      Pre-formatted commercial labels ready for customization and instant thermal dispatch
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView("templates")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#7C3AED",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>View All ({DEFAULT_DESIGN_TEMPLATES.length})</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                  {DEFAULT_DESIGN_TEMPLATES.slice(0, 3).map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => loadTemplate(tmpl)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        borderRadius: "12px",
                        padding: "18px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#7C3AED";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(124, 58, 237, 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.08)";
                        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.02)";
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>
                            {tmpl.name}
                          </span>
                          <span style={{ fontSize: "0.72rem", backgroundColor: "rgba(124, 58, 237, 0.08)", color: "#7C3AED", padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>
                            {tmpl.size.name.split(" ")[0]}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.45, margin: 0, marginBottom: "16px" }}>
                          {tmpl.description}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                        <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                          {tmpl.elements.length} elements
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "#7C3AED", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          Customize in Studio <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: MY SAVED LABELS */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>
                    My Saved Custom Labels
                  </h2>
                  {savedDocuments.length > 0 && (
                    <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                      {savedDocuments.length} saved project{savedDocuments.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {savedDocuments.length === 0 ? (
                  <div
                    style={{
                      padding: "20px 24px",
                      backgroundColor: "#F8FAFC",
                      borderRadius: "10px",
                      border: "1px solid rgba(0,0,0,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FolderOpen size={18} color="#94A3B8" />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0F172A" }}>
                          No saved custom labels yet
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                          Labels you design in Studio Canvas will be saved here for instant re-printing.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveView("editor")}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid rgba(0, 0, 0, 0.12)",
                        borderRadius: "6px",
                        padding: "6px 14px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#7C3AED",
                        cursor: "pointer",
                      }}
                    >
                      Design New Label →
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
                    {savedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: "12px",
                          padding: "16px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>{doc.name}</h4>
                          <span style={{ fontSize: "0.72rem", backgroundColor: "rgba(124,58,237,0.08)", color: "#7C3AED", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                            {doc.size.name.split(" ")[0]}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: "14px" }}>
                          {doc.elements.length} elements · Saved {doc.updatedAt}
                        </p>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => handleLoadDocument(doc)}
                            style={{ flex: 1, backgroundColor: "#7C3AED", color: "#FFF", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            Open in Studio
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSavedDocument(doc.id)}
                            style={{ backgroundColor: "rgba(239, 68, 68, 0.08)", color: "#DC2626", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: STUDIO CANVAS (FULL VISUAL EDITOR) */}
        {activeView === "editor" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Editor Action Bar */}
            <div
              style={{
                height: "54px",
                backgroundColor: "#FFFFFF",
                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 18px",
                zIndex: 40,
              }}
            >
              {/* Title & Preset */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="text"
                  value={labelTitle}
                  onChange={(e) => setLabelTitle(e.target.value)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid transparent",
                    color: "#0F172A",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    outline: "none",
                    maxWidth: "260px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--bravon-purple, #7C3AED)")}
                  onBlur={(e) => (e.target.style.borderColor = "transparent")}
                />

                <div style={{ position: "relative" }}>
                  <select
                    value={labelSize.name}
                    onChange={(e) => {
                      const found = PRESET_LABEL_SIZES.find((s) => s.name === e.target.value);
                      if (found) setLabelSize(found);
                    }}
                    style={{
                      backgroundColor: "#F8FAFC",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      color: "#0F172A",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      borderRadius: "6px",
                      padding: "5px 26px 5px 10px",
                      appearance: "none",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    {PRESET_LABEL_SIZES.map((preset) => (
                      <option key={preset.name} value={preset.name}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} style={{ position: "absolute", right: "8px", top: "9px", pointerEvents: "none", color: "#64748B" }} />
                </div>

                <div style={{ display: "flex", backgroundColor: "#F1F5F9", borderRadius: "6px", padding: "2px" }}>
                  <button
                    type="button"
                    onClick={() => setOrientation("portrait")}
                    style={{
                      backgroundColor: orientation === "portrait" ? "#FFFFFF" : "transparent",
                      color: orientation === "portrait" ? "#7C3AED" : "#64748B",
                      border: "none",
                      borderRadius: "4px",
                      padding: "3px 8px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation("landscape")}
                    style={{
                      backgroundColor: orientation === "landscape" ? "#FFFFFF" : "transparent",
                      color: orientation === "landscape" ? "#7C3AED" : "#64748B",
                      border: "none",
                      borderRadius: "4px",
                      padding: "3px 8px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              {/* Center Zoom / Undo */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyIndex === 0}
                    title="Undo (Ctrl+Z)"
                    style={{ background: "#F8FAFC", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "4px", padding: "5px 7px", cursor: historyIndex === 0 ? "not-allowed" : "pointer", color: historyIndex === 0 ? "#CBD5E1" : "#334155" }}
                  >
                    <Undo2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    title="Redo (Ctrl+Y)"
                    style={{ background: "#F8FAFC", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "4px", padding: "5px 7px", cursor: historyIndex >= history.length - 1 ? "not-allowed" : "pointer", color: historyIndex >= history.length - 1 ? "#CBD5E1" : "#334155" }}
                  >
                    <Redo2 size={14} />
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "2px", backgroundColor: "#F1F5F9", borderRadius: "6px", padding: "2px 6px" }}>
                  <button type="button" onClick={() => setZoom((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10))} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: "2px" }}>
                    <ZoomOut size={13} />
                  </button>
                  <span style={{ fontSize: "0.75rem", minWidth: "36px", textAlign: "center", fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>
                  <button type="button" onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.1) * 10) / 10))} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: "2px" }}>
                    <ZoomIn size={13} />
                  </button>
                  <button type="button" onClick={() => setZoom(1)} title="Fit 100%" style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: "2px" }}>
                    <Maximize2 size={12} />
                  </button>
                </div>
              </div>

              {/* Actions: Save, Export, Print */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleSaveDocument}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    backgroundColor: "#F8FAFC",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Save size={13} /> Save
                </button>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    backgroundColor: "#F8FAFC",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Download size={13} /> Export
                </button>

                <button
                  type="button"
                  onClick={() => setShowAppsModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    backgroundColor: "rgba(124, 58, 237, 0.08)",
                    border: "1px solid rgba(124, 58, 237, 0.25)",
                    color: "#7C3AED",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  title="Download Desktop & Mobile Apps"
                >
                  <Download size={13} /> Native Apps
                </button>

                <button
                  type="button"
                  onClick={handleSmartPrint}
                  disabled={isPrinting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#7C3AED",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: isPrinting ? "wait" : "pointer",
                    boxShadow: "0 3px 10px rgba(124, 58, 237, 0.3)",
                  }}
                >
                  <Printer size={14} />
                  {isPrinting ? "Printing..." : "Print Label"}
                </button>
              </div>
            </div>

            {/* Canvas Workspace [Tool shelf] + [White Canvas] + [Inspector] */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
              {/* Tool Shelf (Desktop only) */}
              {!isMobile && (
              <div style={{ width: "140px", backgroundColor: "#FFFFFF", borderRight: "1px solid rgba(0,0,0,0.08)", padding: "14px 10px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <h4 style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B", fontWeight: 700, marginBottom: "8px" }}>
                    Add Element
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {[
                      { type: "text", label: "Text", icon: Type },
                      { type: "barcode", label: "Barcode", icon: Barcode },
                      { type: "qrcode", label: "QR Code", icon: QrCode },
                      { type: "line", label: "Divider", icon: Minus },
                      { type: "box", label: "Box / Frame", icon: Square },
                      { type: "badge", label: "Caution Badge", icon: ShieldAlert },
                    ].map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.type}
                          type="button"
                          onClick={() => handleAddElement(tool.type as any)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "7px 10px",
                            backgroundColor: "#F8FAFC",
                            border: "1px solid rgba(0,0,0,0.08)",
                            borderRadius: "6px",
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            color: "#0F172A",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#7C3AED";
                            e.currentTarget.style.backgroundColor = "rgba(124, 58, 237, 0.04)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                            e.currentTarget.style.backgroundColor = "#F8FAFC";
                          }}
                        >
                          <Icon size={15} color="#7C3AED" />
                          <span>{tool.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <label
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "7px 10px",
                      backgroundColor: "#F1F5F9",
                      border: "1px dashed rgba(0,0,0,0.18)",
                      borderRadius: "6px",
                      color: "#475569",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Upload size={13} color="#7C3AED" /> Upload Logo
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Clear all elements on this canvas?")) {
                      pushHistory([]);
                      setSelectedId(null);
                    }
                  }}
                  style={{ marginTop: "auto", background: "none", border: "none", color: "#EF4444", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                >
                  <Trash2 size={12} /> Clear Canvas
                </button>
              </div>
              )}

              {/* White Drafting Board */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#F8FAFC",
                  backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: isMobile ? "flex-start" : "center",
                  overflow: "auto",
                  padding: isMobile ? "16px 8px 130px" : "40px",
                  userSelect: "none",
                  position: "relative",
                  width: "100%",
                }}
                onClick={() => setSelectedId(null)}
              >
                {/* Mobile Canvas Zoom & Info Bar */}
                {isMobile && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      maxWidth: "420px",
                      marginBottom: "10px",
                      padding: "0 4px",
                    }}
                  >
                    <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600 }}>
                      {labelSize.name} ({effectiveWidth}×{effectiveHeight}mm)
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "6px",
                        padding: "2px 6px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoom((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10));
                        }}
                        style={{ background: "none", border: "none", color: "#64748B", padding: "2px 4px", fontSize: "0.82rem", cursor: "pointer" }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, minWidth: "32px", textAlign: "center" }}>
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoom((z) => Math.min(2.0, Math.round((z + 0.1) * 10) / 10));
                        }}
                        style={{ background: "none", border: "none", color: "#64748B", padding: "2px 4px", fontSize: "0.82rem", cursor: "pointer" }}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoom(0.7);
                        }}
                        style={{ background: "none", border: "none", color: "#7C3AED", padding: "2px 4px", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        Fit
                      </button>
                    </div>
                  </div>
                )}

                {/* Physical Label Canvas */}
                <div
                  id="bravon-print-area"
                  ref={canvasRef}
                  style={{
                    width: `${effectiveWidth * MM_TO_PX * zoom}px`,
                    height: `${effectiveHeight * MM_TO_PX * zoom}px`,
                    backgroundColor: "#FFFFFF",
                    color: "#000000",
                    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06)",
                    borderRadius: "4px",
                    position: "relative",
                    overflow: "hidden",
                    transition: draggingId || resizingId ? "none" : "width 0.2s, height 0.2s",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {elements.map((el) => {
                    const isSelected = el.id === selectedId;
                    const xPx = el.x * MM_TO_PX * zoom;
                    const yPx = el.y * MM_TO_PX * zoom;

                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleMouseDownElement(e, el.id)}
                        style={{
                          position: "absolute",
                          left: `${xPx}px`,
                          top: `${yPx}px`,
                          cursor: draggingId === el.id ? "grabbing" : "grab",
                          outline: isSelected ? "2px solid #7C3AED" : "none",
                          outlineOffset: "2px",
                          zIndex: isSelected ? 30 : 10,
                          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                          transformOrigin: "top left",
                        }}
                      >
                        {/* Text */}
                        {el.type === "text" && (
                          <div
                            style={{
                              width: `${el.width * MM_TO_PX * zoom}px`,
                              minHeight: `${el.height * MM_TO_PX * zoom}px`,
                              fontWeight: el.bold ? 700 : 400,
                              fontSize: `${
                                el.fontSize === "1" ? 10 * zoom : el.fontSize === "2" ? 12 * zoom : el.fontSize === "3" ? 15 * zoom : el.fontSize === "4" ? 20 * zoom : el.fontSize === "5" ? 26 * zoom : 34 * zoom
                              }px`,
                              textAlign: el.align || "left",
                              lineHeight: 1.25,
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap",
                              color: "#000000",
                              fontFamily: "-apple-system, BlinkMacSystemFont, Arial, sans-serif",
                            }}
                          >
                            {el.content}
                          </div>
                        )}

                        {/* Barcode */}
                        {el.type === "barcode" && (
                          <div style={{ width: `${el.width * MM_TO_PX * zoom}px`, height: `${el.height * MM_TO_PX * zoom}px`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <svg width="100%" height={el.showText ? "78%" : "100%"} viewBox="0 0 160 50" preserveAspectRatio="none" style={{ display: "block" }}>
                              {generateCode128Bars(el.content).reduce<{ rects: React.ReactNode[]; currentX: number }>(
                                (acc, bar, i) => {
                                  if (bar.isBar) {
                                    acc.rects.push(<rect key={i} x={acc.currentX} y="0" width={bar.width} height="50" fill="#000000" />);
                                  }
                                  acc.currentX += bar.width;
                                  return acc;
                                },
                                { rects: [], currentX: 0 }
                              ).rects}
                            </svg>
                            {el.showText && (
                              <div style={{ fontSize: `${11 * zoom}px`, fontWeight: 600, letterSpacing: "0.1em", color: "#000000", marginTop: "2px", fontFamily: "monospace" }}>
                                {el.content}
                              </div>
                            )}
                          </div>
                        )}

                        {/* QR Code */}
                        {el.type === "qrcode" && (
                          <div style={{ width: `${el.size * MM_TO_PX * zoom}px`, height: `${el.size * MM_TO_PX * zoom}px`, backgroundColor: "#FFFFFF", padding: `${1 * zoom}px` }}>
                            <svg width="100%" height="100%" viewBox="0 0 25 25" shapeRendering="crispEdges" style={{ display: "block" }}>
                              {generateQRMatrix(el.content).map((row, r) =>
                                row.map((dark, c) => (dark ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#000000" /> : null))
                              )}
                            </svg>
                          </div>
                        )}

                        {/* Line */}
                        {el.type === "line" && (
                          <div style={{ width: `${el.width * MM_TO_PX * zoom}px`, height: `${Math.max(1, el.thickness * zoom)}px`, backgroundColor: "#000000" }} />
                        )}

                        {/* Box */}
                        {el.type === "box" && (
                          <div style={{ width: `${el.width * MM_TO_PX * zoom}px`, height: `${el.height * MM_TO_PX * zoom}px`, border: `${Math.max(1, el.thickness * zoom)}px solid #000000`, backgroundColor: el.fill ? "#000000" : "transparent", boxSizing: "border-box" }} />
                        )}

                        {/* Badge */}
                        {el.type === "badge" && (
                          <div style={{ width: `${el.width * MM_TO_PX * zoom}px`, height: `${el.height * MM_TO_PX * zoom}px`, backgroundColor: "#000000", color: "#FFFFFF", fontWeight: 900, fontSize: `${13 * zoom}px`, letterSpacing: "0.08em", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px", textAlign: "center" }}>
                            {el.label}
                          </div>
                        )}

                        {/* Image / Logo */}
                        {el.type === "image" && (
                          <div style={{ width: `${el.width * MM_TO_PX * zoom}px`, height: `${el.height * MM_TO_PX * zoom}px`, backgroundImage: `url(${el.src})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", filter: "grayscale(100%) contrast(150%)" }} />
                        )}

                        {/* Resize handle */}
                        {isSelected && (
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setResizingId(el.id);
                              const curW = "width" in el ? el.width : el.type === "qrcode" ? el.size : 20;
                              const curH = "height" in el ? el.height : el.type === "qrcode" ? el.size : 10;
                              setResizeStart({ x: e.clientX, y: e.clientY, w: curW, h: curH });
                            }}
                            style={{
                              position: "absolute",
                              right: "-6px",
                              bottom: "-6px",
                              width: "12px",
                              height: "12px",
                              backgroundColor: "#7C3AED",
                              border: "2px solid #FFFFFF",
                              borderRadius: "50%",
                              cursor: "nwse-resize",
                              zIndex: 40,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inspector Panel (Desktop only) */}
              {!isMobile && (
              <div style={{ width: "270px", backgroundColor: "#FFFFFF", borderLeft: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}>
                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#F8FAFC" }}>
                  <button
                    type="button"
                    onClick={() => setActiveInspectorTab("properties")}
                    style={{ flex: 1, padding: "10px", border: "none", background: "transparent", color: activeInspectorTab === "properties" ? "#7C3AED" : "#64748B", fontWeight: activeInspectorTab === "properties" ? 700 : 500, fontSize: "0.8rem", cursor: "pointer", borderBottom: activeInspectorTab === "properties" ? "2px solid #7C3AED" : "2px solid transparent" }}
                  >
                    Properties
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveInspectorTab("layers")}
                    style={{ flex: 1, padding: "10px", border: "none", background: "transparent", color: activeInspectorTab === "layers" ? "#7C3AED" : "#64748B", fontWeight: activeInspectorTab === "layers" ? 700 : 500, fontSize: "0.8rem", cursor: "pointer", borderBottom: activeInspectorTab === "layers" ? "2px solid #7C3AED" : "2px solid transparent" }}
                  >
                    Layers ({elements.length})
                  </button>
                </div>

                {/* Properties Tab */}
                {activeInspectorTab === "properties" && (
                  <div style={{ padding: "14px", overflowY: "auto", flex: 1 }}>
                    {!selectedElement ? (
                      <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "0.82rem", marginTop: "40px" }}>
                        Click any element on canvas to adjust position, size, and content.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase" }}>
                            {selectedElement.type}
                          </span>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button type="button" onClick={() => handleCenterHorizontal(selectedElement.id)} title="Center Horizontally" style={{ background: "#F1F5F9", border: "none", borderRadius: "4px", padding: "4px 6px", cursor: "pointer" }}>
                              <AlignCenterHorizontal size={12} />
                            </button>
                            <button type="button" onClick={() => handleDuplicate(selectedElement.id)} title="Duplicate" style={{ background: "#F1F5F9", border: "none", borderRadius: "4px", padding: "4px 6px", cursor: "pointer" }}>
                              <Copy size={12} />
                            </button>
                            <button type="button" onClick={() => handleDeleteElement(selectedElement.id)} title="Delete" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#DC2626", border: "none", borderRadius: "4px", padding: "4px 6px", cursor: "pointer" }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Position */}
                        <div>
                          <label style={{ fontSize: "0.72rem", color: "#64748B", display: "block", marginBottom: "4px" }}>Position (mm)</label>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                            <div>
                              <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>X:</span>
                              <input type="number" value={selectedElement.x} onChange={(e) => updateElement(selectedElement.id, { x: parseFloat(e.target.value) || 0 })} style={{ width: "100%", padding: "4px 6px", fontSize: "0.8rem", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.12)" }} />
                            </div>
                            <div>
                              <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>Y:</span>
                              <input type="number" value={selectedElement.y} onChange={(e) => updateElement(selectedElement.id, { y: parseFloat(e.target.value) || 0 })} style={{ width: "100%", padding: "4px 6px", fontSize: "0.8rem", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.12)" }} />
                            </div>
                          </div>
                        </div>

                        {/* Dimensions */}
                        {"width" in selectedElement && (
                          <div>
                            <label style={{ fontSize: "0.72rem", color: "#64748B", display: "block", marginBottom: "4px" }}>Dimensions (mm)</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                              <div>
                                <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>Width:</span>
                                <input type="number" value={selectedElement.width} onChange={(e) => updateElement(selectedElement.id, { width: parseFloat(e.target.value) || 10 })} style={{ width: "100%", padding: "4px 6px", fontSize: "0.8rem", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.12)" }} />
                              </div>
                              {"height" in selectedElement && (
                                <div>
                                  <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>Height:</span>
                                  <input type="number" value={selectedElement.height} onChange={(e) => updateElement(selectedElement.id, { height: parseFloat(e.target.value) || 5 })} style={{ width: "100%", padding: "4px 6px", fontSize: "0.8rem", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.12)" }} />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* QR Size */}
                        {selectedElement.type === "qrcode" && (
                          <div>
                            <label style={{ fontSize: "0.72rem", color: "#64748B", display: "block", marginBottom: "4px" }}>QR Size (mm)</label>
                            <input type="number" value={selectedElement.size} onChange={(e) => updateElement(selectedElement.id, { size: parseFloat(e.target.value) || 10 })} style={{ width: "100%", padding: "4px 6px", fontSize: "0.8rem", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.12)" }} />
                          </div>
                        )}

                        {/* Content text / code */}
                        {(selectedElement.type === "text" || selectedElement.type === "barcode" || selectedElement.type === "qrcode") && (
                          <div>
                            <label style={{ fontSize: "0.72rem", color: "#64748B", display: "block", marginBottom: "4px" }}>Content Value</label>
                            {selectedElement.type === "text" ? (
                              <textarea rows={3} value={selectedElement.content} onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })} style={{ width: "100%", padding: "6px", fontSize: "0.8rem", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.12)", resize: "vertical" }} />
                            ) : (
                              <input type="text" value={selectedElement.content} onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })} style={{ width: "100%", padding: "4px 6px", fontSize: "0.8rem", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.12)" }} />
                            )}
                          </div>
                        )}

                        {/* Rotation */}
                        <div>
                          <label style={{ fontSize: "0.72rem", color: "#64748B", display: "block", marginBottom: "4px" }}>Rotation</label>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {([0, 90, 180, 270] as const).map((deg) => (
                              <button
                                key={deg}
                                type="button"
                                onClick={() => updateElement(selectedElement.id, { rotation: deg })}
                                style={{ flex: 1, padding: "4px 0", fontSize: "0.72rem", border: "none", borderRadius: "4px", backgroundColor: selectedElement.rotation === deg ? "#7C3AED" : "#F1F5F9", color: selectedElement.rotation === deg ? "#FFF" : "#334155", fontWeight: 600, cursor: "pointer" }}
                              >
                                {deg}°
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Layers Tab */}
                {activeInspectorTab === "layers" && (
                  <div style={{ padding: "10px", overflowY: "auto", flex: 1 }}>
                    {elements.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "0.8rem", marginTop: "40px" }}>No elements</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {elements.map((el) => {
                          const isSel = el.id === selectedId;
                          return (
                            <div
                              key={el.id}
                              onClick={() => setSelectedId(el.id)}
                              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: "6px", backgroundColor: isSel ? "rgba(124, 58, 237, 0.08)" : "#F8FAFC", border: isSel ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(0,0,0,0.06)", cursor: "pointer", fontSize: "0.78rem" }}
                            >
                              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {el.type === "text" ? el.content : el.type === "barcode" ? `Bar: ${el.content}` : el.type === "qrcode" ? `QR: ${el.content}` : el.type}
                              </div>
                              <div style={{ display: "flex", gap: "2px" }}>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveLayer(el.id, "up"); }} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: "2px" }}>▲</button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveLayer(el.id, "down"); }} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: "2px" }}>▼</button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteElement(el.id); }} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "2px" }}><Trash2 size={12} /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

              {/* Floating Mobile Selected Element Quick Controls & Nudge */}
              {isMobile && selectedElement && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "fixed",
                    bottom: "74px",
                    left: "12px",
                    right: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.96)",
                    backdropFilter: "blur(14px)",
                    border: "1.5px solid #7C3AED",
                    borderRadius: "14px",
                    padding: "8px 12px",
                    boxShadow: "0 8px 24px rgba(124, 58, 237, 0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "6px",
                    zIndex: 75,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        backgroundColor: "rgba(124,58,237,0.1)",
                        color: "#7C3AED",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        flexShrink: 0,
                      }}
                    >
                      {selectedElement.type}
                    </span>
                    {selectedElement.type === "text" && (
                      <input
                        type="text"
                        value={selectedElement.content}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                        style={{
                          width: "100%",
                          maxWidth: "120px",
                          padding: "4px 6px",
                          fontSize: "0.78rem",
                          borderRadius: "4px",
                          border: "1px solid rgba(0,0,0,0.15)",
                          outline: "none",
                        }}
                      />
                    )}
                    {(selectedElement.type === "barcode" || selectedElement.type === "qrcode") && (
                      <input
                        type="text"
                        value={selectedElement.content}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                        style={{
                          width: "100%",
                          maxWidth: "100px",
                          padding: "4px 6px",
                          fontSize: "0.78rem",
                          borderRadius: "4px",
                          border: "1px solid rgba(0,0,0,0.15)",
                          outline: "none",
                        }}
                      />
                    )}
                  </div>

                  {/* Precision Nudge Keys for Touch */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1px", backgroundColor: "#F1F5F9", borderRadius: "6px", padding: "2px" }}>
                    <button type="button" onClick={() => handleNudge(-1, 0)} title="Nudge Left 1mm" style={{ border: "none", background: "none", padding: "4px 5px", cursor: "pointer", fontSize: "0.72rem", color: "#334155" }}>◀</button>
                    <button type="button" onClick={() => handleNudge(0, -1)} title="Nudge Up 1mm" style={{ border: "none", background: "none", padding: "4px 5px", cursor: "pointer", fontSize: "0.72rem", color: "#334155" }}>▲</button>
                    <button type="button" onClick={() => handleNudge(0, 1)} title="Nudge Down 1mm" style={{ border: "none", background: "none", padding: "4px 5px", cursor: "pointer", fontSize: "0.72rem", color: "#334155" }}>▼</button>
                    <button type="button" onClick={() => handleNudge(1, 0)} title="Nudge Right 1mm" style={{ border: "none", background: "none", padding: "4px 5px", cursor: "pointer", fontSize: "0.72rem", color: "#334155" }}>▶</button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      type="button"
                      onClick={() => handleCenterHorizontal(selectedElement.id)}
                      title="Center Horizontally"
                      style={{ border: "none", background: "#F1F5F9", padding: "5px 7px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      <AlignCenterHorizontal size={13} color="#475569" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPropertiesSheet(true)}
                      style={{ border: "none", backgroundColor: "#7C3AED", color: "#FFFFFF", padding: "5px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteElement(selectedElement.id)}
                      style={{ border: "none", background: "#FEE2E2", color: "#DC2626", padding: "5px 7px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Canvas Tool Dock */}
              {isMobile && !selectedElement && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "fixed",
                    bottom: "74px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "rgba(255, 255, 255, 0.96)",
                    backdropFilter: "blur(14px)",
                    borderRadius: "30px",
                    border: "1px solid rgba(0,0,0,0.12)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                    padding: "4px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    zIndex: 70,
                    whiteSpace: "nowrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowAddElementSheet(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      backgroundColor: "#7C3AED",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "20px",
                      padding: "7px 14px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={14} /> Add Element
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPropertiesSheet(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: "20px",
                      padding: "7px 12px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    <Sliders size={13} /> Properties
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLayersSheet(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: "20px",
                      padding: "7px 12px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    <Layers size={13} /> Layers ({elements.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: TEMPLATES GALLERY */}
        {activeView === "templates" && (
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "18px 14px 90px" : "36px 40px", backgroundColor: "#FFFFFF" }}>
            <div style={{ maxWidth: "1050px", margin: "0 auto" }}>
              <div style={{ marginBottom: "20px" }}>
                <h1 style={{ fontSize: isMobile ? "1.45rem" : "1.8rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                  Commercial Label Templates
                </h1>
                <p style={{ fontSize: isMobile ? "0.82rem" : "0.92rem", color: "#64748B", margin: 0 }}>
                  Verified pre-configured thermal templates for shipping carriers, barcode tags, warehouse pallets, and fragile goods.
                </p>
              </div>

              {/* Search & Category Tabs */}
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", whiteSpace: "nowrap", flexWrap: isMobile ? "nowrap" : "wrap", paddingBottom: isMobile ? "6px" : "0", WebkitOverflowScrolling: "touch" }}>
                  {[
                    { id: "all", label: "All Templates" },
                    { id: "shipping", label: "Shipping & Logistics" },
                    { id: "retail", label: "Retail & Apparel" },
                    { id: "warehouse", label: "Warehouse & Asset" },
                    { id: "warning", label: "Hazmat & Caution" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTemplateCategory(cat.id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "999px",
                        border: "none",
                        backgroundColor: templateCategory === cat.id ? "#7C3AED" : "#F1F5F9",
                        color: templateCategory === cat.id ? "#FFFFFF" : "#475569",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div style={{ position: "relative", minWidth: isMobile ? "100%" : "220px" }}>
                  <Search size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "#94A3B8" }} />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "7px 12px 7px 32px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      backgroundColor: "#F8FAFC",
                      fontSize: "0.82rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Template Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(310px, 1fr))", gap: "16px" }}>
                {filteredTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    style={{
                      backgroundColor: "#F8FAFC",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: "14px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A" }}>{tmpl.name}</h3>
                        <span style={{ fontSize: "0.72rem", backgroundColor: "rgba(124,58,237,0.08)", color: "#7C3AED", fontWeight: 700, padding: "2px 8px", borderRadius: "999px" }}>
                          {tmpl.size.name.split(" ")[0]}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.5, marginBottom: "16px" }}>
                        {tmpl.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                      <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>{tmpl.elements.length} elements</span>
                      <button
                        type="button"
                        onClick={() => loadTemplate(tmpl)}
                        style={{
                          backgroundColor: "#7C3AED",
                          color: "#FFF",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 14px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Customize in Studio →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: PRINTER HARDWARE & OUTPUT SETUP */}
        {activeView === "printers" && (
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "18px 14px 90px" : "36px 40px", backgroundColor: "#FFFFFF" }}>
            <div style={{ maxWidth: "780px", margin: "0 auto" }}>
              <div style={{ marginBottom: "20px" }}>
                <h1 style={{ fontSize: isMobile ? "1.45rem" : "1.75rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                  Printer Setup &amp; Output
                </h1>
                <p style={{ fontSize: isMobile ? "0.82rem" : "0.9rem", color: "#64748B", margin: 0 }}>
                  Choose how you want to send labels to your Bravon thermal printer.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* 1. Direct USB Hardware (Primary / Recommended) */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #7C3AED",
                    borderRadius: "12px",
                    padding: isMobile ? "16px 14px" : "24px",
                    boxShadow: "0 4px 20px rgba(124, 58, 237, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(124, 58, 237, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Usb size={20} color="#7C3AED" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                          Direct USB Connect
                        </h3>
                        <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}>
                          Driverless direct hardware streaming · Zero 3rd-party accounts
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        backgroundColor: "rgba(124, 58, 237, 0.1)",
                        color: "#7C3AED",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      Recommended
                    </span>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.55, margin: "0 0 18px" }}>
                    Connect your Bravon printer with a standard USB cable. Chrome, Edge, and Opera stream raw TSPL thermal print jobs straight to the printer head with zero background software.
                  </p>

                  {/* 3 Step Flow */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "10px", padding: "14px 16px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.06)", marginBottom: "20px" }}>
                    {[
                      { num: "1", title: "Plug in USB", desc: "Turn printer power ON" },
                      { num: "2", title: "Pair Once", desc: "Approve the browser popup" },
                      { num: "3", title: "Instant Print", desc: "Silent 1-click thermal output" },
                    ].map((st) => (
                      <div key={st.num} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(124, 58, 237, 0.1)",
                            color: "#7C3AED",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "1px",
                          }}
                        >
                          {st.num}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0F172A", marginBottom: "1px" }}>{st.title}</div>
                          <div style={{ fontSize: "0.72rem", color: "#64748B" }}>{st.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={handleDirectUsbPrint}
                      disabled={isPrinting}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: "#7C3AED",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "8px",
                        padding: "9px 18px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: isPrinting ? "wait" : "pointer",
                        boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Usb size={14} />
                      {isPrinting ? "Sending Print..." : "Connect USB & Print Test Label"}
                    </button>
                    <span style={{ fontSize: "0.74rem", color: "#64748B" }}>
                      Chrome, Edge, Brave &amp; Opera
                    </span>
                  </div>
                </div>

                {/* 2. Standard System Print Dialog (Universal Fallback) */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    borderRadius: "12px",
                    padding: "24px",
                    transition: "border-color 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(124, 58, 237, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Printer size={20} color="#7C3AED" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                          Standard System Print Dialog
                        </h3>
                        <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}>
                          Universal fallback for all browsers and platforms
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        backgroundColor: "#F1F5F9",
                        color: "#475569",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      Universal
                    </span>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.55, margin: "0 0 16px" }}>
                    Compatible with Safari, Firefox, Chrome, Edge, and on Mac, Windows, or Chromebook. Sends high-DPI raster straight to your operating system&apos;s printer manager.
                  </p>

                  <button
                    type="button"
                    onClick={handleSystemPrint}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#0F172A",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F8FAFC";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }}
                  >
                    <Printer size={14} /> Open System Print Dialog
                  </button>
                </div>

                {/* 3. Optional Enterprise Cloud Relay (PrintNode) */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    borderRadius: "12px",
                    padding: "24px",
                    transition: "border-color 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(124, 58, 237, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Wifi size={18} color="#7C3AED" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                          PrintNode Cloud Relay
                        </h3>
                        <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}>
                          Optional for remote multi-warehouse network queues
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        backgroundColor: "#F1F5F9",
                        color: "#64748B",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      Optional
                    </span>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.55, margin: "0 0 16px" }}>
                    Standard Bravon users do not need this. If your organization routes print jobs from a centralized server across multiple distant physical warehouses, you can paste your PrintNode API key below.
                  </p>

                  <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                    <input
                      type="password"
                      placeholder="PrintNode API key (optional)"
                      value={printNodeKey}
                      onChange={(e) => setPrintNodeKey(e.target.value)}
                      style={{
                        flex: 1,
                        backgroundColor: "#FFFFFF",
                        border: "1px solid rgba(0, 0, 0, 0.12)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "0.82rem",
                        color: "#0F172A",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#7C3AED";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.12)";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSavePrintNodeKey(printNodeKey)}
                      style={{
                        backgroundColor: "#0F172A",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 16px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Save Key
                    </button>
                  </div>

                  {printNodeKey && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "#334155" }}>
                          Discovered Cloud Printers ({printers.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => fetchPrintNodePrinters(printNodeKey)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#7C3AED",
                            fontSize: "0.72rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontWeight: 600,
                          }}
                        >
                          <RefreshCw size={11} /> Refresh Devices
                        </button>
                      </div>

                      {printers.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {printers.map((p) => {
                            const isSel = p.id === selectedPrinterId;
                            return (
                              <div
                                key={p.id}
                                onClick={() => {
                                  setSelectedPrinterId(p.id);
                                  localStorage.setItem("bravon_selected_printer_id", String(p.id));
                                  showToast(`Selected ${p.name}`);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "9px 12px",
                                  backgroundColor: isSel ? "rgba(124, 58, 237, 0.06)" : "#FFFFFF",
                                  border: isSel ? "1px solid #7C3AED" : "1px solid rgba(0, 0, 0, 0.08)",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: p.state === "online" ? "#22C55E" : "#94A3B8" }} />
                                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0F172A" }}>{p.name}</span>
                                </div>
                                {isSel && <Check size={14} color="#7C3AED" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: PRINT HISTORY & ONE-CLICK REPRINT */}
        {activeView === "history" && (
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "18px 14px 90px" : "36px 40px", backgroundColor: "#FFFFFF" }}>
            <div style={{ maxWidth: "860px", margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isMobile ? "16px" : "28px" }}>
                <div>
                  <h1 style={{ fontSize: isMobile ? "1.45rem" : "1.8rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                    Print History &amp; Audit Logs
                  </h1>
                  <p style={{ fontSize: isMobile ? "0.82rem" : "0.92rem", color: "#64748B" }}>
                    Complete audit trail of all labels sent to thermal hardware with 1-click re-print capabilities.
                  </p>
                </div>
                {printHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Clear all print history records?")) {
                        setPrintHistory([]);
                        localStorage.removeItem("bravon_print_history");
                      }
                    }}
                    style={{ background: "none", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", color: "#DC2626", padding: "6px 12px", fontSize: "0.78rem", cursor: "pointer" }}
                  >
                    Clear History
                  </button>
                )}
              </div>

              {printHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 20px", backgroundColor: "#F8FAFC", borderRadius: "14px", border: "1px dashed rgba(0,0,0,0.15)" }}>
                  <HistoryIcon size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                  <p style={{ fontSize: "0.88rem", color: "#64748B", margin: 0 }}>
                    No printed jobs recorded yet. When you print labels, they will appear here with instant reprint shortcuts.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {printHistory.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 18px",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: item.status === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CheckCircle2 size={16} color={item.status === "success" ? "#16A34A" : "#DC2626"} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A" }}>{item.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                            {item.printerName} · {item.size} · {item.copies} copy · {item.timestamp}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={activePrinter ? handlePrintNodeSilentPrint : handleSystemPrint}
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid rgba(0,0,0,0.12)",
                          borderRadius: "6px",
                          padding: "6px 14px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#7C3AED",
                          cursor: "pointer",
                        }}
                      >
                        Reprint Label
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 6: SETTINGS */}
        {activeView === "settings" && (
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "18px 14px 90px" : "36px 40px", backgroundColor: "#FFFFFF" }}>
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              <div style={{ marginBottom: isMobile ? "16px" : "28px" }}>
                <h1 style={{ fontSize: isMobile ? "1.45rem" : "1.8rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                  Studio Preferences
                </h1>
                <p style={{ fontSize: isMobile ? "0.82rem" : "0.92rem", color: "#64748B" }}>
                  Hardware sensor settings, measurement units, and application defaults.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Units */}
                <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "20px" }}>
                  <label style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A", display: "block", marginBottom: "4px" }}>
                    Measurement Units
                  </label>
                  <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: "12px" }}>
                    Choose your preferred dimension units for the canvas editor.
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[
                      { id: "mm", label: "Millimeters (mm)" },
                      { id: "in", label: "Inches (in)" },
                    ].map((u) => {
                      const isSel = unitPreference === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => { setUnitPreference(u.id as any); localStorage.setItem("bravon_unit_pref", u.id); }}
                          style={{
                            padding: "7px 16px",
                            borderRadius: "8px",
                            border: isSel ? "none" : "1px solid rgba(0,0,0,0.12)",
                            backgroundColor: isSel ? "#7C3AED" : "#FFFFFF",
                            color: isSel ? "#FFFFFF" : "#475569",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            boxShadow: isSel ? "0 2px 6px rgba(124, 58, 237, 0.25)" : "none",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {u.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sensor Mode */}
                <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "20px" }}>
                  <label style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A", display: "block", marginBottom: "4px" }}>
                    Thermal Media Sensor Calibration
                  </label>
                  <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: "12px" }}>
                    Select how the printer senses the start and end of each physical label roll.
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[
                      { id: "gap", label: "Die-Cut Gap (Standard)" },
                      { id: "cont", label: "Continuous Roll" },
                      { id: "black", label: "Black Mark Sensor" },
                    ].map((s) => {
                      const isSel = sensorType === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { setSensorType(s.id as any); localStorage.setItem("bravon_sensor_pref", s.id); }}
                          style={{
                            padding: "7px 16px",
                            borderRadius: "8px",
                            border: isSel ? "none" : "1px solid rgba(0,0,0,0.12)",
                            backgroundColor: isSel ? "#7C3AED" : "#FFFFFF",
                            color: isSel ? "#FFFFFF" : "#475569",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            boxShadow: isSel ? "0 2px 6px rgba(124, 58, 237, 0.25)" : "none",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Thermal Print Head Density & Speed */}
                <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>
                      Thermal Head Darkness (Density: {thermalDensity})
                    </label>
                    <span style={{ fontSize: "0.72rem", color: "#7C3AED", fontWeight: 600, backgroundColor: "rgba(124, 58, 237, 0.08)", padding: "2px 8px", borderRadius: "999px" }}>
                      {thermalDensity <= 5 ? "Light" : thermalDensity <= 10 ? "Standard (Optimal)" : "Deep / High-Contrast"}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: "14px" }}>
                    Controls heat burn intensity on thermal paper. Higher values produce darker, more durable barcodes.
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={thermalDensity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setThermalDensity(val);
                      localStorage.setItem("bravon_density_pref", String(val));
                    }}
                    style={{ width: "100%", accentColor: "#7C3AED", marginBottom: "18px" }}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>
                      Thermal Print Speed ({thermalSpeed} IPS)
                    </label>
                    <span style={{ fontSize: "0.72rem", color: "#64748B" }}>
                      Inches Per Second
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[2, 3, 4, 5].map((spd) => {
                      const isSel = thermalSpeed === spd;
                      return (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => { setThermalSpeed(spd); localStorage.setItem("bravon_speed_pref", String(spd)); }}
                          style={{
                            padding: "7px 14px",
                            borderRadius: "8px",
                            border: isSel ? "none" : "1px solid rgba(0,0,0,0.12)",
                            backgroundColor: isSel ? "#7C3AED" : "#FFFFFF",
                            color: isSel ? "#FFFFFF" : "#475569",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            boxShadow: isSel ? "0 2px 6px rgba(124, 58, 237, 0.25)" : "none",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {spd} IPS {spd === 4 ? "(Recommended)" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION DOCK (Thumb-friendly iOS-style bar) */}
      {isMobile && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: "56px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(14px)",
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            zIndex: 80,
            boxShadow: "0 -4px 14px rgba(0, 0, 0, 0.04)",
          }}
        >
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "editor", label: "Canvas", icon: Palette },
            { id: "templates", label: "Templates", icon: FolderOpen },
            { id: "printers", label: "Printers", icon: Printer },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id as any)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2px",
                  background: "none",
                  border: "none",
                  padding: "6px 10px",
                  color: isActive ? "#7C3AED" : "#64748B",
                  cursor: "pointer",
                }}
              >
                <Icon size={19} color={isActive ? "#7C3AED" : "#64748B"} />
                <span style={{ fontSize: "0.68rem", fontWeight: isActive ? 700 : 500 }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* MOBILE ADD ELEMENT BOTTOM DRAWER */}
      {isMobile && showAddElementSheet && (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div onClick={() => setShowAddElementSheet(false)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(3px)" }} />
          <div style={{ position: "relative", backgroundColor: "#FFFFFF", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", padding: "18px 18px 30px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 -10px 30px rgba(0,0,0,0.15)", zIndex: 10 }}>
            <div style={{ width: "36px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "2px", margin: "0 auto 14px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>Add Element to Canvas</h3>
              <button type="button" onClick={() => setShowAddElementSheet(false)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: "4px" }}><X size={18} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { type: "text", label: "Text Block", desc: "Names, addresses, SKUs", icon: Type },
                { type: "barcode", label: "Barcode (1D)", desc: "Code 128 / Code 39", icon: Barcode },
                { type: "qrcode", label: "QR Code (2D)", desc: "URLs, tracking links", icon: QrCode },
                { type: "line", label: "Divider Line", desc: "Horizontal separation", icon: Minus },
                { type: "box", label: "Box / Border", desc: "Highlight sections", icon: Square },
                { type: "badge", label: "Caution Badge", desc: "Fragile, Hazmat warning", icon: ShieldAlert },
              ].map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.type}
                    type="button"
                    onClick={() => {
                      handleAddElement(tool.type as any);
                      setShowAddElementSheet(false);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: "12px",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: "10px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <Icon size={17} color="#7C3AED" />
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>{tool.label}</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#64748B" }}>{tool.desc}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "10px", border: "1.5px dashed #7C3AED", backgroundColor: "rgba(124, 58, 237, 0.04)", color: "#7C3AED", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                <Upload size={16} /> Upload Custom Logo / Graphic
                <input type="file" accept="image/*" onChange={(e) => { handleImageUpload(e); setShowAddElementSheet(false); }} style={{ display: "none" }} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE PROPERTIES BOTTOM DRAWER */}
      {isMobile && showPropertiesSheet && (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div onClick={() => setShowPropertiesSheet(false)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(3px)" }} />
          <div style={{ position: "relative", backgroundColor: "#FFFFFF", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", padding: "18px", maxHeight: "75vh", overflowY: "auto", boxShadow: "0 -10px 30px rgba(0,0,0,0.15)", zIndex: 10 }}>
            <div style={{ width: "36px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "2px", margin: "0 auto 14px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sliders size={18} color="#7C3AED" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                  {selectedElement ? `${selectedElement.type.toUpperCase()} Properties` : "Element Properties"}
                </h3>
              </div>
              <button type="button" onClick={() => setShowPropertiesSheet(false)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: "4px" }}><X size={18} /></button>
            </div>

            {!selectedElement ? (
              <div style={{ textAlign: "center", color: "#64748B", padding: "30px 10px", fontSize: "0.85rem" }}>
                Tap an element on the canvas first to view and edit its properties.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Content editing */}
                {(selectedElement.type === "text" || selectedElement.type === "barcode" || selectedElement.type === "qrcode") && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Content Value</label>
                    {selectedElement.type === "text" ? (
                      <textarea rows={2} value={selectedElement.content} onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem", boxSizing: "border-box" }} />
                    ) : (
                      <input type="text" value={selectedElement.content} onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem", boxSizing: "border-box" }} />
                    )}
                  </div>
                )}

                {/* Position & Size */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>X Position (mm)</label>
                    <input type="number" value={selectedElement.x} onChange={(e) => updateElement(selectedElement.id, { x: parseFloat(e.target.value) || 0 })} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Y Position (mm)</label>
                    <input type="number" value={selectedElement.y} onChange={(e) => updateElement(selectedElement.id, { y: parseFloat(e.target.value) || 0 })} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem", boxSizing: "border-box" }} />
                  </div>
                </div>

                {"width" in selectedElement && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Width (mm)</label>
                      <input type="number" value={selectedElement.width} onChange={(e) => updateElement(selectedElement.id, { width: parseFloat(e.target.value) || 10 })} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem", boxSizing: "border-box" }} />
                    </div>
                    {"height" in selectedElement && (
                      <div>
                        <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Height (mm)</label>
                        <input type="number" value={selectedElement.height} onChange={(e) => updateElement(selectedElement.id, { height: parseFloat(e.target.value) || 5 })} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem", boxSizing: "border-box" }} />
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button type="button" onClick={() => handleCenterHorizontal(selectedElement.id)} style={{ flex: 1, padding: "9px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", background: "#F8FAFC", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>Center</button>
                  <button type="button" onClick={() => handleDuplicate(selectedElement.id)} style={{ flex: 1, padding: "9px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.12)", background: "#F8FAFC", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>Duplicate</button>
                  <button type="button" onClick={() => { handleDeleteElement(selectedElement.id); setShowPropertiesSheet(false); }} style={{ flex: 1, padding: "9px", borderRadius: "6px", border: "none", background: "#FEE2E2", color: "#DC2626", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE LAYERS BOTTOM DRAWER */}
      {isMobile && showLayersSheet && (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div onClick={() => setShowLayersSheet(false)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(3px)" }} />
          <div style={{ position: "relative", backgroundColor: "#FFFFFF", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", padding: "18px", maxHeight: "75vh", overflowY: "auto", boxShadow: "0 -10px 30px rgba(0,0,0,0.15)", zIndex: 10 }}>
            <div style={{ width: "36px", height: "4px", backgroundColor: "#CBD5E1", borderRadius: "2px", margin: "0 auto 14px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                Layers ({elements.length})
              </h3>
              <button type="button" onClick={() => setShowLayersSheet(false)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: "4px" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {elements.map((el) => {
                const isSel = el.id === selectedId;
                return (
                  <div
                    key={el.id}
                    onClick={() => { setSelectedId(el.id); setShowLayersSheet(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      backgroundColor: isSel ? "rgba(124, 58, 237, 0.08)" : "#F8FAFC",
                      border: isSel ? "1.5px solid #7C3AED" : "1px solid rgba(0,0,0,0.06)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", color: "#7C3AED", backgroundColor: "rgba(124,58,237,0.1)", padding: "2px 6px", borderRadius: "4px" }}>{el.type}</span>
                      <span style={{ fontSize: "0.82rem", color: "#0F172A", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {el.type === "text" ? el.content : el.type === "barcode" ? `Bar: ${el.content}` : el.type === "qrcode" ? `QR: ${el.content}` : el.type}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveLayer(el.id, "up"); }} style={{ border: "1px solid rgba(0,0,0,0.1)", background: "#FFFFFF", borderRadius: "4px", padding: "4px 8px", cursor: "pointer" }}>▲</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveLayer(el.id, "down"); }} style={{ border: "1px solid rgba(0,0,0,0.1)", background: "#FFFFFF", borderRadius: "4px", padding: "4px 8px", cursor: "pointer" }}>▼</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteElement(el.id); }} style={{ border: "1px solid rgba(239,68,68,0.2)", background: "#FEE2E2", color: "#DC2626", borderRadius: "4px", padding: "4px 8px", cursor: "pointer" }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2.5 NATIVE APPS DOWNLOAD MODAL */}
      {showAppsModal && (
        <div
          onClick={() => setShowAppsModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "24px",
              maxWidth: "680px",
              width: "100%",
              padding: "32px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setShowAppsModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "#F1F5F9",
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  backgroundColor: "rgba(124, 58, 237, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <Download size={26} color="#7C3AED" />
              </div>
              <h2 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
                Bravon Native Apps Suite
              </h2>
              <p style={{ fontSize: "0.88rem", color: "#64748B", margin: 0 }}>
                Install the native app for direct high-speed USB printing and wireless Bluetooth support.
              </p>
            </div>

            {/* Grid of Platforms */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
              {/* macOS */}
              <div
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "16px",
                  padding: "18px 16px",
                  backgroundColor: "#F8FAFC",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Apple size={20} color="#1D1D1F" />
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1D1D1F" }}>macOS</span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#64748B", margin: "0 0 12px", lineHeight: 1.4 }}>
                    Universal Binary for Apple Silicon (M1–M4) &amp; Intel. Direct USB plug &amp; play.
                  </p>
                </div>
                <a
                  href={config.macDownloadUrl || "/downloads/Bravon_Print_1.0.0_universal.dmg"}
                  download
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    backgroundColor: "#1D1D1F",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    padding: "9px 12px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <Download size={14} /> Download .dmg (12.8 MB)
                </a>
              </div>

              {/* Windows */}
              <div
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "16px",
                  padding: "18px 16px",
                  backgroundColor: "#F8FAFC",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Monitor size={20} color="#7C3AED" />
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1D1D1F" }}>Windows</span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#64748B", margin: "0 0 12px", lineHeight: 1.4 }}>
                    Windows 10 &amp; 11 (64-bit). High-speed USB direct driverless printing.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <a
                    href={config.windowsMsiUrl || "/downloads/Bravon_Print_1.0.0_x64_en-US.msi"}
                    download
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      backgroundColor: "#7C3AED",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                      padding: "9px 10px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    <Download size={13} /> .msi (10.4 MB)
                  </a>
                  <a
                    href={config.windowsExeUrl || "/downloads/Bravon_Print_1.0.0_x64_setup.exe"}
                    download
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: "8px",
                      padding: "9px 10px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    .exe
                  </a>
                </div>
              </div>
            </div>

            {/* Mobile Banner in Modal */}
            <div
              style={{
                backgroundColor: "var(--bg-apple, #F5F5F7)",
                borderRadius: "14px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Smartphone size={20} color="#7C3AED" />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem", color: "#1D1D1F" }}>
                    Bravon Mobile for iOS &amp; Android
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "#64748B" }}>
                    Bluetooth wireless label printing straight from your phone or tablet.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Link
                  href="/apps#mobile"
                  target="_blank"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#0F172A",
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Smartphone size={12} /> Mobile App
                </Link>
              </div>
            </div>

            <div style={{ textAlign: "center", paddingTop: "8px" }}>
              <Link
                href="/apps"
                target="_blank"
                style={{
                  fontSize: "0.85rem",
                  color: "#7C3AED",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                View full platform guide &amp; system requirements <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. TOAST NOTIFICATION CONTAINER */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#0F172A",
            color: "#FFFFFF",
            padding: "10px 18px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
            zIndex: 100,
          }}
        >
          <Check size={16} color="#22C55E" /> {toastMessage}
        </div>
      )}

      {/* 4. THERMAL PRINTER NATIVE CSS INJECTION FOR PRINTING */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          aside,
          header,
          button,
          .btn-print-hide {
            display: none !important;
          }
          #bravon-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: ${effectiveWidth}mm !important;
            height: ${effectiveHeight}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            transform: scale(1) !important;
            page-break-after: always !important;
          }
          @page {
            size: ${effectiveWidth}mm ${effectiveHeight}mm;
            margin: 0mm;
          }
        }
      `}</style>
    </div>
  );
}
