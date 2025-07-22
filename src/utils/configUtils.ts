import { useConfigStore } from '@/store/configStore';

/**
 * Utility function to get contract configs directly from the store
 * without using React hooks. Useful for non-component code.
 */
export const getContractConfigs = () => {
  const store = useConfigStore.getState();
  
  // Mark as initialized but don't trigger fetch during render
  if (!store.initialized) {
    store.initializeStore();
    
    // Schedule a fetch for later
    setTimeout(() => {
      const currentStore = useConfigStore.getState();
      if (currentStore.configs.length === 0 && !currentStore.loading) {
        currentStore.fetchConfigs();
      }
    }, 0);
  }
  
  return store.configs;
};

/**
 * Get a specific contract config by id
 */
export const getContractConfigById = (id: string) => {
  const configs = getContractConfigs();
  return configs.find(config => config.id === id);
};

/**
 * Get active contract configs
 */
export const getActiveContractConfigs = () => {
  const configs = getContractConfigs();
  return configs.filter(config => config.active);
};
