import { Button, Dropdown, Tooltip } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useThemeStore, type ThemeMode } from '@/stores/theme';

const MODES: ThemeMode[] = ['light', 'dark', 'system'];

/** 主题切换入口，状态统一由 themeStore 管理（CONSTRAINTS.md 8.1.3） */
export default function ThemeToggle() {
  const { t } = useTranslation();
  const { mode, resolved, setMode } = useThemeStore();
  const label = t(`common.theme.${mode}`);

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        items: MODES.map((value) => ({ key: value, label: t(`common.theme.${value}`) })),
        selectable: true,
        selectedKeys: [mode],
        onClick: ({ key }) => setMode(key as ThemeMode),
      }}
    >
      <Tooltip title={label}>
        <Button type="text" icon={resolved === 'dark' ? <MoonOutlined /> : <SunOutlined />} aria-label={label} />
      </Tooltip>
    </Dropdown>
  );
}
