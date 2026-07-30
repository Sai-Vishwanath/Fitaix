'use client';

import { useState } from 'react';
import { RefreshCw, Check, Flame, Utensils, Sparkles, Plus } from 'lucide-react';
import { BottomNav }     from '../../components/ui/BottomNav';
import { WorkoutModal }  from '../../components/ui/WorkoutModal';
import { AddMealModal }  from '../../components/ui/AddMealModal';

import {
  useFitAIState,
  useFitAIDispatch,
  useFitAIHydrated,
  calculateLoggedMacroTotals,
  calculateMacroTotals,
} from '../../lib/FitAIContext';
import type { DayKey, MealItem } from '../../lib/types';
import { DAY_KEYS, DAY_DATES } from '../../lib/defaults';

// ═══════════════════════════════════════════════════════════════════════════════
// AI Swap alternatives (per meal type)
// ═══════════════════════════════════════════════════════════════════════════════

const SWAP_ALTERNATIVES: Record<string, { name: string; protein: number; carbs: number; fats: number; calories: number }> = {
  Breakfast: { name: 'Oatmeal & Protein Shake',   protein: 32, carbs: 20, fats: 10, calories: 410 },
  Lunch:     { name: 'Grilled Paneer Salad',       protein: 30, carbs: 18, fats: 12, calories: 390 },
  Dinner:    { name: 'Grilled Chicken & Veggies',  protein: 38, carbs: 22, fats: 8,  calories: 420 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Macro Progress Bar
// ═══════════════════════════════════════════════════════════════════════════════

function MacroBar({ label, logged, target, color }: { label: string; logged: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min((logged / target) * 100, 100) : 0;
  return (
    <div className="flex-1">
      <div className="flex justify-between text-[9.5px] font-bold mb-1">
        <span className="text-text-secondary">{label}</span>
        <span style={{ color }}>{logged}g</span>
      </div>
      <div className="h-1.5 bg-card-inset rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function NutritionPage() {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [swappingId,         setSwappingId]         = useState<string | null>(null);

  // Add-meal modal state
  const [addMealOpen,        setAddMealOpen]        = useState(false);
  const [addMealDefaultType, setAddMealDefaultType] = useState('Snack');

  const state    = useFitAIState();
  const dispatch = useFitAIDispatch();
  const hydrated = useFitAIHydrated();

  // ── Derived values ────────────────────────────────────────────────────────
  const activeDay  = hydrated ? state.nutrition.activeDay : 'Tue';
  const targets    = hydrated ? state.nutrition.targets   : { protein: 150, carbs: 220, fats: 65, calories: 2200 };

  const todaysDay  = hydrated ? state.nutrition.days.find(d => d.dayKey === activeDay) : undefined;
  const todayMeals = todaysDay?.meals ?? [];

  const loggedTotals = calculateLoggedMacroTotals(todayMeals);
  const allTotals    = calculateMacroTotals(todayMeals);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSelectDay = (dayKey: DayKey) => {
    dispatch({ type: 'SET_ACTIVE_DAY', payload: dayKey });
  };

  const handleLogMeal = (mealId: string, currentLogged: boolean) => {
    dispatch({ type: 'LOG_MEAL', payload: { dayKey: activeDay, mealId, logged: !currentLogged } });
  };

  const handleSwap = (mealId: string, mealType: string) => {
    setSwappingId(mealId);
    setTimeout(() => {
      const alt = SWAP_ALTERNATIVES[mealType] ?? SWAP_ALTERNATIVES.Lunch;
      dispatch({
        type: 'UPDATE_MEAL',
        payload: {
          dayKey:  activeDay,
          mealId,
          updates: { ...alt, swapped: true, logged: false },
        },
      });
      setSwappingId(null);
    }, 1200);
  };

  /** Opens the AddMealModal with a pre-set type */
  const openAddMeal = (type = 'Snack') => {
    setAddMealDefaultType(type);
    setAddMealOpen(true);
  };

  /** Called by AddMealModal when the user hits "Save Meal to Log" */
  const handleAddMealSave = (meal: Omit<MealItem, 'id' | 'logged' | 'swapped'>) => {
    const fullMeal: MealItem = {
      id:      generateId(),
      logged:  true,   // Newly added meals are immediately logged
      swapped: false,
      ...meal,
    };
    dispatch({ type: 'ADD_MEAL', payload: { dayKey: activeDay, meal: fullMeal } });
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center font-sans">
      <div className="relative w-full max-w-[390px] min-h-screen bg-background overflow-hidden">

        <div className="h-screen overflow-y-auto scrollbar-none px-5 pt-6 pb-28">

          {/* ── Page Header ── */}
          <div className="flex justify-between items-center mt-2.5 mb-6">
            <h1 className="text-[19px] font-extrabold text-text-primary">Meal Plan</h1>
            <div className="flex items-center gap-2">
              {/* "Add Meal" header button */}
              <button
                onClick={() => openAddMeal('Snack')}
                className="flex items-center gap-1.5 bg-brand-purple text-white text-[11.5px] font-bold px-3 py-1.5 rounded-xl shadow-brand-glow transition-transform active:scale-95 hover:scale-[1.03]"
              >
                <Plus size={13} /> Add Meal
              </button>
              <div className="w-8 h-8 rounded-full bg-brand-purple/15 flex items-center justify-center">
                <Sparkles size={16} className="text-brand-purple" />
              </div>
            </div>
          </div>

          {/* ── 1. Day Scroller — wired to global activeDay ── */}
          <div className="flex gap-3 overflow-x-auto scrollbar-none mb-6 pb-2">
            {DAY_KEYS.map((dayKey) => {
              const isActive = dayKey === activeDay;
              return (
                <button
                  key={dayKey}
                  onClick={() => handleSelectDay(dayKey)}
                  className={[
                    'flex flex-col items-center justify-center min-w-[60px] py-3 rounded-2xl transition-all',
                    isActive
                      ? 'bg-gradient-to-br from-brand-purple to-brand-pink text-white shadow-lg scale-105'
                      : 'bg-card border border-border text-text-secondary hover:border-brand-purple/40',
                  ].join(' ')}
                >
                  <span className="text-[11px] font-bold uppercase">{dayKey}</span>
                  <span className={`text-[16px] font-extrabold mt-1 ${isActive ? 'text-white' : 'text-text-primary'}`}>
                    {DAY_DATES[dayKey]}
                  </span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5" />}
                </button>
              );
            })}
          </div>

          {/* ── 2. Daily Macro Summary ── */}
          {hydrated && (
            <div className="bg-card border border-border rounded-3xl p-4 mb-5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[12.5px] font-bold text-text-primary">Daily Macros</p>
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-brand-purple">
                  <Flame size={12} />
                  <span>{loggedTotals.calories} / {targets.calories} kcal logged</span>
                </div>
              </div>
              <div className="flex gap-3">
                <MacroBar label="Protein" logged={loggedTotals.protein} target={targets.protein} color="#A3E635" />
                <MacroBar label="Carbs"   logged={loggedTotals.carbs}   target={targets.carbs}   color="#F5C400" />
                <MacroBar label="Fats"    logged={loggedTotals.fats}    target={targets.fats}    color="#F59E0B" />
              </div>
              <p className="text-[10px] text-text-secondary mt-3 text-right">
                Total planned: {allTotals.calories} kcal · {allTotals.protein}g protein
              </p>
            </div>
          )}

          {/* ── 3. Menu header + quick-add shortcut buttons ── */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Utensils size={16} className="text-status-amber" />
              <h2 className="text-[14px] font-bold text-text-primary">{activeDay}&apos;s Menu</h2>
            </div>
            {/* Quick-add chips for each meal type */}
            <div className="flex gap-1.5">
              {['Breakfast', 'Lunch', 'Dinner'].map(type => (
                <button
                  key={type}
                  onClick={() => openAddMeal(type)}
                  className="text-[9.5px] font-bold px-2.5 py-1 rounded-lg bg-card border border-border text-text-secondary hover:border-brand-purple/40 hover:text-brand-purple transition-colors"
                >
                  + {type.charAt(0)}
                </button>
              ))}
            </div>
          </div>

          {/* ── 4. Meal Cards — rendered from global nutrition state ── */}
          <div className="space-y-4">
            {todayMeals.length === 0 && hydrated ? (
              /* Empty state with CTA */
              <div className="text-center py-10 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-purple/10 flex items-center justify-center">
                  <Utensils size={24} className="text-brand-purple" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-text-primary mb-1">No meals yet for {activeDay}</p>
                  <p className="text-[11px] text-text-secondary">Use AI to log what you ate instantly.</p>
                </div>
                <button
                  onClick={() => openAddMeal('Breakfast')}
                  className="flex items-center gap-2 bg-gradient-to-r from-brand-purple to-brand-pink text-white text-[12.5px] font-bold px-5 py-3 rounded-2xl shadow-brand-glow transition-transform active:scale-95"
                >
                  <Sparkles size={15} /> Log First Meal
                </button>
              </div>
            ) : (
              todayMeals.map((meal) => (
                <div
                  key={meal.id}
                  className={`relative bg-card border ${
                    meal.logged
                      ? 'border-status-green/40 bg-status-green/5'
                      : meal.swapped
                      ? 'border-brand-purple/50 bg-brand-purple/5'
                      : 'border-border'
                  } rounded-3xl p-5 overflow-hidden transition-all duration-300`}
                >
                  {/* AI Swapped Badge */}
                  {meal.swapped && !meal.logged && (
                    <div className="absolute top-0 right-0 bg-brand-purple text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                      <Sparkles size={10} /> AI Swapped
                    </div>
                  )}
                  {/* Logged Badge */}
                  {meal.logged && (
                    <div className="absolute top-0 right-0 bg-status-green text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                      <Check size={10} /> Logged
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <div className="pr-14">
                      <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">{meal.type}</p>
                      <p className="text-[16px] font-extrabold text-text-primary">{meal.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-5 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-secondary bg-card-inset px-2.5 py-1 rounded-lg">
                      <Flame size={12} className="text-status-amber" />
                      {meal.calories} kcal
                    </div>
                    <p className="text-[11px] font-semibold text-text-secondary">
                      P={meal.protein}g · C={meal.carbs}g · F={meal.fats}g
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLogMeal(meal.id, meal.logged)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 transition-colors ${
                        meal.logged
                          ? 'bg-status-green/20 text-status-green border border-status-green/30 hover:bg-status-green/30'
                          : 'bg-status-green/15 text-status-green hover:bg-status-green/25'
                      }`}
                    >
                      <Check size={14} /> {meal.logged ? 'Logged ✓' : 'Log Meal'}
                    </button>

                    {!meal.logged && (
                      <button
                        onClick={() => handleSwap(meal.id, meal.type)}
                        disabled={swappingId === meal.id}
                        className="flex-1 py-2.5 border border-border bg-card-inset text-text-primary rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 transition-all hover:border-brand-purple hover:text-brand-purple disabled:opacity-50"
                      >
                        <RefreshCw size={14} className={swappingId === meal.id ? 'animate-spin' : ''} />
                        {swappingId === meal.id ? 'Thinking...' : 'Swap'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── 5. "Add another meal" FAB at the bottom of the list ── */}
          {todayMeals.length > 0 && (
            <button
              onClick={() => openAddMeal('Snack')}
              className="w-full mt-4 py-3.5 rounded-2xl border border-dashed border-brand-purple/40 text-brand-purple text-[12.5px] font-bold flex items-center justify-center gap-2 hover:bg-brand-purple/5 transition-colors"
            >
              <Plus size={15} /> Add Another Meal
            </button>
          )}

          <div className="h-4" aria-hidden="true" />
        </div>

        {/* ── Modals & Nav ── */}
        <BottomNav onAddClick={() => setIsWorkoutModalOpen(true)} />
        <WorkoutModal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} />

        {/* AI Meal Logger */}
        <AddMealModal
          isOpen={addMealOpen}
          defaultType={addMealDefaultType}
          onClose={() => setAddMealOpen(false)}
          onSave={handleAddMealSave}
        />

      </div>
    </div>
  );
}