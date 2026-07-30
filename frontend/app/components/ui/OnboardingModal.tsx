'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Target, Activity, Flame } from 'lucide-react';

import {
  useFitAIDispatch,
  useFitAIHydrated,
  useFitAIState,
} from '../../lib/FitAIContext';
import type { FitnessGoalId } from '../../lib/types';

const GOAL_OPTIONS: {
  id: FitnessGoalId;
  label: string;
  icon: typeof Flame;
  color: string;
}[] = [
  { id: 'cut', label: 'Lose Fat & Lean Out', icon: Flame, color: 'text-status-amber' },
  { id: 'bulk', label: 'Build Muscle & Strength', icon: Target, color: 'text-brand-purple' },
  { id: 'maintain', label: 'Improve Endurance', icon: Activity, color: 'text-status-green' },
];

export function OnboardingModal() {
  const { profile } = useFitAIState();
  const dispatch = useFitAIDispatch();
  const hydrated = useFitAIHydrated();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [stats, setStats] = useState({ age: '', weight: '', height: '' });
  const [goal, setGoal] = useState<FitnessGoalId | ''>('');

  useEffect(() => {
    if (hydrated && !profile.onboarded) {
      setIsOpen(true);
    }
  }, [hydrated, profile.onboarded]);

  const handleComplete = () => {
    if (!goal) return;

    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        name: name.trim() || 'Athlete',
        age: Number(stats.age),
        weight: Number(stats.weight),
        height: Number(stats.height),
        primaryGoal: goal,
        onboarded: true,
      },
    });

    setIsOpen(false);
  };

  if (!hydrated || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background p-5 animate-fade-in">
      <div className="w-full max-w-sm">

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-card-inset rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-purple to-brand-pink transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* STEP 1: Name */}
        {step === 1 && (
          <div className="animate-slide-up">
            <h1 className="text-3xl font-extrabold text-text-primary mb-2">Welcome to FitAI Pro.</h1>
            <p className="text-text-secondary text-sm mb-8">Let&apos;s personalize your AI coach. What should we call you?</p>
            <input
              type="text"
              placeholder="Your First Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-card border border-border rounded-2xl text-text-primary text-lg font-bold mb-6 focus:outline-none focus:border-brand-purple"
              autoFocus
            />
            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="w-full py-4 bg-gradient-to-r from-brand-purple to-brand-pink text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-transform active:scale-95 shadow-brand-glow"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: Stats */}
        {step === 2 && (
          <div className="animate-slide-up">
            <h1 className="text-2xl font-extrabold text-text-primary mb-2">Your Starting Point</h1>
            <p className="text-text-secondary text-sm mb-8">The AI uses this to calculate macros and calories.</p>

            <div className="space-y-4 mb-8">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase ml-2">Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 21"
                    value={stats.age}
                    onChange={(e) => setStats({ ...stats, age: e.target.value })}
                    className="w-full p-4 bg-card border border-border rounded-2xl text-text-primary font-bold mt-1 focus:outline-none focus:border-brand-purple"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase ml-2">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={stats.weight}
                    onChange={(e) => setStats({ ...stats, weight: e.target.value })}
                    className="w-full p-4 bg-card border border-border rounded-2xl text-text-primary font-bold mt-1 focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-text-secondary font-bold uppercase ml-2">Height (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 175"
                  value={stats.height}
                  onChange={(e) => setStats({ ...stats, height: e.target.value })}
                  className="w-full p-4 bg-card border border-border rounded-2xl text-text-primary font-bold mt-1 focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!stats.age || !stats.weight || !stats.height}
              className="w-full py-4 bg-gradient-to-r from-brand-purple to-brand-pink text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-transform active:scale-95 shadow-brand-glow"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 3: Goal */}
        {step === 3 && (
          <div className="animate-slide-up">
            <h1 className="text-2xl font-extrabold text-text-primary mb-2">What is your main goal?</h1>
            <p className="text-text-secondary text-sm mb-6">Choose your primary focus for the next 30 days.</p>

            <div className="space-y-3 mb-8">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${goal === g.id ? 'bg-card-inset border-brand-purple' : 'bg-card border-border hover:border-text-secondary/50'}`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-card-inset border border-border flex items-center justify-center ${g.color}`}>
                    <g.icon size={20} />
                  </div>
                  <span className="font-bold text-text-primary">{g.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleComplete}
              disabled={!goal}
              className="w-full py-4 bg-gradient-to-r from-brand-purple to-brand-pink text-white rounded-2xl font-bold flex items-center justify-center disabled:opacity-50 transition-transform active:scale-95 shadow-brand-glow"
            >
              Build My AI Plan
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
