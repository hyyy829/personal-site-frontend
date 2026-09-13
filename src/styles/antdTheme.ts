import { theme as antdTheme, type ThemeConfig } from 'antd';
import type { ResolvedTheme } from '@/stores/theme';

/**
 * 读取设计 Token（tokens.css 是颜色、字体、圆角的唯一出处），
 * 让 Ant Design 组件与站点视觉使用同一套值，避免主题两处维护。
 */
function readToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** 读取以 px 为单位的设计 Token，转换为 antd 需要的数值 */
function readPx(name: string, fallback: number): number {
  const parsed = Number.parseFloat(readToken(name, `${fallback}px`));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** 读取无单位的数值 Token（字号倍率等） */
function readNumber(name: string, fallback: number): number {
  const parsed = Number.parseFloat(readToken(name, String(fallback)));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** 构造 Ant Design 主题：算法按深浅色切换，token / components 全部对齐设计 Token */
export function buildAntdTheme(resolved: ResolvedTheme): ThemeConfig {
  const token = (name: string, fallback: string) => readToken(name, fallback);

  const accent = token('--site-color-accent', '#4c6ef5');
  const text = token('--site-color-text', '#17191e');
  const textSecondary = token('--site-color-text-secondary', '#555d6b');
  const textTertiary = token('--site-color-text-tertiary', '#868e9c');
  const bg = token('--site-color-bg', '#ffffff');
  const bgSecondary = token('--site-color-bg-secondary', '#f7f8fa');
  const bgElevated = token('--site-color-bg-elevated', '#ffffff');
  const bgHover = token('--site-color-bg-hover', '#f2f3f6');
  const border = token('--site-color-border', '#e7e9ee');
  const borderStrong = token('--site-color-border-strong', '#d6dae1');
  const accentSoft = token('--site-color-accent-soft', 'rgba(76, 110, 245, 0.09)');

  return {
    algorithm: resolved === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: accent,
      colorInfo: accent,
      colorLink: accent,
      colorSuccess: token('--site-color-success', '#2f9e44'),
      colorWarning: token('--site-color-warning', '#e8930c'),
      colorError: token('--site-color-danger', '#e03131'),

      colorText: text,
      colorTextSecondary: textSecondary,
      colorTextTertiary: textTertiary,
      colorTextQuaternary: textTertiary,
      colorTextDescription: textTertiary,

      colorBgBase: bg,
      colorBgContainer: bg,
      colorBgElevated: bgElevated,
      colorBgLayout: bgSecondary,
      colorFillAlter: bgHover,
      colorFillQuaternary: bgHover,

      colorBorder: borderStrong,
      colorBorderSecondary: border,
      colorSplit: border,

      borderRadius: readPx('--site-radius-sm', 6),
      borderRadiusLG: readPx('--site-radius-md', 10),
      borderRadiusSM: readPx('--site-radius-xs', 4),
      borderRadiusXS: readPx('--site-radius-xs', 4),

      fontFamily: token('--site-font-family', 'sans-serif'),
      fontSize: readPx('--site-font-size-md', 14),
      fontSizeSM: readPx('--site-font-size-sm', 13),
      fontSizeLG: readPx('--site-font-size-lg', 16),
      lineHeight: readNumber('--site-line-height-base', 1.6),

      controlHeight: readPx('--site-control-height', 34),
      controlHeightSM: readPx('--site-control-height-sm', 28),
      controlHeightLG: readPx('--site-control-height-lg', 40),

      wireframe: false,
      boxShadowSecondary: token('--site-shadow-md', '0 6px 20px rgba(16, 20, 32, 0.07)'),
    },
    components: {
      Menu: {
        itemBg: 'transparent',
        itemColor: textSecondary,
        itemHoverBg: bgHover,
        itemHoverColor: text,
        itemSelectedBg: accentSoft,
        itemSelectedColor: accent,
        itemHeight: 38,
        itemMarginBlock: 2,
        itemMarginInline: 8,
        itemBorderRadius: readPx('--site-radius-sm', 6),
        activeBarBorderWidth: 0,
        subMenuItemBg: 'transparent',
      },
      Table: {
        headerBg: bgSecondary,
        headerColor: textSecondary,
        headerSplitColor: 'transparent',
        borderColor: border,
        rowHoverBg: bgHover,
        cellPaddingBlock: 12,
        cellPaddingInline: 16,
        footerBg: bgSecondary,
      },
      Button: {
        fontWeight: 500,
        primaryShadow: 'none',
        defaultShadow: 'none',
        dangerShadow: 'none',
      },
      Typography: {
        titleMarginTop: 0,
        titleMarginBottom: 0,
      },
      Tabs: {
        horizontalItemGutter: 24,
        itemColor: textSecondary,
        itemSelectedColor: text,
        inkBarColor: accent,
      },
      Modal: {
        titleFontSize: readPx('--site-font-size-lg', 16),
        headerBg: bgElevated,
        contentBg: bgElevated,
      },
      Dropdown: {
        paddingBlock: 6,
      },
    },
  };
}
