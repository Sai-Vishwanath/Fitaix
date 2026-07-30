'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  ChevronRight,
  ChevronDown,
  Dumbbell,
  Flame,
  Zap,
  Clock,
  Activity,
  Plus,
  Moon,
  Battery,
  Award
} from 'lucide-react';
import { BottomNav }    from '../ui/BottomNav';
import { WorkoutModal } from '../ui/WorkoutModal';
import { useFitAIState, useFitAIHydrated } from '../../lib/FitAIContext';
import type { ExerciseLog } from '../../lib/types';
import { useRouter } from 'next/navigation';

// ═══════════════════════════════════════════════════════════════════════════════
// Static mock AI workout suggestions (Matching HTML)
// ═══════════════════════════════════════════════════════════════════════════════

const AI_WORKOUTS = [
  {
    id:       'push',
    name:     'Push Strength',
    tag:      "TODAY'S BEST WORKOUT",
    tagColor: 'text-[#FDE9A8] bg-white/10',
    meta:     'Focus: Chest • Shoulders • Triceps',
    muscles:  ['Chest', 'Triceps', 'Front Delts'],
    duration: 45,
    exerciseCount: 4,
    calories: 420,
    initialExercises: [
      { id: 'p1', name: 'Barbell Bench Press', sets: 4, reps: 8, weight: 135 },
      { id: 'p2', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 45 },
      { id: 'p3', name: 'Cable Fly', sets: 3, reps: 12, weight: 30 },
      { id: 'p4', name: 'Rope Tricep Pushdown', sets: 3, reps: 12, weight: 40 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function FitAIBotIcon() {
  return (
    <svg viewBox="0 0 150 150" fill="none" className="w-full h-full animate-float drop-shadow-2xl">
      <defs>
        <linearGradient id="botBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF8E8" />
          <stop offset="100%" stopColor="#E8D9A0" />
        </linearGradient>
        <radialGradient id="eyeglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="100%" stopColor="#F5C400" />
        </radialGradient>
      </defs>
      <ellipse cx="75" cy="128" rx="30" ry="6" fill="#000" opacity=".25"/>
      <rect x="45" y="60" width="60" height="58" rx="22" fill="url(#botBody)"/>
      <circle cx="75" cy="34" r="26" fill="url(#botBody)"/>
      <rect x="66" y="6" width="18" height="10" rx="5" fill="#FFD60A"/>
      <circle cx="75" cy="4" r="4" fill="#FFD60A"/>
      <ellipse cx="65" cy="34" rx="6" ry="7" fill="url(#eyeglow)"/>
      <ellipse cx="85" cy="34" rx="6" ry="7" fill="url(#eyeglow)"/>
      <path d="M64 46q11 7 22 0" stroke="#B0A488" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
      <rect x="58" y="72" width="34" height="6" rx="3" fill="#F5C400" opacity=".55"/>
      <rect x="20" y="66" width="16" height="30" rx="8" fill="url(#botBody)"/>
      <rect x="10" y="58" width="14" height="16" rx="7" fill="url(#botBody)" transform="rotate(-25 17 66)"/>
      <rect x="114" y="66" width="16" height="30" rx="8" fill="url(#botBody)"/>
      <rect x="50" y="118" width="16" height="24" rx="7" fill="url(#botBody)"/>
      <rect x="84" y="118" width="16" height="24" rx="7" fill="url(#botBody)"/>
    </svg>
  );
}

function TwinklingStars() {
  const [stars, setStars] = useState<{ id: number; left: string; top: string; delay: string; size: string }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 70}%`,
      delay: `${Math.random() * 2.6}s`,
      size: `${Math.random() * 2 + 1}px`
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute bg-[#FFE9A8] rounded-full opacity-70 animate-twinkle"
          style={{ width: s.size, height: s.size, left: s.left, top: s.top, animationDelay: s.delay }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════════

export function WorkoutPage() {
  const router = useRouter();
  const state    = useFitAIState();
  const hydrated = useFitAIHydrated();

  // Modal State
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<{name: string; exercises: ExerciseLog[]} | null>(null);

  // Accordion State for AI Recommendation
  const [aiWhyOpen, setAiWhyOpen] = useState(false);

  // Stats
  const recoveryScore = hydrated ? state.recovery.neuralScore : 89;
  const sleepMinutes  = hydrated ? state.recovery.sleepMinutes : 465;
  const sleepFormatted = `${Math.floor(sleepMinutes / 60)}h ${sleepMinutes % 60}m`;
  
  const readiness = recoveryScore >= 80 ? 'High' : recoveryScore >= 60 ? 'Medium' : 'Low';
  const name = hydrated ? state.profile.name.split(' ')[0] : 'Priyanshi';

  const selectedWorkout = AI_WORKOUTS[0];

  const handleStartWorkout = () => {
    setActiveWorkout({ name: selectedWorkout.name, exercises: selectedWorkout.initialExercises });
    setIsWorkoutModalOpen(true);
  };

  const handleCreateManually = () => {
    setActiveWorkout(null);
    setIsWorkoutModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black flex items-start justify-center font-sans text-white">
      <div className="relative w-full max-w-[390px] min-h-screen bg-background overflow-hidden border-x border-border shadow-2xl">
        <div className="h-screen overflow-y-auto scrollbar-none px-5 pt-8 pb-32">

          {/* ── Topbar ── */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-[13px] text-text-secondary mb-0.5">Good morning,</p>
              <h1 className="text-[21px] font-extrabold text-white">{name} 👋</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-text-secondary relative border border-border">
                <Bell size={18} />
                <div className="absolute -top-1 -right-1 bg-status-red text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-background">3</div>
              </div>
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center font-extrabold text-[13px] text-white cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                onClick={() => router.push('/profile')}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* ── AI Hero Section ── */}
          <div className="relative rounded-[28px] overflow-hidden mb-4 p-5 border border-brand-purple/20 shadow-[0_20px_45px_-18px_rgba(245,196,0,0.5)]"
               style={{ background: 'radial-gradient(circle at 75% 15%, rgba(245,196,0,.30) 0%, transparent 45%), linear-gradient(160deg,#1c1c1c 0%, #131313 45%, #0a0a0a 100%)' }}>
            <TwinklingStars />
            <div className="relative z-10 flex items-start justify-between gap-2.5">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-wide px-2.5 py-1.5 rounded-full bg-white/10 text-[#FDE9A8] mb-2.5 border border-white/5">
                  <Zap size={11} fill="currentColor" /> {selectedWorkout.tag}
                </div>
                <h2 className="text-[26px] font-extrabold leading-[1.15] mb-1">{selectedWorkout.name}</h2>
                <p className="text-[13px] text-[#E8DFC0]">{selectedWorkout.meta}</p>
              </div>
              <div className="w-24 h-24 flex-shrink-0 -mt-1.5 z-20">
                <FitAIBotIcon />
              </div>
            </div>

            <div className="relative z-10 flex gap-4 my-4">
              <div className="flex flex-col gap-1">
                <Clock size={17} className="text-[#F5D98A]" />
                <span className="text-[13.5px] font-bold">{selectedWorkout.duration} Mins</span>
              </div>
              <div className="flex flex-col gap-1">
                <Dumbbell size={17} className="text-[#F5D98A]" />
                <span className="text-[13.5px] font-bold">{selectedWorkout.exerciseCount} Exercises</span>
              </div>
              <div className="flex flex-col gap-1">
                <Flame size={17} className="text-[#F5D98A]" />
                <span className="text-[13.5px] font-bold">{selectedWorkout.calories} Calories</span>
              </div>
            </div>

            <div className="relative z-10 inline-flex items-center gap-1.5 text-[11.5px] font-bold px-3 py-1.5 rounded-full bg-white/10 mb-4 border border-white/5">
              <Award size={13} /> Intermediate
            </div>

            <div className="relative z-10 flex gap-2.5">
              <button
                onClick={handleStartWorkout}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-purple text-white font-extrabold text-[14px] flex items-center justify-center gap-1.5 shadow-[0_10px_22px_-8px_rgba(255,179,0,0.55)] active:scale-[0.97] transition-transform"
              >
                <Zap size={14} fill="currentColor" /> Start Workout
              </button>
            </div>
          </div>

          {/* ── AI Recommendation Card ── */}
          <div className="bg-card border border-border rounded-[22px] p-4.5 mb-5 shadow-card-base transition-all duration-300">
            <div className="flex justify-between items-center mb-3.5 p-1">
              <div className="flex items-center gap-2 text-[15px] font-bold">
                <Activity size={17} className="text-brand-cyan" /> AI Recommendation
              </div>
              <button 
                onClick={() => setAiWhyOpen(!aiWhyOpen)}
                className="flex items-center gap-1 text-[11.5px] text-text-secondary font-semibold hover:text-white transition-colors"
              >
                Why this workout? <ChevronDown size={12} className={`transition-transform duration-300 ${aiWhyOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="flex justify-between mb-3.5">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-status-green/15 text-status-green flex items-center justify-center">
                  <Activity size={17} />
                </div>
                <div className="text-[13px] font-bold">{recoveryScore}%</div>
                <div className="text-[10px] text-text-secondary">Recovery</div>
              </div>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-brand-purple/15 text-brand-purple flex items-center justify-center">
                  <Moon size={17} />
                </div>
                <div className="text-[13px] font-bold">{sleepFormatted}</div>
                <div className="text-[10px] text-text-secondary">Sleep</div>
              </div>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-brand-cyan/15 text-brand-cyan flex items-center justify-center">
                  <Battery size={17} />
                </div>
                <div className="text-[13px] font-bold">{readiness}</div>
                <div className="text-[10px] text-text-secondary">Readiness</div>
              </div>
            </div>

            <p className="text-[12.5px] text-text-secondary leading-[1.6] px-1">
              Chest fully recovered. Increase pushing volume by 8% for better results.
            </p>
            <div className={`overflow-hidden transition-all duration-300 ${aiWhyOpen ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <p className="text-[12.5px] text-text-secondary leading-[1.6] px-1">
                Rest periods trimmed slightly given strong HRV and solid {sleepFormatted} of sleep last night.
              </p>
            </div>
          </div>

          {/* ── Today's Exercises Preview ── */}
          <div className="flex justify-between items-center mb-3 mt-5 px-1">
            <h3 className="text-[16px] font-bold">Today's Exercises</h3>
            <span className="text-[12.5px] text-brand-purple font-bold cursor-pointer">View All</span>
          </div>

          <div className="space-y-2.5 mb-8">
            {selectedWorkout.initialExercises.map((ex, i) => (
              <div key={ex.id} className="flex items-center gap-3 bg-card border border-border rounded-[18px] p-3 active:scale-[0.98] transition-transform">
                <div className="w-5 h-5 rounded-md bg-card-inset text-text-secondary text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div className="w-[52px] h-[52px] rounded-xl flex-shrink-0 flex items-center justify-center text-white" 
                     style={{ background: i % 2 === 0 ? 'linear-gradient(145deg, #3a2f10, #241a08)' : 'linear-gradient(145deg, #3a2810, #241c08)' }}>
                  <Dumbbell size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13.5px] font-bold mb-1 truncate">{ex.name}</h4>
                  <div className="text-[10.5px] text-text-secondary mb-1.5">{ex.sets} Sets · {ex.reps} Reps</div>
                  <span className="inline-flex items-center gap-1 text-[10.5px] text-text-secondary font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span> {selectedWorkout.muscles[i % selectedWorkout.muscles.length]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-[13px] font-bold leading-tight">~{Math.round(selectedWorkout.calories / selectedWorkout.exerciseCount)}</div>
                    <small className="text-[9.5px] text-text-secondary font-medium">kcal</small>
                  </div>
                  <ChevronRight size={16} className="text-text-secondary" />
                </div>
              </div>
            ))}
          </div>

          {/* ── Create Manually ── */}
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-[16px] font-bold">Custom</h3>
          </div>
          <button
            onClick={handleCreateManually}
            className="w-full bg-card border border-border rounded-[22px] p-4.5 mb-6 flex items-center gap-4 hover:border-brand-purple/40 transition-all group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-card-inset flex items-center justify-center flex-shrink-0 group-hover:bg-brand-purple/10 transition-colors">
              <Plus size={22} className="text-text-secondary group-hover:text-brand-purple transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] font-extrabold text-text-primary">Create Manually</p>
              <p className="text-[11px] text-text-secondary mt-0.5">Log sets, reps & weight bypass AI</p>
            </div>
            <ChevronRight size={16} className="text-text-secondary group-hover:text-brand-purple transition-colors" />
          </button>

          <div className="h-4" aria-hidden="true" />
        </div>

        {/* ── Modals & Nav ── */}
        <BottomNav onAddClick={handleCreateManually} />
        <WorkoutModal
          isOpen={isWorkoutModalOpen}
          onClose={() => {
            setIsWorkoutModalOpen(false);
            setTimeout(() => setActiveWorkout(null), 300);
          }}
          initialWorkoutName={activeWorkout?.name}
          initialExercises={activeWorkout?.exercises}
        />
      </div>
    </div>
  );
}

export default WorkoutPage;
