import type { Dispatch } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// FitAI Pro — Global State Types
// ═══════════════════════════════════════════════════════════════════════════════

export type ThemeKey = 'dark' | 'light' | 'system';

export type FitnessGoalId = 'cut' | 'bulk' | 'maintain';

export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

// ── User ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  primaryGoal: FitnessGoalId;
  onboarded: boolean;
}

// ── Workouts ──────────────────────────────────────────────────────────────────

export interface ExerciseLog {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface WorkoutSession {
  id: string;
  name: string;
  type: string;
  completedAt: string;
  durationSeconds: number;
  setsCompleted: number;
  totalSets: number;
  caloriesBurned: number;
  muscleGroups: string[];
  exercises: ExerciseLog[];
}

export interface WorkoutState {
  history: WorkoutSession[];
  lastCompletedAt: string | null;
}

// ── Nutrition ─────────────────────────────────────────────────────────────────

export interface MealItem {
  id: string;
  type: string;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  logged: boolean;
  swapped: boolean;
}

export interface DailyNutrition {
  dayKey: DayKey;
  date: number;
  meals: MealItem[];
}

export interface MacroTotals {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface MacroTargets {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface NutritionState {
  activeDay: DayKey;
  days: DailyNutrition[];
  targets: MacroTargets;
}

// ── Recovery ──────────────────────────────────────────────────────────────────

export type MuscleFatigueMap = Record<string, number>;

export interface RecoveryState {
  neuralScore: number;
  muscleFatigue: MuscleFatigueMap;
  sleepMinutes: number;
}

// ── Dashboard aggregates ──────────────────────────────────────────────────────

export interface GoalState {
  id: string;
  title: string;
  current: number;
  target: number;
  color: string;
  metric: 'workouts' | 'calories' | 'weight';
}

export interface ChallengeState {
  id: string;
  title: string;
  current: number;
  target: number;
  daysLeft: number;
  totalDays: number;
  type: string;
}

export interface LiveStatsState {
  steps: number;
  activeMinutes: number;
  heartRate: number;
}

export interface NotificationState {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  dismissed: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface DashboardStats {
  workoutStreak: number;
  totalWorkouts: number;
  totalSetsCompleted: number;
  totalCaloriesBurned: number;
  waterGlasses: number;
  maxWaterGlasses: number;
  weeklyWorkoutGoal: number;
  weeklyWorkoutsCompleted: number;
  liveStats: LiveStatsState;
  goals: GoalState[];
  challenges: ChallengeState[];
  notifications: NotificationState[];
}

// ── Root state ────────────────────────────────────────────────────────────────

export interface AppState {
  version: 1;
  profile: UserProfile;
  theme: ThemeKey;
  workouts: WorkoutState;
  nutrition: NutritionState;
  recovery: RecoveryState;
  dashboard: DashboardStats;
}

// ── Actions (consumed by FitAIContext reducer) ────────────────────────────────

export type AppAction =
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'SET_THEME'; payload: ThemeKey }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | {
      type: 'COMPLETE_WORKOUT';
      payload: {
        name: string;
        type: string;
        durationSeconds: number;
        setsCompleted: number;
        totalSets: number;
        caloriesBurned: number;
        muscleGroups: string[];
        exercises: ExerciseLog[];
      };
    }
  | { type: 'SET_ACTIVE_DAY'; payload: DayKey }
  | { type: 'LOG_MEAL'; payload: { dayKey: DayKey; mealId: string; logged?: boolean } }
  | {
      type: 'UPDATE_MEAL';
      payload: { dayKey: DayKey; mealId: string; updates: Partial<MealItem> };
    }
  | {
      type: 'ADD_MEAL';
      payload: { dayKey: DayKey; meal: MealItem };
    }
  | { type: 'SET_WATER'; payload: number }
  | { type: 'ADD_WATER'; payload?: number }
  | { type: 'UPDATE_SLEEP'; payload: number }
  | { type: 'UPDATE_NOTIFICATIONS'; payload: NotificationState[] }
  | { type: 'UPDATE_GOALS'; payload: GoalState[] }
  | { type: 'RESET_STATE' };

// ── Context value ─────────────────────────────────────────────────────────────

export interface FitAIContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  hydrated: boolean;
}
