import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import zhCommon from '@/locales/zh-CN/common.json';
import zhMenu from '@/locales/zh-CN/menu.json';
import zhHome from '@/locales/zh-CN/home.json';
import zhAbout from '@/locales/zh-CN/about.json';
import zhBlog from '@/locales/zh-CN/blog.json';
import zhProject from '@/locales/zh-CN/project.json';
import zhTimeline from '@/locales/zh-CN/timeline.json';
import zhComment from '@/locales/zh-CN/comment.json';
import zhFriendlink from '@/locales/zh-CN/friendlink.json';
import zhGuestbook from '@/locales/zh-CN/guestbook.json';
import zhTools from '@/locales/zh-CN/tools.json';
import zhSearch from '@/locales/zh-CN/search.json';
import zhFile from '@/locales/zh-CN/file.json';
import zhLog from '@/locales/zh-CN/log.json';
import zhAdmin from '@/locales/zh-CN/admin.json';
import zhAuth from '@/locales/zh-CN/auth.json';
import enCommon from '@/locales/en-US/common.json';
import enMenu from '@/locales/en-US/menu.json';
import enHome from '@/locales/en-US/home.json';
import enAbout from '@/locales/en-US/about.json';
import enBlog from '@/locales/en-US/blog.json';
import enProject from '@/locales/en-US/project.json';
import enTimeline from '@/locales/en-US/timeline.json';
import enComment from '@/locales/en-US/comment.json';
import enFriendlink from '@/locales/en-US/friendlink.json';
import enGuestbook from '@/locales/en-US/guestbook.json';
import enTools from '@/locales/en-US/tools.json';
import enSearch from '@/locales/en-US/search.json';
import enFile from '@/locales/en-US/file.json';
import enLog from '@/locales/en-US/log.json';
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

/**
 * 语言包按模块拆分在 `locales/<lang>/<模块>.json`，代码中统一用完整的点分 key 引用，
 * 例如 `t('common.nav.home')`、`t('blog.title')`。
 *
 * 因此所有模块必须合并进同一个默认命名空间（translation），模块名作为一级节点；
 * 若各自注册为独立 namespace（common、blog...），`t('common.siteName')` 会因为
 * 默认 namespace 里找不到 `common` 而原样返回 key，页面上就会直接显示 `common.siteName`。
 */
const resources = {
  'zh-CN': {
    translation: {
      common: zhCommon,
      menu: zhMenu,
      home: zhHome,
      about: zhAbout,
      blog: zhBlog,
      project: zhProject,
      timeline: zhTimeline,
      comment: zhComment,
      friendlink: zhFriendlink,
      guestbook: zhGuestbook,
      tools: zhTools,
      search: zhSearch,
      file: zhFile,
      log: zhLog,
      admin: zhAdmin,
      auth: zhAuth,
    },
  },
  'en-US': {
    translation: {
      common: enCommon,
      menu: enMenu,
      home: enHome,
      about: enAbout,
      blog: enBlog,
      project: enProject,
      timeline: enTimeline,
      comment: enComment,
      friendlink: enFriendlink,
      guestbook: enGuestbook,
      tools: enTools,
      search: enSearch,
      file: enFile,
      log: enLog,
      admin: enAdmin,
      auth: enAuth,
    },
  },
};

i18next.use(initReactI18next).init({
  resources,
  ns: ['translation'],
  defaultNS: 'translation',
  lng: resolveInitialLanguage(),
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false },
});

export default i18next;
