import { create } from 'zustand';

import { type BootstrapResponse, getBootstrap } from '../api/bootstrap';
import { setupLanguage } from '../i18n/language';

interface BootstrapStore {
  config: BootstrapResponse | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: boolean;
  initialize: () => Promise<void>;
}

export const useBootstrapStore = create<BootstrapStore>((set) => ({
  config: null,
  isLoading: true,
  isInitialized: false,
  error: false,

  initialize: async () => {
    set({
      isLoading: true,
      error: false,
    });

    try {
      const config = await getBootstrap();
      await setupLanguage(config.i18n);

      set({
        config,
        isLoading: false,
        isInitialized: true,
        error: false,
      });
    } catch (error) {
      console.error('Failed to initialize application:', error);

      set({
        config: null,
        isLoading: false,
        isInitialized: false,
        error: true,
      });
    }
  },
}));
