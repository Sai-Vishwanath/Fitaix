import type {
  AppState,
  DailyNutrition,
  DayKey,
  MealItem,
  MuscleFatigueMap,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// FitAI Pro — Default / Seed State
// ═══════════════════════════════════════════════════════════════════════════════

export const STORAGE_KEY = 'fitai_state' as const;
export const STATE_VERSION = 1 as const;

export const DAY_KEYS: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DAY_DATES: Record<DayKey, number> = {
  Mon: 16,
  Tue: 17,
  Wed: 18,
  Thu: 19,
  Fri: 20,
  Sat: 21,
  Sun: 22,
};

function createMeal(
  id: string,
  type: string,
  name: string,
  protein: number,
  carbs: number,
  fats: number,
  calories: number,
  overrides: Partial<MealItem> = {},
): MealItem {
  return {
    id,
    type,
    name,
    protein,
    carbs,
    fats,
    calories,
    logged: false,
    swapped: false,
    ...overrides,
  };
}

/** Base meal plan used as the template for each day (Phase 3 will vary per day). */
function createDefaultMealsForDay(dayKey: DayKey): MealItem[] {
  const prefix = dayKey.toLowerCase();

  if (dayKey === 'Sat' || dayKey === 'Sun') {
    return [
      createMeal(`${prefix}-breakfast`, 'Breakfast', 'Greek Yogurt & Berries', 22, 28, 8, 290),
      createMeal(`${prefix}-lunch`, 'Lunch', 'Grilled Chicken Wrap', 35, 38, 12, 460),
      createMeal(`${prefix}-dinner`, 'Dinner', 'Salmon & Quinoa Bowl', 32, 42, 14, 520),
    ];
  }

  return [
    createMeal(`${prefix}-breakfast`, 'Breakfast', 'Scrambled Eggs & Toast', 15, 24, 12, 320),
    createMeal(`${prefix}-lunch`, 'Lunch', 'Chicken Fried Rice', 28, 45, 14, 510),
    createMeal(`${prefix}-dinner`, 'Dinner', 'Roti & Dal Makhani', 18, 52, 16, 480),
  ];
}

export function createDefaultNutritionDays(): DailyNutrition[] {
  return DAY_KEYS.map((dayKey) => ({
    dayKey,
    date: DAY_DATES[dayKey],
    meals: createDefaultMealsForDay(dayKey),
  }));
}

export const DEFAULT_MUSCLE_FATIGUE: MuscleFatigueMap = {
  Chest: 25,
  Triceps: 30,
  'Front Delts': 35,
  Lats: 20,
  Hamstrings: 55,
  Biceps: 22,
  Quads: 48,
  Glutes: 40,
  Calves: 30,
  Core: 28,
};

export const DEFAULT_MACRO_TARGETS = {
  protein: 150,
  carbs: 220,
  fats: 65,
  calories: 2200,
} as const;

export function createDefaultState(): AppState {
  return {
    version: STATE_VERSION,
    profile: {
      name: 'Priyanshi',
      age: 21,
      weight: 65,
      height: 165,
      primaryGoal: 'bulk',
      onboarded: false,
    },
    theme: 'dark',
    workouts: {
      history: [],
      lastCompletedAt: null,
    },
    nutrition: {
      activeDay: 'Tue',
      days: createDefaultNutritionDays(),
      targets: { ...DEFAULT_MACRO_TARGETS },
    },
    recovery: {
      neuralScore: 89,
      muscleFatigue: { ...DEFAULT_MUSCLE_FATIGUE },
      sleepMinutes: 465,
    },
    dashboard: {
      workoutStreak: 24,
      totalWorkouts: 28,
      totalSetsCompleted: 0,
      totalCaloriesBurned: 0,
      waterGlasses: 4.5,
      maxWaterGlasses: 7,
      weeklyWorkoutGoal: 4,
      weeklyWorkoutsCompleted: 3,
      liveStats: { steps: 6240, activeMinutes: 42, heartRate: 78 },
      goals: [
        { id: 'g1', title: 'Lose 5kg', current: 64, target: 100, color: '#A855F7', metric: 'weight' },
        { id: 'g2', title: 'Burn 3000 kcal', current: 0, target: 3000, color: '#3B82F6', metric: 'calories' },
        { id: 'g3', title: '4 Workouts', current: 0, target: 4, color: '#06B6D4', metric: 'workouts' }
      ],
      challenges: [
        { id: 'c1', title: '30 Workouts in 30 Days', current: 22, target: 30, daysLeft: 8, totalDays: 30, type: 'workout' },
        { id: 'c2', title: 'Hydration Streak', current: 9, target: 10, daysLeft: 1, totalDays: 10, type: 'water' }
      ],
      notifications: [
        { id: 'n1', title: 'Your recovery improved 6%', body: 'Great sleep last night helped a lot', time: '2h', unread: true, dismissed: false, icon: 'Sparkles', iconBg: 'bg-brand-purple/15', iconColor: 'text-brand-purple' },
        { id: 'n2', title: 'Arjun passed your weekly score', body: 'Push a bit harder to reclaim #1', time: '5h', unread: true, dismissed: false, icon: 'Trophy', iconBg: 'bg-brand-pink/15', iconColor: 'text-brand-pink' },
        { id: 'n3', title: 'Hydration goal hit 3 days straight', body: 'Keep the streak going today', time: '1d', unread: false, dismissed: false, icon: 'Droplets', iconBg: 'bg-status-green/15', iconColor: 'text-status-green' }
      ]
    },
  };
}

/** Deep-merge persisted partial state onto defaults (handles schema additions). */
export function mergeWithDefaults(partial: Partial<AppState>): AppState {
  const base = createDefaultState();

  return {
    version: STATE_VERSION,
    profile: { ...base.profile, ...partial.profile },
    theme: partial.theme ?? base.theme,
    workouts: {
      history: partial.workouts?.history ?? base.workouts.history,
      lastCompletedAt: partial.workouts?.lastCompletedAt ?? base.workouts.lastCompletedAt,
    },
    nutrition: {
      activeDay: partial.nutrition?.activeDay ?? base.nutrition.activeDay,
      days: partial.nutrition?.days ?? base.nutrition.days,
      targets: { ...base.nutrition.targets, ...partial.nutrition?.targets },
    },
    recovery: {
      neuralScore: partial.recovery?.neuralScore ?? base.recovery.neuralScore,
      muscleFatigue: {
        ...base.recovery.muscleFatigue,
        ...partial.recovery?.muscleFatigue,
      },
      sleepMinutes: partial.recovery?.sleepMinutes ?? base.recovery.sleepMinutes,
    },
    dashboard: { 
      ...base.dashboard, 
      ...partial.dashboard,
      liveStats: partial.dashboard?.liveStats ?? base.dashboard.liveStats,
      goals: partial.dashboard?.goals ?? base.dashboard.goals,
      challenges: partial.dashboard?.challenges ?? base.dashboard.challenges,
      notifications: partial.dashboard?.notifications ?? base.dashboard.notifications,
    },
  };
}
