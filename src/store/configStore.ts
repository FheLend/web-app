import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { ContractConfig } from '@/types/contract';

interface ConfigState {
  configs: ContractConfig[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchConfigs: () => Promise<void>;
  initializeStore: () => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  configs: [],
  loading: false,
  error: null,
  initialized: false,
  initializeStore: () => {
    // Only set the initialization flag here, 
    // the actual fetch will happen in an effect, not during render
    if (!get().initialized) {
      set({ initialized: true });
    }
  },
  fetchConfigs: async () => {
    // Don't run if already loading
    if (get().loading) return;

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contract_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      set({ 
        configs: data || [], 
        loading: false
      });
    } catch (err) {
      console.error('Error fetching configs:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to load contract configurations', 
        loading: false 
      });
    }
  },
}));
