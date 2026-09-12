import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** 页面标题统一拼接站点名，并跟随语言切换 */
export function useDocumentTitle(titleKey?: string): void {
  const { t } = useTranslation();
  useEffect(() => {
    const siteName = t('common.siteName');
    document.title = titleKey ? `${t(titleKey)} · ${siteName}` : siteName;
  }, [t, titleKey]);
}
