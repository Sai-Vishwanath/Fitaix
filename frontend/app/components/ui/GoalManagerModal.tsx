'use client';

import { useState, useEffect } from 'react';
import { Target, X, Check, Activity, Dumbbell, Flame } from 'lucide-react';
import { useFitAIState, useFitAIDispatch } from '../../lib/FitAIContext';
import type { GoalState } from '../../lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function GoalManagerModal({ isOpen, onClose }: Props) {
  const state = useFitAIState();
  const dispatch = useFitAIDispatch();
  
  const primaryGoal = state.dashboard.goals[0] || { id: 'g1', title: 'Lose 5kg', current: 0, target: 100, color: '#A855F7', metric: 'weight' };

  const [metric, setMetric] = useState<'weight' | 'calories' | 'workouts'>(primaryGoal.metric);
  const [target, setTarget] = useState(primaryGoal.target.toString());

  useEffect(() => {
    if (isOpen) {
      setMetric(primaryGoal.metric);
      setTarget(primaryGoal.target.toString());
    }
  }, [isOpen, primaryGoal]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedGoal: GoalState = {
      ...primaryGoal,
      metric,
      target: parseInt(target) || 1,
      title: metric === 'weight' ? `Lose ${target}kg` : metric === 'calories' ? `Burn ${target} kcal` : `${target} Workouts`,
      color: metric === 'weight' ? '#A855F7' : metric === 'calories' ? '#3B82F6' : '#06B6D4'
    };

    const newGoals = [updatedGoal, ...state.dashboard.goals.slice(1)];
    
    dispatch({ type: 'UPDATE_GOALS', payload: newGoals });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border flex justify-between items-center bg-card-inset">
          <div className="flex items-center gap-2 text-white font-extrabold text-[16px]">
            <Target size={20} className="text-brand-purple" />
            Manage Primary Goal
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-text-secondary hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[12px] font-bold text-text-secondary mb-2 uppercase tracking-wide">Goal Type</label>
            <div className="grid grid-cols-3 gap-2">
              <MetricOption icon={Activity} label="Weight" selected={metric === 'weight'} onClick={() => setMetric('weight')} color="#A855F7" />
              <MetricOption icon={Flame} label="Calories" selected={metric === 'calories'} onClick={() => setMetric('calories')} color="#3B82F6" />
              <MetricOption icon={Dumbbell} label="Workouts" selected={metric === 'workouts'} onClick={() => setMetric('workouts')} color="#06B6D4" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-text-secondary mb-2 uppercase tracking-wide">Target Value</label>
            <div className="relative">
              <input 
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-card-inset border border-border rounded-xl py-3 px-4 text-white font-extrabold text-[15px] outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-[12px] font-bold">
                {metric === 'weight' ? 'kg' : metric === 'calories' ? 'kcal' : 'sessions'}
              </span>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-3.5 mt-2 bg-gradient-to-br from-brand-purple to-brand-pink text-white rounded-[16px] font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_16px_-6px_rgba(168,85,247,0.4)] active:scale-95 transition-transform"
          >
            <Check size={18} /> Update Goal
          </button>
        </div>
        
      </div>
    </div>
  );
}

function MetricOption({ icon: Icon, label, selected, onClick, color }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border cursor-pointer transition-all ${selected ? 'bg-card-inset' : 'bg-transparent border-transparent hover:bg-card-inset/50'}`}
      style={{ borderColor: selected ? color : 'transparent' }}
    >
      <Icon size={20} color={selected ? color : '#888'} />
      <span className="text-[10px] font-bold" style={{ color: selected ? '#fff' : '#888' }}>{label}</span>
    </div>
  );
}
