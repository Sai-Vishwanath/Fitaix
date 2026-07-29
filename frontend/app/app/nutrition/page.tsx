'use client';

import { useState } from 'react';
import { RefreshCw, Check, Flame, Utensils, Sparkles } from 'lucide-react';
import { BottomNav } from '../../components/ui/BottomNav'; // Adjust path if needed
import { WorkoutModal } from '../../components/ui/WorkoutModal'; // Adjust path if needed

// ─── Mock Data based on Whiteboard ───────────────────────────────────────────

const DAYS = [
  { key: 'Mon', date: 16, active: false },
  { key: 'Tue', date: 17, active: true  }, // Tuesday is active in the sketch
  { key: 'Wed', date: 18, active: false },
  { key: 'Thu', date: 19, active: false },
  { key: 'Fri', date: 20, active: false },
];

const INITIAL_MEALS = [
  {
    id: 'breakfast',
    type: 'Breakfast',
    name: 'Scrambled Eggs & Toast',
    macros: 'P=15g • C=24g • F=12g',
    cals: 320,
    swapped: false,
  },
  {
    id: 'lunch',
    type: 'Lunch',
    name: 'Chicken Fried Rice',
    macros: 'P=28g • C=45g • F=14g',
    cals: 510,
    swapped: false,
  },
  {
    id: 'dinner',
    type: 'Dinner',
    name: 'Roti & Dal Makhani',
    macros: 'P=18g • C=52g • F=16g',
    cals: 480,
    swapped: false,
  },
];

export default function NutritionPage() {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [meals, setMeals] = useState(INITIAL_MEALS);
  const [isSwapping, setIsSwapping] = useState<string | null>(null);

  // ─── AI Swap Simulator ─────────────────────────────────────────────────────
  const handleSwap = (id: string) => {
    setIsSwapping(id);
    
    // Simulate AI thinking time
    setTimeout(() => {
      setMeals(prev => prev.map(meal => {
        if (meal.id === id) {
          // Provide an AI alternative
          return {
            ...meal,
            name: meal.type === 'Breakfast' ? 'Oatmeal & Protein Shake' : 
                  meal.type === 'Lunch' ? 'Grilled Paneer Salad' : 'Grilled Chicken & Veggies',
            macros: 'P=32g • C=20g • F=10g',
            cals: 410,
            swapped: true,
          };
        }
        return meal;
      }));
      setIsSwapping(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center font-sans">
      <div className="relative w-full max-w-[390px] min-h-screen bg-background overflow-hidden">
        
        <div className="h-screen overflow-y-auto scrollbar-none px-5 pt-6 pb-28">
          
          <div className="flex justify-between items-center mt-2.5 mb-6">
            <h1 className="text-[19px] font-extrabold text-text-primary">
              Meal Plan
            </h1>
            <div className="w-8 h-8 rounded-full bg-brand-purple/15 flex items-center justify-center">
              <Sparkles size={16} className="text-brand-purple" />
            </div>
          </div>

          {/* ── 1. Horizontal Day Scroller ── */}
          <div className="flex gap-3 overflow-x-auto scrollbar-none mb-6 pb-2">
            {DAYS.map((day) => (
              <button
                key={day.key}
                className={[
                  'flex flex-col items-center justify-center min-w-[60px] py-3 rounded-2xl transition-all',
                  day.active 
                    ? 'bg-gradient-to-br from-brand-purple to-brand-pink text-white shadow-lg' 
                    : 'bg-card border border-border text-text-secondary'
                ].join(' ')}
              >
                <span className="text-[11px] font-bold uppercase">{day.key}</span>
                <span className={`text-[16px] font-extrabold mt-1 ${day.active ? 'text-white' : 'text-text-primary'}`}>
                  {day.date}
                </span>
                {day.active && <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Utensils size={16} className="text-status-amber" />
            <h2 className="text-[14px] font-bold text-text-primary">Today's Menu</h2>
          </div>

          {/* ── 2. Vertical Meal Cards ── */}
          <div className="space-y-4">
            {meals.map((meal) => (
              <div 
                key={meal.id} 
                className={`relative bg-card border ${meal.swapped ? 'border-brand-purple/50 bg-brand-purple/5' : 'border-border'} rounded-3xl p-5 overflow-hidden transition-all duration-300`}
              >
                {/* AI Swapped Badge */}
                {meal.swapped && (
                  <div className="absolute top-0 right-0 bg-brand-purple text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                    <Sparkles size={10} /> AI Swapped
                  </div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">{meal.type}</p>
                    <p className="text-[16px] font-extrabold text-text-primary">{meal.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-secondary bg-card-inset px-2.5 py-1 rounded-lg">
                    <Flame size={12} className="text-status-amber" />
                    {meal.cals} kcal
                  </div>
                  <p className="text-[11px] font-semibold text-text-secondary">{meal.macros}</p>
                </div>

                {/* ── Whiteboard "Swap" Button ── */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-status-green/15 text-status-green rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 transition-colors hover:bg-status-green/25">
                    <Check size={14} /> Log Meal
                  </button>
                  <button 
                    onClick={() => handleSwap(meal.id)}
                    disabled={isSwapping === meal.id}
                    className="flex-1 py-2.5 border border-border bg-card-inset text-text-primary rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 transition-all hover:border-brand-purple hover:text-brand-purple disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isSwapping === meal.id ? "animate-spin" : ""} /> 
                    {isSwapping === meal.id ? 'Thinking...' : 'Swap'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="h-4" aria-hidden="true" />
        </div>

        {/* ── Nav & Modal ── */}
        <BottomNav onAddClick={() => setIsWorkoutModalOpen(true)} />
        <WorkoutModal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} />
        
      </div>
    </div>
  );
}