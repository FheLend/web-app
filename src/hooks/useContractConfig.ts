import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContractConfig } from "@/types/contract";

// Global state to ensure we only fetch once across the application
let isInitialized = false;
let cachedConfigs: ContractConfig[] = [];
let loading = false;

/**
 * Hook to initialize and access contract configurations
 * It ensures configs are loaded only once during app initialization
 */
export const useContractConfig = () => {
  const [configs, setConfigs] = useState<ContractConfig[]>(cachedConfigs);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    // Prevent concurrent fetches
    if (loading) return;

    loading = true;
    setError(null);

    try {
      const { data, error } = await supabase
        .from("contract_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Update both the state and the cache
      cachedConfigs = data || [];
      setConfigs(cachedConfigs);
      // Mark as initialized after successful fetch
      isInitialized = true;
    } catch (err) {
      console.error("Error fetching configs:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load contract configurations"
      );
    } finally {
      loading = false;
    }
  }, []);

  // Fetch configs only once during component lifecycle
  useEffect(() => {
    if (!isInitialized) {
      fetchConfigs();
    }
  }, [fetchConfigs]);

  return {
    configs,
    error,
    refetch: fetchConfigs,
    loading,
  };
};

// Utility functions that use the cache directly

/**
 * Get all contract configs
 */
export const getContractConfigs = (): ContractConfig[] => {
  return cachedConfigs;
};

/**
 * Get a specific contract config by id
 */
export const getContractConfigById = (
  id: string
): ContractConfig | undefined => {
  return cachedConfigs.find((config) => config.id === id);
};

/**
 * Get active contract configs
 */
export const getActiveContractConfigs = (): ContractConfig[] => {
  return cachedConfigs.filter((config) => config.active);
};
