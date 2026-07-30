'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';

import { createDefaultState, STORAGE_KEY } from './defaults';
import { loadState, parseStorageEventValue, saveState } from './storage';
import { applyTheme } from './theme';
import { getLocalISODateString, isSameCalendarDay, isYesterday } from './utils';
import type {
  AppAction,
  AppState,
  DayKey,
  FitAIContextValue,
  MacroTotals,
  MealItem,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// FitAI Pro — Pure Helpers (used by reducer + future selectors)
// ═══════════════════════════════════════════════════════════════════════════════

export function calculateMacroTotals(meals: MealItem[]): MacroTotals {
  return meals.reduce(
    (acc, meal) => ({
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
      calories: acc.calories + meal.calories,
    }),
    { protein: 0, carbs: 0, fats: 0, calories: 0 },
  );
}

export function calculateLoggedMacroTotals(meals: MealItem[]): MacroTotals {
  return calculateMacroTotals(meals.filter((m) => m.logged));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function countWorkoutsThisWeek(history: AppState['workouts']['history'], reference = new Date()): number {
  const startOfWeek = new Date(reference);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return history.filter((session) => {
    const completed = new Date(session.completedAt);
    return completed >= startOfWeek;
  }).length;
}

function updateMealsForDay(
  days: AppState['nutrition']['days'],
  dayKey: DayKey,
  updater: (meals: MealItem[]) => MealItem[],
): AppState['nutrition']['days'] {
  return days.map((day) =>
    day.dayKey === dayKey ? { ...day, meals: updater(day.meals) } : day,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Reducer
// ═══════════════════════════════════════════════════════════════════════════════

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'RESET_STATE':
      return createDefaultState();

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
      };

    case 'SET_WATER': {
      const glasses = clamp(action.payload, 0, state.dashboard.maxWaterGlasses);
      return {
        ...state,
        dashboard: { ...state.dashboard, waterGlasses: glasses },
      };
    }

    case 'ADD_WATER': {
      const increment = action.payload ?? 1;
      const glasses = clamp(
        state.dashboard.waterGlasses + increment,
        0,
        state.dashboard.maxWaterGlasses,
      );
      return {
        ...state,
        dashboard: { ...state.dashboard, waterGlasses: glasses },
      };
    }

    case 'SET_ACTIVE_DAY':
      return {
        ...state,
        nutrition: { ...state.nutrition, activeDay: action.payload },
      };

    case 'LOG_MEAL': {
      const { dayKey, mealId, logged = true } = action.payload;
      return {
        ...state,
        nutrition: {
          ...state.nutrition,
          days: updateMealsForDay(state.nutrition.days, dayKey, (meals) =>
            meals.map((meal) =>
              meal.id === mealId ? { ...meal, logged } : meal,
            ),
          ),
        },
      };
    }

    case 'UPDATE_MEAL': {
      const { dayKey, mealId, updates } = action.payload;
      return {
        ...state,
        nutrition: {
          ...state.nutrition,
          days: updateMealsForDay(state.nutrition.days, dayKey, (meals) =>
            meals.map((meal) =>
              meal.id === mealId ? { ...meal, ...updates } : meal,
            ),
          ),
        },
      };
    }

    case 'ADD_MEAL': {
      const { dayKey, meal } = action.payload;
      return {
        ...state,
        nutrition: {
          ...state.nutrition,
          days: updateMealsForDay(state.nutrition.days, dayKey, (meals) => [
            ...meals,
            meal,
          ]),
        },
      };
    }

    case 'UPDATE_SLEEP': {
      return {
        ...state,
        recovery: {
          ...state.recovery,
          sleepMinutes: clamp(action.payload, 0, 1440),
        },
      };
    }

    case 'UPDATE_NOTIFICATIONS': {
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          notifications: action.payload,
        }
      };
    }

    case 'UPDATE_GOALS': {
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          goals: action.payload,
        }
      };
    }


    case 'COMPLETE_WORKOUT': {
      const now = new Date();
      // Use standard ISO string for sorting, but local comparisons for streak
      const completedAt = now.toISOString();
      const payload = action.payload;

      const session = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: payload.name,
        type: payload.type,
        completedAt,
        durationSeconds: payload.durationSeconds,
        setsCompleted: payload.setsCompleted,
        totalSets: payload.totalSets,
        caloriesBurned: payload.caloriesBurned,
        muscleGroups: payload.muscleGroups,
        exercises: payload.exercises,
      };

      const history = [session, ...state.workouts.history];

      const lastDate = state.workouts.lastCompletedAt
        ? new Date(state.workouts.lastCompletedAt)
        : null;

      let nextStreak = state.dashboard.workoutStreak;

      if (!lastDate) {
        nextStreak = 1;
      } else if (isSameCalendarDay(lastDate, now)) {
        nextStreak = state.dashboard.workoutStreak;
      } else if (isYesterday(lastDate, now)) {
        nextStreak = state.dashboard.workoutStreak + 1;
      } else {
        nextStreak = 1;
      }

      const weeklyWorkoutsCompleted = countWorkoutsThisWeek(history, now);

      const muscleFatigue = { ...state.recovery.muscleFatigue };
      for (const muscle of payload.muscleGroups) {
        const current = muscleFatigue[muscle] ?? 20;
        muscleFatigue[muscle] = clamp(current + 18, 0, 100);
      }

      const neuralPenalty = Math.min(15, payload.muscleGroups.length * 4);
      const neuralScore = clamp(state.recovery.neuralScore - neuralPenalty, 25, 100);

      return {
        ...state,
        workouts: {
          history,
          lastCompletedAt: completedAt,
        },
        dashboard: {
          ...state.dashboard,
          workoutStreak: nextStreak,
          totalWorkouts: state.dashboard.totalWorkouts + 1,
          totalSetsCompleted: state.dashboard.totalSetsCompleted + payload.setsCompleted,
          totalCaloriesBurned: state.dashboard.totalCaloriesBurned + payload.caloriesBurned,
          weeklyWorkoutsCompleted,
          liveStats: {
            ...state.dashboard.liveStats,
            activeMinutes: state.dashboard.liveStats.activeMinutes + Math.ceil(payload.durationSeconds / 60),
          }
        },
        recovery: {
          neuralScore,
          muscleFatigue,
          sleepMinutes: state.recovery.sleepMinutes,
        },
      };
    }

    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Context
// ═══════════════════════════════════════════════════════════════════════════════

const FitAIContext = createContext<FitAIContextValue | null>(null);

export function FitAIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, createDefaultState());
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount and set today's active day
  useEffect(() => {
    const persisted = loadState();
    if (persisted) {
      dispatch({ type: 'HYDRATE', payload: persisted });
    }
    
    // Automatically set activeDay to the user's real local day to avoid hydration/timezone mismatches
    const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as DayKey[];
    const todayKey = DAY_ABBR[new Date().getDay()];
    dispatch({ type: 'SET_ACTIVE_DAY', payload: todayKey });
    
    setHydrated(true);
  }, []);

  // Persist whenever state changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  // Apply theme class to <html> whenever theme changes
  useEffect(() => {
    if (!hydrated) return;
    applyTheme(state.theme);
  }, [state.theme, hydrated]);

  // Listen for system theme changes when theme === 'system'
  useEffect(() => {
    if (!hydrated || state.theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');

    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [state.theme, hydrated]);

  // Cross-tab synchronization via storage events
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = parseStorageEventValue(event.newValue);
      if (next) {
        dispatch({ type: 'HYDRATE', payload: next });
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<FitAIContextValue>(
    () => ({ state, dispatch, hydrated }),
    [state, hydrated],
  );

  return (
    <FitAIContext.Provider value={value}>
      {children}
    </FitAIContext.Provider>
  );
}

export function useFitAI(): FitAIContextValue {
  const context = useContext(FitAIContext);
  if (!context) {
    throw new Error('useFitAI must be used within a FitAIProvider');
  }
  return context;
}

/** Convenience hook — returns state only. */
export function useFitAIState(): AppState {
  return useFitAI().state;
}

/** Convenience hook — returns dispatch only. */
export function useFitAIDispatch(): React.Dispatch<AppAction> {
  return useFitAI().dispatch;
}

/** Returns true once localStorage hydration is complete. */
export function useFitAIHydrated(): boolean {
  return useFitAI().hydrated;
}

/** Theme setter helper for Profile page (Phase 3). */
export function useThemeActions() {
  const { state, dispatch } = useFitAI();

  const setTheme = useCallback(
    (theme: AppState['theme']) => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },
    [dispatch],
  );

  return { theme: state.theme, setTheme };
}

export default FitAIProvider;
