import { Button, Dropdown, Tooltip } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLocaleStore } from '@/stores/locale';
import { SUPPORTED_LANGUAGES, type Language } from '@/utils/i18n';

/** 语言名称以该语言自身展示，不参与翻译 */
const LANGUAGE_LABEL: Record<Language, string> = {
  'zh-CN': '中文',
  'en-US': 'English',
};

/**
 * 中英文切换入口。
 * Dropdown 内部是 Tooltip、Tooltip 内部是 Button：rc-trigger 会把 onClick 逐层透传，
 * 且 Button 转发 ref，因此不会触发 React 18 StrictMode 的 findDOMNode 告警。
 */
export default function LanguageToggle() {
  const { language, setLanguage } = useLocaleStore();
  const label = LANGUAGE_LABEL[language];

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        items: SUPPORTED_LANGUAGES.map((lang) => ({ key: lang, label: LANGUAGE_LABEL[lang] })),
        selectable: true,
        selectedKeys: [language],
        onClick: ({ key }) => setLanguage(key as Language),
      }}
    >
      <Tooltip title={label}>
        <Button type="text" icon={<GlobalOutlined />} aria-label={label} />
      </Tooltip>
    </Dropdown>
  );
}
