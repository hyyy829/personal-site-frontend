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

function apply(resolved: ResolvedTheme): void {
  if (resolved === 'dark') {
    document.body.setAttribute('theme-mode', 'dark');
  } else {
    document.body.removeAttribute('theme-mode');
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
