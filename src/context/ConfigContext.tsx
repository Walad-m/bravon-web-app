"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { DEFAULT_SITE_CONFIG, SiteConfig } from "@/lib/siteConfig";

interface ConfigContextValue {
  config: SiteConfig;
  loading: boolean;
  refreshConfig: () => Promise<void>;
  updateConfig: (newConfig: Partial<SiteConfig>) => Promise<boolean>;
}

const ConfigContext = createContext<ConfigContextValue>({
  config: DEFAULT_SITE_CONFIG,
  loading: false,
  refreshConfig: async () => {},
  updateConfig: async () => false,
});

export function ConfigProvider({
  children,
  initialConfig,
}: {
  children: React.ReactNode;
  initialConfig?: SiteConfig;
}) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig || DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(!initialConfig);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`/api/config?_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (err) {
      console.warn("Using default site config fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();

    // Auto-refresh when tab receives focus or becomes visible
    const handleVisibilityOrFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchConfig();
      }
    };

    // Auto-refresh across tabs when admin saves changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "bravon_config_updated") {
        fetchConfig();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updateConfig = async (newConfig: Partial<SiteConfig>): Promise<boolean> => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        try {
          localStorage.setItem("bravon_config_updated", Date.now().toString());
        } catch {}
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update config:", err);
      return false;
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        loading,
        refreshConfig: fetchConfig,
        updateConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(ConfigContext);
}
