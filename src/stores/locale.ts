import { create } from 'zustand';
import i18next, { resolveInitialLanguage, changeLanguage, type Language } from '@/utils/i18n';

interface LocaleState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  language: resolveInitialLanguage(),
  setLanguage: (language) => {
    changeLanguage(language);
    i18next.on('languageChanged', () => undefined);
    set({ language });
  },
}));
