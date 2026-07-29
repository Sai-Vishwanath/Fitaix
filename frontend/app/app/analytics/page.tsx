'use client';

import { useState } from 'react';
import { Target, Activity, Flame, Dumbbell, BrainCircuit, TrendingUp, TrendingDown } from 'lucide-react';
import { BottomNav } from '../../components/ui/BottomNav';
import { WorkoutModal } from '../../components/ui/WorkoutModal';

export default function AnalyticsPage() {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-start justify-center font-sans">
      <div className="relative w-full max-w-[390px] min-h-screen bg-background overflow-hidden">
        
        {/* ── Scrollable content ── */}
        <div className="h-screen overflow-y-auto scrollbar-none px-5 pt-6 pb-28">
          
          <div className="flex justify-between items-center mt-2.5 mb-6">
            <h1 className="text-[19px] font-extrabold text-text-primary">
              Analytics
            </h1>
          </div>

          {/* ── 1. Performance Overview (Goal + Weekly Progress + Streak) ── */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="col-span-2 bg-gradient-to-br from-brand-purple to-brand-pink rounded-3xl p-5 text-white shadow-lg flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold opacity-80 uppercase tracking-wider mb-1">Weekly Goal</p>
                <p className="text-2xl font-extrabold">3 / 4 <span className="text-sm font-medium opacity-80">Workouts</span></p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-3xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1 text-status-amber">
                <Flame size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Streak</span>
              </div>
              <p className="text-[18px] font-extrabold text-text-primary">12 Days</p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1 text-status-green">
                <Activity size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Performance</span>
              </div>
              <p className="text-[18px] font-extrabold text-text-primary">Excellent</p>
            </div>
          </div>

          {/* ── 2. AI Recommendation (Overtrained vs Undertrained) ── */}
          <div className="bg-card border border-border rounded-3xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-purple/15 text-brand-purple flex items-center justify-center">
                <BrainCircuit size={16} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-text-primary">AI Recommendation</p>
                <p className="text-[10px] text-text-secondary">Weekly Muscle Analysis</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-bold">
                  <span className="text-status-amber">Overtrained (Rest Needed)</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-status-amber/10 text-status-amber rounded-full text-[10px] font-bold border border-status-amber/20">Chest</span>
                  <span className="px-3 py-1 bg-status-amber/10 text-status-amber rounded-full text-[10px] font-bold border border-status-amber/20">Front Delts</span>
                </div>
              </div>
              <div className="h-[1px] w-full bg-border" />
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-bold">
                  <span className="text-status-green">Undertrained (Focus Next)</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-status-green/10 text-status-green rounded-full text-[10px] font-bold border border-status-green/20">Lats (Back)</span>
                  <span className="px-3 py-1 bg-status-green/10 text-status-green rounded-full text-[10px] font-bold border border-status-green/20">Hamstrings</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. Weekly Bar Chart (Exercises Completed) ── */}
          <div className="bg-card border border-border rounded-3xl p-5 mb-4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-[13.5px] font-bold text-text-primary">Exercises Completed</p>
              <Dumbbell size={16} className="text-brand-purple" />
            </div>
            
            {/* Custom Bar Chart mimicking the whiteboard */}
            <div className="h-32 flex items-end justify-between gap-2 border-b border-border/50 pb-2">
              <div className="w-full bg-status-green rounded-t-md" style={{ height: '30%' }} />
              <div className="w-full bg-brand-purple rounded-t-md" style={{ height: '70%' }} />
              <div className="w-full bg-brand-blue rounded-t-md" style={{ height: '45%' }} />
              <div className="w-full bg-card-inset rounded-t-md" style={{ height: '0%' }} />
              <div className="w-full bg-card-inset rounded-t-md" style={{ height: '0%' }} />
              <div className="w-full bg-card-inset rounded-t-md" style={{ height: '0%' }} />
              <div className="w-full bg-card-inset rounded-t-md" style={{ height: '0%' }} />
            </div>
            
            <div className="flex justify-between mt-2 text-[10px] text-text-secondary font-bold">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
          </div>

          {/* ── 4. Line Charts (Strength & Weight Loss) ── */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            
            {/* Deadlift Line Chart */}
            <div className="bg-card border border-border rounded-3xl p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[11px] font-bold text-text-primary">Deadlift (kg)</p>
                <TrendingUp size={14} className="text-status-green" />
              </div>
              <div className="h-16 w-full relative mt-4">
                {/* Hand-drawn style SVG line pointing UP */}
                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <polyline points="0,40 25,35 50,20 75,25 100,5" fill="none" stroke="#A3E635" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="100" cy="5" r="4" fill="#A3E635" />
                </svg>
              </div>
            </div>

            {/* Weight Loss Line Chart */}
            <div className="bg-card border border-border rounded-3xl p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[11px] font-bold text-text-primary">Weight (kg)</p>
                <TrendingDown size={14} className="text-brand-cyan" />
              </div>
              <div className="h-16 w-full relative mt-4">
                {/* Hand-drawn style SVG line pointing DOWN with the whiteboard data points */}
                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  {/* Values mapped roughly: 58 -> high, 57.5, 50.8 -> low, 51 -> slight bump */}
                  <polyline points="0,5 33,10 66,35 100,30" fill="none" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="100" cy="30" r="4" fill="#2DD4BF" />
                </svg>
                <span className="absolute bottom-0 right-0 text-[9px] font-bold text-text-primary">51 kg</span>
              </div>
            </div>

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