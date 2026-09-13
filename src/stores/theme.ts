import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_KEY = 'site-theme';

interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolve(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return systemPrefersDark() ? 'dark' : 'light';
  }
  return mode;
}

/**
 * 深浅色通过 <html theme-mode="dark"> 表达，作为 tokens.css 选择器与 Ant Design 算法的开关。
 * index.html 内联脚本会提前执行同样的逻辑，避免首屏闪白。
 */
function apply(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.setAttribute('theme-mode', 'dark');
  } else {
    root.removeAttribute('theme-mode');
  }
}

export const useThemeStore = create<ThemeState>((set) => {
  const stored = (localStorage.getItem(THEME_KEY) as ThemeMode) || 'system';
  const initialResolved = resolve(stored);
  apply(initialResolved);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { mode, resolved: current } = useThemeStore.getState();
    if (mode === 'system') {
      const next = resolve(mode);
      if (next !== current) {
        apply(next);
        set({ resolved: next });
      }
    }
  });

  return {
    mode: stored,
    resolved: initialResolved,
    setMode: (mode) => {
      const resolved = resolve(mode);
      apply(resolved);
      localStorage.setItem(THEME_KEY, mode);
      set({ mode, resolved });
    },
  };
});
