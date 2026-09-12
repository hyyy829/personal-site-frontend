import { Button, Dropdown, Tooltip } from '@douyinfe/semi-ui';
import { IconLanguage } from '@douyinfe/semi-icons';
import { useLocaleStore } from '@/stores/locale';
import type { Language } from '@/utils/i18n';

/** 中英文切换入口 */
export default function LanguageToggle() {
  const { language, setLanguage } = useLocaleStore();

  const items: Language[] = ['zh-CN', 'en-US'];

  return (
    <Dropdown
      trigger="click"
      position="bottomRight"
      render={
        <Dropdown.Menu>
          {items.map((lang) => (
            <Dropdown.Item key={lang} active={language === lang} onClick={() => setLanguage(lang)}>
              {lang === 'zh-CN' ? '中文' : 'English'}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      }
    >
      <Tooltip content={language === 'zh-CN' ? '中文' : 'English'}>
        <Button theme="borderless" icon={<IconLanguage size="large" />} aria-label="language" />
      </Tooltip>
    </Dropdown>
  );
}
