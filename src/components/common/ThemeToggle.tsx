import { Button, Dropdown, Tooltip } from '@douyinfe/semi-ui';
import { IconMoon, IconSun } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/stores/theme';

/** 主题切换入口，状态统一由 themeStore 管理（CONSTRAINTS.md 8.1.3） */
export default function ThemeToggle() {
  const { t } = useTranslation();
  const { mode, resolved, setMode } = useThemeStore();

  const modes = ['light', 'dark', 'system'] as const;

  return (
    <Dropdown
      trigger="click"
      position="bottomRight"
      render={
        <Dropdown.Menu>
          {modes.map((value) => (
            <Dropdown.Item key={value} active={mode === value} onClick={() => setMode(value)}>
              {t(`common.theme.${value}`)}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      }
    >
      <Tooltip content={t(`common.theme.${mode}`)}>
        <Button
          theme="borderless"
          icon={resolved === 'dark' ? <IconMoon size="large" /> : <IconSun size="large" />}
          aria-label="theme"
        />
      </Tooltip>
    </Dropdown>
  );
}
