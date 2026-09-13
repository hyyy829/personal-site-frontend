import { create } from 'zustand';
import { changeLanguage, resolveInitialLanguage, type Language } from '@/utils/i18n';

interface LocaleState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  language: resolveInitialLanguage(),
  setLanguage: (language) => {
    changeLanguage(language);
    set({ language });
  },
}));
