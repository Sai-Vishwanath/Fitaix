'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingModal } from '../ui/OnboardingModal';
import { BottomNav } from '../ui/BottomNav';
import { WorkoutModal } from '../ui/WorkoutModal';
import { GoalManagerModal } from '../ui/GoalManagerModal';
import {
  Bell, Check, ChevronRight, Dumbbell, Droplets, Flame, Minus, Plus,
  ScanLine, Sparkles, Trophy, UtensilsCrossed, Clock, Zap, Activity, ChevronDown, Target
} from 'lucide-react';
import {
  useFitAIState, useFitAIDispatch, useFitAIHydrated, calculateLoggedMacroTotals
} from '../../lib/FitAIContext';
import type { WorkoutSession, NotificationState, GoalState, ChallengeState, LiveStatsState, ExerciseLog } from '../../lib/types';

// ═══════════════════════════════════════════════════════════════════════════════
// Icon Mapping
// ═══════════════════════════════════════════════════════════════════════════════
const ICONS: Record<string, any> = {
  Sparkles, Trophy, Droplets, Flame, Activity, Dumbbell, UtensilsCrossed, Clock, Zap
};

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════
function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function useAnimated(delay = 150) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(id);
  }, [delay]);
  return animated;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Shared UI Components
// ═══════════════════════════════════════════════════════════════════════════════
function SectionHead({ title, action, onAction, actionNode }: { title: string; action?: string; onAction?: () => void; actionNode?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center mt-5 mb-2.5 px-0.5">
      <h3 className="text-[15px] font-bold text-white">{title}</h3>
      {actionNode ?? (action && <span onClick={onAction} className="text-[11.5px] text-brand-purple font-bold cursor-pointer">{action}</span>)}
    </div>
  );
}

function MiniRing({ pct, color, value, label }: { pct: number; color: string; value: string; label?: string }) {
  const animated = useAnimated();
  const radius = 19;
  const circ = 2 * Math.PI * radius;
  const offset = animated ? circ - (circ * pct) : circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[46px] h-[46px]">
        <svg width="46" height="46" viewBox="0 0 46 46" className="-rotate-90">
          <circle cx="23" cy="23" r={radius} fill="none" stroke="#241F14" strokeWidth="5" />
          <circle cx="23" cy="23" r={radius} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-1000 ease-[cubic-bezier(.3,.8,.3,1)]" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold">{value}</div>
      </div>
      {label && <div className="text-[9.5px] text-text-secondary mt-1 font-medium">{label}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Live AI Coach Carousel
// ═══════════════════════════════════════════════════════════════════════════════
function AICarouselSection({ recoveryScore, sleepMinutes, activeMinutes, workoutHistory }: { recoveryScore: number; sleepMinutes: number; activeMinutes: number; workoutHistory: WorkoutSession[] }) {
  const [liveTip, setLiveTip] = useState('Analyzing your data...');
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchTip = async () => {
      try {
        const recentWorkouts = workoutHistory.slice(0, 2);
        const workoutContext = recentWorkouts.length > 0 
          ? recentWorkouts.map(w => `${w.name} (${w.exercises?.map(e => `${e.name}: ${e.sets}x${e.reps}`).join(', ')})`).join(' | ')
          : 'No recent workouts.';

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: "You are FitAI Coach. Provide ONE specific, ultra-short tip (1 sentence) based on workout history, sleep, and active minutes. NO markdown, NO hashtags. Acknowledge if they have been highly active." },
              { role: "user", content: `Recovery: ${recoveryScore}%. Sleep: ${Math.floor(sleepMinutes/60)}h ${sleepMinutes%60}m. Active Mins: ${activeMinutes}. Workouts: ${workoutContext}.` }
            ]
          })
        });
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        setLiveTip(data.choices[0].message.content.trim());
      } catch (e) {
        setLiveTip(`With your ${recoveryScore}% recovery, focus on hydration and mobility today!`);
      }
    };
    fetchTip();
  }, [recoveryScore, sleepMinutes, workoutHistory]);

  return (
    <>
      <SectionHead title="AI Suggestions" />
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
        <div className="snap-start flex-shrink-0 w-[260px] bg-gradient-to-br from-brand-purple/10 to-brand-cyan/5 border border-brand-purple/20 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-purple mb-1.5">
            <Sparkles size={14} className="text-brand-cyan" /> Recovery Tip
          </div>
          <p className="text-[11.5px] text-text-secondary leading-relaxed">{liveTip}</p>
        </div>
        <div className="snap-start flex-shrink-0 w-[260px] bg-card border border-border rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-status-amber mb-1.5">
            <UtensilsCrossed size={14} /> Nutrition Tip
          </div>
          <p className="text-[11.5px] text-text-secondary leading-relaxed">You're slightly under your protein goal — a shake tonight would close the gap.</p>
        </div>
        <div className="snap-start flex-shrink-0 w-[260px] bg-card border border-border rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-status-green mb-1.5">
            <Flame size={14} /> Streak Alert
          </div>
          <p className="text-[11.5px] text-text-secondary leading-relaxed">One more session today keeps your streak alive. You've got this 🔥</p>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Dashboard
// ═══════════════════════════════════════════════════════════════════════════════
export function DashboardPage() {
  const router = useRouter();
  const state = useFitAIState();
  const dispatch = useFitAIDispatch();
  const hydrated = useFitAIHydrated();
  const animated = useAnimated();

  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<{name: string; exercises: ExerciseLog[]} | null>(null);
  const [isGeneratingSaver, setIsGeneratingSaver] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Wed');
  const [weekDates, setWeekDates] = useState<number[]>([16, 17, 18, 19, 20, 21, 22]);
  const [todayAbbr, setTodayAbbr] = useState<string>('Wed');

  useEffect(() => {
    // Set the actual local day client-side to prevent hydration errors
    const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    setSelectedDay(DAY_ABBR[now.getDay()]);
    setTodayAbbr(DAY_ABBR[now.getDay()]);

    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.getDate());
    }
    setWeekDates(dates);
  }, []);

  if (!hydrated) return <div className="min-h-screen bg-black" />;

  const { profile, recovery, dashboard, nutrition, workouts } = state;
  const name = profile.name ? profile.name.split(' ')[0] : 'User';
  
  // Totals
  const activeDayMeals = nutrition.days.find(d => d.dayKey === nutrition.activeDay)?.meals || [];
  const logged = calculateLoggedMacroTotals(activeDayMeals);
  const t = nutrition.targets;
  const notifs = dashboard.notifications;
  const unreadCount = notifs.filter(n => n.unread && !n.dismissed).length;

  // Streak days
  const streakArr = [
    { abbr: 'M', done: true }, { abbr: 'T', done: true }, 
    { abbr: 'W', done: true }, { abbr: 'T', done: true }, { abbr: 'F', done: false }
  ];

  // Handlers
  const handleAddWater = () => dispatch({ type: 'ADD_WATER', payload: 1 });
  const handleRemoveWater = () => dispatch({ type: 'ADD_WATER', payload: -1 });
  
  const handleClearNotifs = () => {
    dispatch({
      type: 'UPDATE_NOTIFICATIONS',
      payload: notifs.map(n => ({ ...n, dismissed: true }))
    });
  };
  const handleReadNotif = (id: string) => {
    dispatch({
      type: 'UPDATE_NOTIFICATIONS',
      payload: notifs.map(n => n.id === id ? { ...n, unread: false } : n)
    });
  };

  const handleGenerateStreakSaver = () => {
    setIsGeneratingSaver(true);
    setTimeout(() => {
      setActiveWorkout({
        name: '15-Min AI Burner',
        exercises: [
          { id: 'es1', name: 'Jumping Jacks', sets: 3, reps: 30, weight: 0 },
          { id: 'es2', name: 'Bodyweight Squats', sets: 3, reps: 20, weight: 0 },
          { id: 'es3', name: 'Pushups', sets: 3, reps: 15, weight: 0 },
          { id: 'es4', name: 'Plank Hold', sets: 3, reps: 60, weight: 0 },
        ]
      });
      setIsGeneratingSaver(false);
      setIsWorkoutModalOpen(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black flex items-start justify-center font-sans text-white">
      <div className="relative w-full max-w-[390px] min-h-screen bg-background overflow-hidden border-x border-black shadow-[0_50px_100px_-25px_rgba(0,0,0,0.9)] rounded-[52px]">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[26px] bg-black rounded-b-[18px] z-50"></div>
        
        {/* Fake Status Bar */}
        <div className="flex justify-between items-center px-6 pt-4 pb-1 text-[15px] font-bold">
          <span>9:41</span>
          <div className="flex gap-[5px] items-center">
            <Activity size={14} /> <Clock size={14} /> <BatteryIcon />
          </div>
        </div>

        <div className="h-[calc(100%-34px)] overflow-y-auto scrollbar-none px-5 pb-[100px]">
          
          {/* Topbar */}
          <div className="flex justify-between items-start my-2">
            <div>
              <div className="text-[13px] text-text-secondary">Good morning,</div>
              <div className="text-[20px] font-extrabold">{name} 👋</div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-card flex items-center justify-center text-text-secondary border border-border cursor-pointer">
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-status-red text-white text-[9px] font-extrabold w-[15px] h-[15px] rounded-full flex items-center justify-center border-2 border-background">{unreadCount}</span>}
              </div>
              <div 
                className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center font-extrabold text-[12.5px] shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                onClick={() => router.push('/profile')}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* AI Workout Mini */}
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#2a2210] to-[#171310] border border-brand-purple/20 rounded-[18px] p-3.5 cursor-pointer shadow-sm active:scale-95 transition-transform" onClick={() => router.push('/workout')}>
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Activity size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[#D6D0FF] font-bold tracking-wider">TODAY'S AI WORKOUT</div>
              <div className="text-[14.5px] font-extrabold text-white">Push Strength</div>
              <div className="text-[10.5px] text-[#D6D0FF] mt-0.5">45 min · 6 exercises</div>
            </div>
            <div className="w-[34px] h-[34px] rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white">
              <ChevronRight size={15} strokeWidth={2.5} />
            </div>
          </div>

          {/* Recovery / Streak Grid */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-card border border-border rounded-2xl p-3.5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11.5px] text-text-secondary font-semibold">Recovery Score</span>
                <Activity size={15} className="text-status-green" />
              </div>
              <div className="flex items-center gap-2.5">
                <MiniRing pct={recovery.neuralScore/100} color="#A3E635" value={String(recovery.neuralScore)} />
                <div>
                  <div className="text-[14px] font-extrabold leading-tight">Excellent</div>
                  <div className="text-[10px] text-text-secondary mt-0.5">Ready to train</div>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-3.5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11.5px] text-text-secondary font-semibold">Workout Streak</span>
                <Flame size={15} className="text-status-amber" />
              </div>
              <div className="text-[19px] font-extrabold">{dashboard.workoutStreak} <small className="text-[11px] text-text-secondary font-semibold">days</small></div>
              <div className="flex gap-1.5 mt-2.5">
                {streakArr.map((d, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div className={`w-[26px] h-[26px] rounded-full mx-auto mb-1 flex items-center justify-center text-[10px] font-bold ${d.done ? 'bg-gradient-to-br from-status-amber to-[#C2410C] text-white' : 'bg-card-inset text-text-secondary'}`}>
                      {d.done ? <Check size={11} /> : d.abbr}
                    </div>
                    <div className="text-[8.5px] text-text-secondary">{d.abbr}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Goal Progress */}
          <SectionHead title="Goal Progress" action="Manage" onAction={() => setIsGoalModalOpen(true)} />
          <div className="bg-card border border-border rounded-[24px] p-5 shadow-sm">
            {dashboard.goals.map((g, i) => {
              // Dynamically compute progress based on the metric
              let currentVal = g.current;
              let suffix = '';
              let IconToUse = Target;
              
              if (g.metric === 'workouts') {
                currentVal = dashboard.weeklyWorkoutsCompleted;
                IconToUse = Dumbbell;
              }
              if (g.metric === 'calories') {
                currentVal = dashboard.totalCaloriesBurned;
                suffix = 'kcal';
                IconToUse = Flame;
              }
              if (g.metric === 'weight') {
                suffix = 'kg';
                IconToUse = Activity;
              }
              
              // Handle old invalid colors (var(--blue) etc)
              let safeColor = g.color;
              if (safeColor.includes('purple')) safeColor = '#A855F7';
              else if (safeColor.includes('blue')) safeColor = '#3B82F6';
              else if (safeColor.includes('cyan')) safeColor = '#06B6D4';
              else if (safeColor.includes('var')) safeColor = '#10B981';

              const pct = g.target > 0 ? Math.min(100, Math.round((currentVal / g.target) * 100)) : 0;
              
              return (
                <div key={g.id} className={`flex items-center gap-3.5 ${i < dashboard.goals.length-1 ? 'mb-4 pb-4 border-b border-border/50' : ''}`}>
                  <div className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 bg-card-inset border border-border/50" style={{ color: safeColor }}>
                    <IconToUse size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[13.5px] font-extrabold text-white">{g.title}</span>
                      <div className="text-[10px] text-text-secondary font-bold">
                        <span className="text-white">{currentVal.toLocaleString()}{suffix}</span> / {g.target.toLocaleString()}{suffix}
                      </div>
                    </div>
                    <div className="h-[8px] bg-card-inset rounded-full overflow-hidden shadow-inner relative">
                      <div className="absolute inset-0 bg-white/5" />
                      <div className="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(.3,.8,.3,1)] shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ width: animated ? `${pct}%` : '0%', backgroundColor: safeColor }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nutrition */}
          <SectionHead title="Calories & Nutrition" action="Log Meal" onAction={() => router.push('/nutrition')} />
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex justify-around items-center">
              <MiniRing pct={t.calories > 0 ? logged.calories/t.calories : 0} color="#F59E0B" value={logged.calories > 999 ? (logged.calories/1000).toFixed(1)+'k' : String(logged.calories)} label="Calories" />
              <MiniRing pct={t.protein > 0 ? logged.protein/t.protein : 0} color="#A3E635" value={`${Math.round((logged.protein/Math.max(t.protein,1))*100)}%`} label="Protein" />
              <MiniRing pct={t.carbs > 0 ? logged.carbs/t.carbs : 0} color="#F5C400" value={`${Math.round((logged.carbs/Math.max(t.carbs,1))*100)}%`} label="Carbs" />
            </div>
          </div>

          {/* Water */}
          <SectionHead title="Water Intake" actionNode={<span className="text-[11.5px] text-brand-purple font-bold">{(dashboard.waterGlasses * 0.4).toFixed(1)} / {(dashboard.maxWaterGlasses * 0.4).toFixed(1)}L</span>} />
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={handleRemoveWater} className="w-8 h-8 rounded-full border border-border bg-card-inset text-white text-[16px] font-bold flex items-center justify-center shadow-sm hover:bg-card transition-colors">−</button>
              <div className="flex-1 h-2 bg-card-inset rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-blue to-brand-cyan transition-all duration-500 ease-out" style={{ width: `${Math.round((dashboard.waterGlasses/dashboard.maxWaterGlasses)*100)}%` }} />
              </div>
              <button onClick={handleAddWater} className="w-8 h-8 rounded-full border border-border bg-card-inset text-white text-[16px] font-bold flex items-center justify-center shadow-sm hover:bg-card transition-colors">+</button>
            </div>
          </div>

          {/* Live AI Coach Carousel */}
          <AICarouselSection recoveryScore={recovery.neuralScore} sleepMinutes={recovery.sleepMinutes} activeMinutes={dashboard.liveStats.activeMinutes} workoutHistory={workouts.history} />

          {/* Weekly Calendar */}
          <SectionHead title="Weekly Calendar" />
          <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
            <div className="flex justify-between">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => {
                const isSel = selectedDay === d;
                const isToday = todayAbbr === d;
                
                // Dynamically check if there is a workout recorded for this day
                const hasWorkout = workouts.history.some(w => {
                  const wDate = new Date(w.completedAt);
                  const cellDate = new Date();
                  const diffToMonday = cellDate.getDay() === 0 ? 6 : cellDate.getDay() - 1;
                  const monday = new Date(cellDate);
                  monday.setDate(cellDate.getDate() - diffToMonday);
                  const targetDate = new Date(monday);
                  targetDate.setDate(monday.getDate() + i);
                  
                  return wDate.toLocaleDateString() === targetDate.toLocaleDateString();
                });

                return (
                  <div key={d} onClick={() => setSelectedDay(d)} className={`flex-1 flex flex-col items-center py-2.5 rounded-[14px] cursor-pointer transition-colors ${isSel ? 'bg-gradient-to-br from-brand-purple to-brand-pink text-white shadow-[0_4px_10px_-2px_rgba(245,196,0,0.4)]' : isToday ? 'bg-card-inset' : 'hover:bg-card-inset/50'}`}>
                    <span className={`text-[9.5px] font-medium mb-1.5 ${isSel ? 'text-white' : 'text-text-secondary'}`}>{d}</span>
                    <span className="text-[13px] font-extrabold">{weekDates[i]}</span>
                    {hasWorkout && <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSel ? 'bg-white' : 'bg-brand-purple'}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <SectionHead title="Recent Activity" action="View All" />
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
            {workouts.history.slice(0, 3).map((w, i) => (
              <div key={w.id} className={`flex items-center gap-2.5 pb-3 ${i < 2 ? 'border-b border-border' : 'pb-0'}`}>
                <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0 bg-brand-purple/15 text-brand-purple`}>
                  <Dumbbell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <b className="text-[12px] font-bold block">{w.name}</b>
                  <span className="text-[10px] text-text-secondary">{(w.exercises?.length) || 0} exercises · {w.caloriesBurned} kcal</span>
                </div>
                <div className="text-[10px] text-text-secondary flex-shrink-0">{formatTimeAgo(w.completedAt)}</div>
              </div>
            ))}
            {workouts.history.length === 0 && (
              <div className="text-center text-[11px] text-text-secondary py-2">No recent activity. Log a workout!</div>
            )}
          </div>

          {/* Leaderboard */}
          <SectionHead title="Leaderboard" action="Friends" />
          <div className="bg-card border border-border rounded-2xl p-3 shadow-sm space-y-1">
            <div className="flex items-center gap-2.5 p-2">
              <div className="w-5 text-[12px] font-extrabold text-center text-status-amber">1</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#B45309] flex items-center justify-center text-[11px] font-bold text-white">A</div>
              <div className="flex-1 min-w-0">
                <b className="text-[12px] font-bold block">Arjun</b>
                <span className="text-[9.5px] text-text-secondary">32 workouts</span>
              </div>
              <div className="text-[12px] font-extrabold text-brand-purple">2,840</div>
            </div>
            <div className="flex items-center gap-2.5 p-2 bg-brand-purple/10 rounded-xl">
              <div className="w-5 text-[12px] font-extrabold text-center text-text-secondary">2</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center text-[11px] font-bold text-white">P</div>
              <div className="flex-1 min-w-0">
                <b className="text-[12px] font-bold block">You</b>
                <span className="text-[9.5px] text-text-secondary">28 workouts</span>
              </div>
              <div className="text-[12px] font-extrabold text-brand-purple">2,610</div>
            </div>
            <div className="flex items-center gap-2.5 p-2">
              <div className="w-5 text-[12px] font-extrabold text-center text-text-secondary">3</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center text-[11px] font-bold text-white">S</div>
              <div className="flex-1 min-w-0">
                <b className="text-[12px] font-bold block">Sara</b>
                <span className="text-[9.5px] text-text-secondary">25 workouts</span>
              </div>
              <div className="text-[12px] font-extrabold text-brand-purple">2,340</div>
            </div>
          </div>

          {/* Quick Actions */}
          <SectionHead title="Quick Actions" />
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { label: 'Log Workout', icon: Dumbbell, color: 'text-brand-purple', action: () => setIsWorkoutModalOpen(true) },
                { label: 'Log Meal', icon: UtensilsCrossed, color: 'text-status-amber', action: () => router.push('/nutrition') },
                { label: 'Add Water', icon: Droplets, color: 'text-brand-cyan', action: handleAddWater },
                { label: 'Scan Food', icon: ScanLine, color: 'text-status-green', action: () => setIsScanModalOpen(true) },
              ].map(q => (
                <div key={q.label} onClick={q.action} className="group text-center cursor-pointer">
                  <div className={`w-[52px] h-[52px] rounded-2xl bg-card-inset flex items-center justify-center mx-auto mb-1.5 transition-transform active:scale-90 ${q.color}`}>
                    <q.icon size={22} />
                  </div>
                  <div className="text-[9.5px] text-text-secondary font-semibold">{q.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Statistics */}
          <SectionHead title="Live Statistics" actionNode={<span className="flex items-center gap-1 text-[11.5px] text-text-secondary font-bold"><span className="w-1.5 h-1.5 rounded-full bg-status-green animate-[blink_1.5s_ease-in-out_infinite]" /> Live</span>} />
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex justify-around text-center">
              <div><div className="text-[17px] font-extrabold">{dashboard.liveStats.steps.toLocaleString()}</div><div className="text-[9.5px] text-text-secondary mt-0.5">Steps</div></div>
              <div><div className="text-[17px] font-extrabold">{dashboard.liveStats.activeMinutes}</div><div className="text-[9.5px] text-text-secondary mt-0.5">Active Min</div></div>
              <div><div className="text-[17px] font-extrabold">{dashboard.liveStats.heartRate}</div><div className="text-[9.5px] text-text-secondary mt-0.5">BPM Now</div></div>
            </div>
          </div>

          {/* 15-Min Streak Saver (Preserved as requested) */}
          <SectionHead title="AI Emergency" />
          <div className="relative bg-card border border-status-amber/30 rounded-2xl p-4 shadow-[0_8px_30px_-10px_rgba(245,158,11,0.2)] overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-status-amber/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
            <div className="relative z-10 flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-status-amber/20 text-status-amber flex items-center justify-center flex-shrink-0">
                <Clock size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <b className="text-[13px] font-extrabold text-white">Short on time?</b>
                  <span className="text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-sm bg-status-amber/20 text-status-amber tracking-wide">STREAK SAVER</span>
                </div>
                <p className="text-[10.5px] text-text-secondary mt-0.5 leading-relaxed">Protect your {dashboard.workoutStreak}-day streak with a 15-min AI-generated burner.</p>
              </div>
            </div>
            <button onClick={handleGenerateStreakSaver} disabled={isGeneratingSaver} className="relative z-10 w-full py-3 rounded-[14px] bg-gradient-to-br from-status-amber to-[#C2410C] text-white font-extrabold text-[12.5px] flex items-center justify-center gap-2 shadow-[0_8px_16px_-6px_rgba(245,158,11,0.6)] active:scale-[0.98] transition-transform disabled:opacity-75 disabled:active:scale-100">
              {isGeneratingSaver ? (
                <>Building 15-min Plan...</>
              ) : (
                <><Zap size={14} fill="currentColor" /> Generate 15-Min Quick Workout</>
              )}
            </button>
          </div>

          {/* Active Challenges */}
          <SectionHead title="Active Challenges" action="Browse" />
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
            {dashboard.challenges.map(c => {
              const Icon = ICONS[c.type === 'workout' ? 'Trophy' : 'Droplets'] || Activity;
              const colorClass = c.type === 'workout' ? 'text-brand-pink bg-brand-pink/15' : 'text-brand-cyan bg-brand-cyan/15';
              const gradClass = c.type === 'workout' ? 'from-brand-pink to-brand-purple' : 'from-brand-blue to-brand-cyan';
              const pct = (c.current / c.target) * 100;
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <b className="text-[12px] font-bold block mb-1">{c.title}</b>
                    <div className="h-1.5 bg-card-inset rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${gradClass} transition-all duration-1000 ease-[cubic-bezier(.3,.8,.3,1)]`} style={{ width: animated ? `${pct}%` : '0%' }} />
                    </div>
                    <div className="text-[9.5px] text-text-secondary mt-1">{c.current}/{c.target} · {c.daysLeft} days left</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notifications */}
          <SectionHead title="Notifications" action="Clear All" onAction={handleClearNotifs} />
          <div className="bg-card border border-border rounded-2xl p-0 shadow-sm overflow-hidden transition-all">
            {notifs.filter(n => !n.dismissed).map((n, i, arr) => {
              const Icon = ICONS[n.icon] || Bell;
              return (
                <div key={n.id} onClick={() => handleReadNotif(n.id)} className={`flex items-start gap-2.5 p-3.5 cursor-pointer transition-colors hover:bg-white/5 ${i < arr.length-1 ? 'border-b border-border' : ''}`}>
                  <div className="relative">
                    {n.unread && <div className="absolute -left-1.5 top-2 w-1.5 h-1.5 rounded-full bg-brand-purple" />}
                    <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 ${n.iconBg} ${n.iconColor}`}>
                      <Icon size={15} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <b className="text-[11.5px] font-bold block">{n.title}</b>
                    <span className="text-[10px] text-text-secondary">{n.body}</span>
                  </div>
                  <div className="text-[9.5px] text-text-secondary pt-0.5">{n.time}</div>
                </div>
              );
            })}
            {notifs.filter(n => !n.dismissed).length === 0 && (
              <div className="p-4 text-center text-[12px] text-text-secondary">All caught up! 🎉</div>
            )}
          </div>

        </div>

        {/* Bottom Nav */}
        <BottomNav onAddClick={() => { setActiveWorkout(null); setIsWorkoutModalOpen(true); }} />

        <WorkoutModal 
          isOpen={isWorkoutModalOpen} 
          onClose={() => { setIsWorkoutModalOpen(false); setTimeout(() => setActiveWorkout(null), 300); }} 
          initialWorkoutName={activeWorkout?.name}
          initialExercises={activeWorkout?.exercises}
        />

        <GoalManagerModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} />

        {/* Camera Scan Modal (Mock) */}
        {isScanModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm p-6 bg-card rounded-[24px] border border-border shadow-2xl text-center">
              <div className="w-14 h-14 bg-status-green/20 text-status-green rounded-full flex items-center justify-center mx-auto mb-4">
                <ScanLine size={28} />
              </div>
              <h2 className="text-[18px] font-bold mb-2">Camera Access</h2>
              <p className="text-[13px] text-text-secondary mb-6">FitAI needs camera access to scan your food and calculate macros automatically.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsScanModalOpen(false)} className="flex-1 py-3 bg-card-inset text-white rounded-xl font-semibold text-[13px]">Cancel</button>
                <button onClick={() => setIsScanModalOpen(false)} className="flex-1 py-3 bg-status-green text-black rounded-xl font-bold text-[13px]">Allow</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="#fff"/>
      <rect x="2" y="2" width="18" height="8" rx="1.5" fill="#fff"/>
      <rect x="22.5" y="4" width="2" height="4" rx="1" fill="#fff"/>
    </svg>
  );
}

export default DashboardPage;