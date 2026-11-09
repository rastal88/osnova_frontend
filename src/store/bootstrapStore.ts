import { create } from 'zustand';

import { type BootstrapResponse, getBootstrap } from '../api/bootstrap';
import i18n from '../i18n';
import { localizedPath, setupLanguage, stripLanguage } from '../i18n/language';

interface BootstrapStore {
  config: BootstrapResponse | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: boolean;
  initialize: () => Promise<void>;
  /** Re-reads /bootstrap in place, e.g. after the site settings change in the admin */
  refresh: () => Promise<void>;
}

export const useBootstrapStore = create<BootstrapStore>((set, get) => ({
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

  refresh: async () => {
    const config = await getBootstrap();
    const codes = config.i18n.languages.map((language) => language.code);
    if (!codes.includes(i18n.language)) {
      // The current language was turned off: open the same page in the default one
      const oldCodes = get().config?.i18n.languages.map((language) => language.code) ?? [];
      const path = stripLanguage(window.location.pathname, oldCodes);
      window.location.assign(localizedPath(path, config.i18n.default));
      return;
    }
    // Capabilities change only with a restart; keeping the same object keeps the router
    const features = get().config?.features ?? config.features;
    set({ config: { ...config, features } });
  },
}));
