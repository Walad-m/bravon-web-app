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

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config", { cache: "no-store" });
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
