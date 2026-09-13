import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import zhCommon from '@/locales/zh-CN/common.json';
import zhMenu from '@/locales/zh-CN/menu.json';
import zhHome from '@/locales/zh-CN/home.json';
import zhAbout from '@/locales/zh-CN/about.json';
import zhBlog from '@/locales/zh-CN/blog.json';
import zhProject from '@/locales/zh-CN/project.json';
import zhAdmin from '@/locales/zh-CN/admin.json';
import zhAuth from '@/locales/zh-CN/auth.json';
import enCommon from '@/locales/en-US/common.json';
import enMenu from '@/locales/en-US/menu.json';
import enHome from '@/locales/en-US/home.json';
import enAbout from '@/locales/en-US/about.json';
import enBlog from '@/locales/en-US/blog.json';
import enProject from '@/locales/en-US/project.json';
import enAdmin from '@/locales/en-US/admin.json';
import enAuth from '@/locales/en-US/auth.json';

export const SUPPORTED_LANGUAGES = ['zh-CN', 'en-US'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_KEY = 'site-language';

export function resolveInitialLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
    return stored as Language;
  }
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
}

export function changeLanguage(language: Language): void {
  localStorage.setItem(LANGUAGE_KEY, language);
  void i18next.changeLanguage(language);
}

i18next.use(initReactI18next).init({
  resources: {
    'zh-CN': {
      common: zhCommon,
      menu: zhMenu,
      home: zhHome,
      about: zhAbout,
      blog: zhBlog,
      project: zhProject,
      admin: zhAdmin,
      auth: zhAuth,
    },
    'en-US': {
      common: enCommon,
      menu: enMenu,
      home: enHome,
      about: enAbout,
      blog: enBlog,
      project: enProject,
      admin: enAdmin,
      auth: enAuth,
    },
  },
  lng: resolveInitialLanguage(),
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false },
});

export default i18next;
