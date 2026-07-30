import { STORAGE_KEY } from './defaults';
import type { ThemeKey } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// FitAI Pro — Theme Utilities
// ═══════════════════════════════════════════════════════════════════════════════

export type ResolvedTheme = 'dark' | 'light';

/** Resolve `system` to an concrete light/dark value. */
export function resolveTheme(theme: ThemeKey): ResolvedTheme {
  if (typeof window === 'undefined') {
    return theme === 'light' ? 'light' : 'dark';
  }

  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return theme;
}

/** Apply the resolved theme class to `<html>`. */
export function applyTheme(theme: ThemeKey): ResolvedTheme {
  if (typeof document === 'undefined') {
    return theme === 'light' ? 'light' : 'dark';
  }

  const root = document.documentElement;
  root.classList.remove('dark', 'light');

  const resolved = resolveTheme(theme);
  root.classList.add(resolved);

  return resolved;
}

/**
 * Inline script injected in layout before paint to prevent theme flash.
 * Reads from `fitai_state` first, then legacy `fitai_theme`.
 */
export function getThemeInitScript(): string {
  return `(function(){try{var t='dark';var raw=localStorage.getItem('${STORAGE_KEY}');if(raw){var s=JSON.parse(raw);if(s&&s.theme)t=s.theme;}else{var l=localStorage.getItem('fitai_theme');if(l)t=l;}var r=t;if(t==='system'){r=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.add(r);}catch(e){document.documentElement.classList.add('dark');}})();`;
}
