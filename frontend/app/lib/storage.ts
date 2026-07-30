import {
  createDefaultState,
  mergeWithDefaults,
  STORAGE_KEY,
  STATE_VERSION,
} from './defaults';
import type { AppState, ThemeKey } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// FitAI Pro — localStorage Persistence
// ═══════════════════════════════════════════════════════════════════════════════

const LEGACY_KEYS = {
  userName: 'userName',
  onboarded: 'fitai_onboarded',
  theme: 'fitai_theme',
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isValidAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as AppState;
  return (
    candidate.version === STATE_VERSION &&
    typeof candidate.profile === 'object' &&
    typeof candidate.theme === 'string'
  );
}

/** Read legacy localStorage keys written before the global state blob existed. */
export function migrateLegacyStorage(): Partial<AppState> | null {
  if (!isBrowser()) return null;

  const legacyName = localStorage.getItem(LEGACY_KEYS.userName);
  const legacyOnboarded = localStorage.getItem(LEGACY_KEYS.onboarded);
  const legacyTheme = localStorage.getItem(LEGACY_KEYS.theme) as ThemeKey | null;

  const hasLegacy =
    legacyName !== null || legacyOnboarded !== null || legacyTheme !== null;

  if (!hasLegacy) return null;

  const partial: Partial<AppState> = {};

  if (legacyName || legacyOnboarded) {
    partial.profile = {
      ...createDefaultState().profile,
      ...(legacyName ? { name: legacyName } : {}),
      ...(legacyOnboarded !== null ? { onboarded: legacyOnboarded === 'true' } : {}),
    };
  }

  if (legacyTheme === 'dark' || legacyTheme === 'light' || legacyTheme === 'system') {
    partial.theme = legacyTheme;
  }

  return partial;
}

/** Load persisted state from localStorage, merging with defaults. */
export function loadState(): AppState | null {
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidAppState(parsed)) {
        return mergeWithDefaults(parsed);
      }
    }

    const legacy = migrateLegacyStorage();
    if (legacy) {
      const merged = mergeWithDefaults(legacy);
      saveState(merged);
      return merged;
    }
  } catch (error) {
    console.error('[FitAI] Failed to load state from localStorage:', error);
  }

  return null;
}

/** Persist the full application state to localStorage. */
export function saveState(state: AppState): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Keep legacy keys in sync so older code paths still work during Phase 3 migration.
    localStorage.setItem(LEGACY_KEYS.userName, state.profile.name);
    localStorage.setItem(LEGACY_KEYS.onboarded, String(state.profile.onboarded));
    localStorage.setItem(LEGACY_KEYS.theme, state.theme);
  } catch (error) {
    console.error('[FitAI] Failed to save state to localStorage:', error);
  }
}

/** Parse a storage event payload (cross-tab sync). */
export function parseStorageEventValue(raw: string | null): AppState | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isValidAppState(parsed)) {
      return mergeWithDefaults(parsed);
    }
  } catch (error) {
    console.error('[FitAI] Failed to parse storage event:', error);
  }

  return null;
}

export function clearPersistedState(): void {
  if (!isBrowser()) return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_KEYS.userName);
  localStorage.removeItem(LEGACY_KEYS.onboarded);
  localStorage.removeItem(LEGACY_KEYS.theme);
}
