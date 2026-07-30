'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Flame, Activity, Sparkles, BrainCircuit, Dumbbell, Target } from 'lucide-react';
import { BottomNav } from '../../components/ui/BottomNav';
import { useFitAIState, useFitAIHydrated, calculateLoggedMacroTotals } from '../../lib/FitAIContext';
import type { WorkoutSession } from '../../lib/types';

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function useAnimated(delay = 150) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(id);
  }, [delay]);
  return animated;
}

const DAY_ABBR = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getTrailing7DaysCalories(history: WorkoutSession[]): number[] {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const counts = Array(7).fill(0);

  for (const session of history) {
    const d = new Date(session.completedAt);
    const diff = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
    if (diff >= 0 && diff < 7) {
      counts[6 - diff] += session.caloriesBurned;
    }
  }
  return counts;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SVG Components
// ═══════════════════════════════════════════════════════════════════════════════

function ScoreRing({ score, streak, completed, goal }: { score: number, streak: number, completed: number, goal: number }) {
  const animated = useAnimated(100);
  const target = Math.min(score, 100);
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    if (!animated) return;
    let v = 0;
    const interval = setInterval(() => {
      v += 2;
      setDisplayVal(Math.min(v, target));
      if (v >= target) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [animated, target]);

  const radius = 37;
  const circ = 2 * Math.PI * radius;
  const offset = animated ? circ - (circ * (target / 100)) : circ;

  return (
    <div className="bg-card border border-border rounded-[20px] p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[13px] font-bold text-text-secondary mb-2">Fitness Score</div>
          <div className="text-[32px] font-extrabold text-white leading-none">
            {displayVal}<small className="text-[15px] text-text-secondary font-semibold">/100</small>
          </div>
          <div className="text-[12px] text-status-green font-bold mt-1">Great Progress! 🔥</div>
        </div>
        <div className="relative w-[88px] h-[88px]">
          <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
            <defs>
              <linearGradient id="fsGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F5C400" />
                <stop offset="100%" stopColor="#FDE68A" />
              </linearGradient>
            </defs>
            <circle cx="44" cy="44" r={radius} fill="none" stroke="#241F14" strokeWidth="8" />
            <circle 
              cx="44" cy="44" r={radius} fill="none" stroke="url(#fsGrad)" strokeWidth="8" strokeLinecap="round" 
              strokeDasharray={circ} strokeDashoffset={offset} 
              className="transition-all duration-1000 ease-[cubic-bezier(.3,.8,.3,1)]" 
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-extrabold text-[22px]">{displayVal}</div>
        </div>
        <div className="flex flex-col gap-2.5 items-end">
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-text-secondary">
            <Flame size={15} className="text-status-amber" />
            <div><b className="text-white block text-[12.5px]">{streak} Days</b>Streak</div>
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-text-secondary">
            <Target size={15} className="text-text-secondary" />
            <div><b className="text-white block text-[12.5px]">{completed}/{goal}</b>Workouts</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalorieBars({ data }: { data: number[] }) {
  const animated = useAnimated(250);
  const max = Math.max(...data, 100);

  return (
    <div className="flex items-end gap-1 h-[60px] w-full">
      {data.map((val, i) => {
        const heightPct = Math.min((val / max) * 100, 100);
        return (
          <div key={i} className="flex-1 rounded-t-[3px] bg-[#CA8A04] transition-all duration-[600ms] ease-[cubic-bezier(.3,.8,.3,1)]" style={{ height: animated ? `${Math.max(heightPct, 4)}%` : '0%', transitionDelay: `${i * 60}ms` }} />
        );
      })}
    </div>
  );
}

function DonutCompletion({ completed, goal }: { completed: number, goal: number }) {
  const animated = useAnimated(150);
  const pct = goal > 0 ? Math.min((completed / goal) * 100, 100) : 0;
  
  const radius = 32;
  const circ = 2 * Math.PI * radius;
  const offset = animated ? circ - (circ * (pct / 100)) : circ;

  return (
    <div className="relative w-[78px] h-[78px] mx-auto mb-2">
      <svg width="78" height="78" viewBox="0 0 78 78" className="-rotate-90">
        <defs>
          <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5C400" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
        </defs>
        <circle cx="39" cy="39" r={radius} fill="none" stroke="#241F14" strokeWidth="9" />
        <circle 
          cx="39" cy="39" r={radius} fill="none" stroke="url(#donutGrad)" strokeWidth="9" strokeLinecap="round" 
          strokeDasharray={circ} strokeDashoffset={offset} 
          className="transition-all duration-1000 ease-[cubic-bezier(.3,.8,.3,1)]" 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-extrabold text-[17px]">{animated ? Math.round(pct) : 0}%</div>
    </div>
  );
}

function RadarChart({ muscleFatigue }: { muscleFatigue: Record<string, number> }) {
  const animated = useAnimated(200);

  // Map arbitrary fatigue/volume to points
  const getV = (muscleKey: string) => Math.min(80, (muscleFatigue[muscleKey] ?? 20) + 20);
  const points = {
    overhead: getV('Shoulders'),
    squat: getV('Quads'),
    deadlift: getV('Hamstrings'),
    pull: getV('Back'),
    bench: getV('Chest')
  };

  // Convert to radar coordinates (0-100 mapped to 50 center)
  const c = 50;
  const scale = 0.45; // max radius 45
  
  const mapPt = (val: number, angle: number) => {
    const r = val * scale;
    const rad = (angle - 90) * (Math.PI / 180);
    return `${c + r * Math.cos(rad)},${c + r * Math.sin(rad)}`;
  };

  const pts = [
    mapPt(points.overhead, 0),
    mapPt(points.squat, 72),
    mapPt(points.deadlift, 144),
    mapPt(points.pull, 216),
    mapPt(points.bench, 288)
  ];
  
  const targetPts = pts.join(' ');
  const startPts = `${c},${c} ${c},${c} ${c},${c} ${c},${c} ${c},${c}`;

  return (
    <svg width="100%" height="98" viewBox="0 0 100 100">
      <polygon points="50,8 90,34 76,86 24,86 10,34" fill="none" stroke="#241F14" strokeWidth="1.2" />
      <polygon points="50,26 72,42 64,72 36,72 28,42" fill="none" stroke="#241F14" strokeWidth="1.2" />
      <polygon 
        points={animated ? targetPts : startPts} 
        fill="rgba(245,196,0,.4)" stroke="#F5C400" strokeWidth="1.6" 
        className="transition-all duration-700 ease-out" 
      />
      <text x="50" y="4" textAnchor="middle" fill="#B0AA9A" fontSize="6.5" fontFamily="Manrope">Overhead</text>
      <text x="94" y="36" textAnchor="start" fill="#B0AA9A" fontSize="6.5" fontFamily="Manrope">Squat</text>
      <text x="76" y="96" textAnchor="middle" fill="#B0AA9A" fontSize="6.5" fontFamily="Manrope">Deadlift</text>
      <text x="24" y="96" textAnchor="middle" fill="#B0AA9A" fontSize="6.5" fontFamily="Manrope">Pull-up</text>
      <text x="6" y="36" textAnchor="end" fill="#B0AA9A" fontSize="6.5" fontFamily="Manrope">Bench</text>
    </svg>
  );
}

function NestedRings({ pPct, cPct, wPct }: { pPct: number, cPct: number, wPct: number }) {
  const animated = useAnimated(250);

  const R1 = 31, R2 = 24, R3 = 17;
  const C1 = 2 * Math.PI * R1;
  const C2 = 2 * Math.PI * R2;
  const C3 = 2 * Math.PI * R3;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={R1} fill="none" stroke="#241F14" strokeWidth="4" />
      <circle 
        cx="36" cy="36" r={R1} fill="none" stroke="#A3E635" strokeWidth="4" strokeLinecap="round" 
        strokeDasharray={C1} strokeDashoffset={animated ? C1 - (C1 * pPct) : C1} className="transition-all duration-1000 ease-[cubic-bezier(.3,.8,.3,1)] origin-center -rotate-90" 
      />
      
      <circle cx="36" cy="36" r={R2} fill="none" stroke="#241F14" strokeWidth="4" />
      <circle 
        cx="36" cy="36" r={R2} fill="none" stroke="#A855F7" strokeWidth="4" strokeLinecap="round" 
        strokeDasharray={C2} strokeDashoffset={animated ? C2 - (C2 * cPct) : C2} className="transition-all duration-1000 ease-[cubic-bezier(.3,.8,.3,1)] origin-center -rotate-90" 
      />
      
      <circle cx="36" cy="36" r={R3} fill="none" stroke="#241F14" strokeWidth="4" />
      <circle 
        cx="36" cy="36" r={R3} fill="none" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" 
        strokeDasharray={C3} strokeDashoffset={animated ? C3 - (C3 * wPct) : C3} className="transition-all duration-1000 ease-[cubic-bezier(.3,.8,.3,1)] origin-center -rotate-90" 
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Live AI Insights Coach
// ═══════════════════════════════════════════════════════════════════════════════
function AIInsightsCard({ stats }: { stats: any }) {
  const [insight, setInsight] = useState('Analyzing your weekly trends...');
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchInsight = async () => {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: "You are FitAI Analytics Coach. Provide a concise 2-sentence insight based on the user's weekly trend. Be highly personalized. Give a clear actionable next step." },
              { role: "user", content: `Workouts this week: ${stats.weeklyWorkoutsCompleted}/${stats.weeklyWorkoutGoal}. Calories burned: ${stats.totalCals}. Score: ${stats.score}.` }
            ]
          })
        });
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        setInsight(data.choices[0].message.content.trim());
      } catch (e) {
        setInsight(`Consistency is improving. Keep hitting those daily macros to optimize your recovery and fuel tomorrow's workout.`);
      }
    };
    fetchInsight();
  }, [stats]);

  return (
    <div className="bg-card border border-border rounded-[20px] p-4 mt-1 mb-[70px] shadow-sm">
      <div className="flex items-center gap-2 mb-2.5 text-brand-cyan">
        <BrainCircuit size={18} />
        <span className="text-[15px] font-extrabold text-white">AI Insights</span>
      </div>
      <div className="text-[12.5px] text-text-secondary leading-relaxed mb-3">
        {insight}
      </div>
      <button className="px-4 py-2.5 rounded-[12px] border border-border/60 bg-white/5 text-white text-[12.5px] font-bold cursor-pointer hover:bg-white/10 transition-colors">
        See Details
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════════
export default function AnalyticsPage() {
  const router = useRouter();
  const state = useFitAIState();
  const hydrated = useFitAIHydrated();
  
  const [activeSegment, setActiveSegment] = useState('7D');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!hydrated) return <div className="min-h-screen bg-black" />;

  const { workouts, dashboard, recovery, nutrition, profile } = state;
  const { workoutStreak, weeklyWorkoutsCompleted, weeklyWorkoutGoal } = dashboard;
  const history = workouts.history;

  // Compute 7D calories
  const last7Cals = getTrailing7DaysCalories(history);
  const totalCalsWeek = last7Cals.reduce((a, b) => a + b, 0);

  // Compute Nutrition Compliance
  const activeDayMeals = nutrition.days.find(d => d.dayKey === nutrition.activeDay)?.meals || [];
  const logged = calculateLoggedMacroTotals(activeDayMeals);
  const t = nutrition.targets;
  const pPct = t.protein > 0 ? Math.min(logged.protein / t.protein, 1) : 0;
  const cPct = t.calories > 0 ? Math.min(logged.calories / t.calories, 1) : 0;
  const wPct = dashboard.maxWaterGlasses > 0 ? Math.min(dashboard.waterGlasses / dashboard.maxWaterGlasses, 1) : 0;

  const handleSegmentClick = (seg: string) => {
    if (seg === '7D') {
      setActiveSegment(seg);
    } else {
      setToastMessage(`Need more historical data to unlock ${seg} insights.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-start justify-center font-sans text-white">
      <div className="relative w-full max-w-[390px] min-h-screen bg-background overflow-hidden border-x border-black shadow-[0_50px_100px_-25px_rgba(0,0,0,0.9)] rounded-[52px]">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[26px] bg-black rounded-b-[18px] z-50"></div>
        
        {/* Status Bar */}
        <div className="flex justify-between items-center px-6 pt-4 pb-1 text-[15px] font-bold">
          <span>9:41</span>
          <div className="flex gap-[5px] items-center">
            <Activity size={14} /> <ChevronLeft size={14} className="rotate-90" />
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-border text-white text-[11.5px] font-bold px-4 py-2.5 rounded-full z-[60] animate-in slide-in-from-top-4 fade-in duration-300 shadow-xl whitespace-nowrap">
            {toastMessage}
          </div>
        )}

        <div className="h-[calc(100%-34px)] overflow-y-auto scrollbar-none px-5 pb-[100px]">
          
          {/* Topbar */}
          <div className="flex justify-between items-center my-2.5 mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="w-[34px] h-[34px] flex items-center justify-center text-text-secondary hover:text-white transition-colors">
                <ChevronLeft size={24} strokeWidth={2.3} />
              </button>
              <h1 className="text-[19px] font-extrabold text-white">Progress & Analytics</h1>
            </div>
            <div className="flex gap-2.5 items-center">
              <div className="w-[38px] h-[38px] rounded-xl bg-card flex items-center justify-center text-text-secondary">
                <Calendar size={18} strokeWidth={2} />
              </div>
              <div 
                className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center font-extrabold text-[13px] text-white cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-sm"
                onClick={() => router.push('/profile')}
              >
                {(profile.name ? profile.name.split(' ')[0] : 'Athlete').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Segment Filter */}
          <div className="flex bg-card border border-border rounded-[14px] p-1 mb-4">
            {['7D', '30D', '90D', '1Y'].map(seg => (
              <span 
                key={seg} 
                onClick={() => handleSegmentClick(seg)}
                className={`flex-1 text-center py-2 rounded-[10px] text-[12px] font-bold cursor-pointer transition-all duration-200 ${activeSegment === seg ? 'bg-gradient-to-br from-[#F5C400] to-[#FFD60A] text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
              >
                {seg}
              </span>
            ))}
          </div>

          {/* Fitness Score Ring */}
          <ScoreRing score={recovery.neuralScore} streak={workoutStreak} completed={weeklyWorkoutsCompleted} goal={weeklyWorkoutGoal} />

          {/* Mini Grids */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            
            {/* Weight Progress */}
            <div className="bg-card border border-border rounded-[18px] p-3.5">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[12.5px] font-bold text-white">Weight Progress</h4>
                <span className="text-[10.5px] font-bold text-status-green">↓ 0.8 kg</span>
              </div>
              <div className="text-[19px] font-extrabold mb-1">
                {profile.weight || 68.4} <small className="text-[12px] text-text-secondary font-semibold">kg</small>
              </div>
              <svg width="100%" height="46" viewBox="0 0 150 46" preserveAspectRatio="none" className="my-1">
                <polyline points="0,18 20,24 40,12 60,20 80,8 100,16 120,6 150,14" fill="none" stroke="#FFB300" strokeWidth="2.2" />
              </svg>
              <div className="flex justify-between text-[9px] text-text-secondary font-medium">
                <span>Start</span><span>Mid</span><span>Now</span>
              </div>
            </div>

            {/* Strength Radar */}
            <div className="bg-card border border-border rounded-[18px] p-3.5">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-[12.5px] font-bold text-white">Strength Trend</h4>
                <span className="text-[10.5px] font-bold text-status-green">+12%</span>
              </div>
              <RadarChart muscleFatigue={recovery.muscleFatigue} />
            </div>

            {/* Workout Completion */}
            <div className="bg-card border border-border rounded-[18px] p-3.5">
              <div className="mb-2"><h4 className="text-[12.5px] font-bold text-white">Workout Completion</h4></div>
              <DonutCompletion completed={weeklyWorkoutsCompleted} goal={weeklyWorkoutGoal} />
              <div className="flex flex-col gap-1.5 text-[10px] text-text-secondary font-medium mt-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04]" />Completed</span>
                  <b className="text-white text-[11px]">{weeklyWorkoutsCompleted}</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-status-red" />Missed</span>
                  <b className="text-white text-[11px]">{Math.max(0, weeklyWorkoutGoal - weeklyWorkoutsCompleted)}</b>
                </div>
              </div>
            </div>

            {/* Calories Burned Bar Chart */}
            <div className="bg-card border border-border rounded-[18px] p-3.5 flex flex-col justify-between">
              <div>
                <h4 className="text-[12.5px] font-bold text-white mb-0.5">Calories Burned</h4>
                <div className="text-[10.5px] text-text-secondary font-medium mb-1.5">Avg {Math.round(totalCalsWeek/7)} kcal</div>
              </div>
              <CalorieBars data={last7Cals} />
              <div className="flex justify-between text-[9px] text-text-secondary font-bold mt-1.5">
                {DAY_ABBR.map((d,i) => <span key={i}>{d}</span>)}
              </div>
            </div>

            {/* Recovery Trend */}
            <div className="bg-card border border-border rounded-[18px] p-3.5">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-[12.5px] font-bold text-white">Recovery Trend</h4>
                <span className="text-[10.5px] font-bold text-status-green">+ Good</span>
              </div>
              <svg width="100%" height="46" viewBox="0 0 150 46" preserveAspectRatio="none" className="mt-4 mb-2">
                <polyline points="0,30 20,20 40,26 60,12 80,18 100,6 120,14 150,4" fill="none" stroke="#A3E635" strokeWidth="2.2" />
              </svg>
              <div className="flex justify-between text-[9px] text-text-secondary font-medium">
                <span>W1</span><span>W2</span><span>W3</span>
              </div>
            </div>

            {/* Nutrition Compliance */}
            <div className="bg-card border border-border rounded-[18px] p-3.5">
              <div className="mb-2"><h4 className="text-[12.5px] font-bold text-white">Nutrition Compliance</h4></div>
              <div className="flex justify-center items-center mt-1"><NestedRings pPct={pPct} cPct={cPct} wPct={wPct} /></div>
              <div className="flex justify-around mt-2">
                <div className="text-center text-[9.5px] text-text-secondary leading-tight"><b className="block text-[11px] text-status-green font-extrabold">{Math.round(pPct*100)}%</b>Pro</div>
                <div className="text-center text-[9.5px] text-text-secondary leading-tight"><b className="block text-[11px] text-brand-purple font-extrabold">{Math.round(cPct*100)}%</b>Cal</div>
                <div className="text-center text-[9.5px] text-text-secondary leading-tight"><b className="block text-[11px] text-brand-cyan font-extrabold">{Math.round(wPct*100)}%</b>H2O</div>
              </div>
            </div>
            
          </div>

          {/* Achievements Row */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[16px] font-bold text-white">Achievements</h3>
            <span className="text-[12.5px] font-bold text-[#F5C400]">View All</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none mb-3">
            {[
              { num: dashboard.totalWorkouts, t: 'Workouts', c: 'from-[#FFD60A] to-[#CA8A04]', icon: Dumbbell },
              { num: '5KG', t: 'Lost', c: 'from-[#FB923C] to-[#C2410C]', icon: Flame },
              { num: dashboard.workoutStreak, t: 'Day Streak', c: 'from-[#F97316] to-[#B91C1C]', icon: Sparkles },
              { num: '1', t: 'New PR', c: 'from-[#CA8A04] to-[#78350F]', icon: Target },
            ].map((a, i) => (
              <div key={i} className="flex-shrink-0 w-[88px] text-center">
                <div className={`w-16 h-16 mx-auto mb-2 flex flex-col items-center justify-center bg-gradient-to-br ${a.c} shadow-md`} style={{ clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' }}>
                  <a.icon size={18} className="text-white mb-0.5" />
                  <span className="text-[12px] font-extrabold text-white leading-none">{a.num}</span>
                </div>
                <div className="text-[11px] font-bold text-text-secondary">{a.t}</div>
              </div>
            ))}
          </div>

          <AIInsightsCard stats={{ weeklyWorkoutsCompleted, weeklyWorkoutGoal, totalCals: totalCalsWeek, score: recovery.neuralScore }} />

        </div>
        <BottomNav />
      </div>
    </div>
  );
}