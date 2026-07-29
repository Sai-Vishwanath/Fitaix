'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  Activity,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Droplets,
  Flame,
  Minus,
  Plus,
  ScanLine,
  Sparkles,
  Trophy,
  UtensilsCrossed,
  Clock,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import { Header } from '../ui/Header';
import { BottomNav } from '../ui/BottomNav';
import { RingProgress } from '../ui/RingProgress';
import { WorkoutModal } from '../ui/WorkoutModal';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface NotifItem {
  id:        string;
  title:     string;
  body:      string;
  time:      string;
  unread:    boolean;
  dismissed: boolean;
  Icon:      LucideIcon;
  iconBg:    string;
  iconColor: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Static Data
// ═══════════════════════════════════════════════════════════════════════════════

const WEEK_DAYS = [
  { key: 'Mon', date: 16, hasMarker: true,  isToday: true  },
  { key: 'Tue', date: 17, hasMarker: true,  isToday: false },
  { key: 'Wed', date: 18, hasMarker: true,  isToday: false },
  { key: 'Thu', date: 19, hasMarker: true,  isToday: false },
  { key: 'Fri', date: 20, hasMarker: false, isToday: false },
  { key: 'Sat', date: 21, hasMarker: false, isToday: false },
  { key: 'Sun', date: 22, hasMarker: false, isToday: false },
] as const;

const STREAK_DAYS = [
  { abbr: 'M', done: true  },
  { abbr: 'T', done: true  },
  { abbr: 'W', done: true  },
  { abbr: 'T', done: true  },
  { abbr: 'F', done: false },
];

const NUTRITION_RINGS = [
  { label: 'Calories', progress: 0.72, color: '#F59E0B', display: '1.6k' },
  { label: 'Protein',  progress: 0.92, color: '#A3E635', display: '92%'  },
  { label: 'Carbs',    progress: 0.58, color: '#F5C400', display: '58%'  },
] as const;

const ACTIVITY_ITEMS = [
  {
    Icon:      Dumbbell,
    iconBg:    'bg-brand-purple/15',
    iconColor: 'text-brand-purple',
    title:     'Completed Pull Day',
    sub:       '6 exercises · 380 kcal',
    time:      'Yesterday',
  },
  {
    Icon:      CheckCircle2,
    iconBg:    'bg-status-green/15',
    iconColor: 'text-status-green',
    title:     'Hit Protein Goal',
    sub:       '142g logged',
    time:      'Yesterday',
  },
  {
    Icon:      Flame,
    iconBg:    'bg-status-amber/15',
    iconColor: 'text-status-amber',
    title:     'New PR: Bench 90kg',
    sub:       '+5kg from last month',
    time:      '2 days ago',
  },
] as const;

const LEADERBOARD = [
  {
    rank:        '1',
    name:        'Arjun',
    sub:         '32 workouts',
    score:       '2,840',
    initial:     'A',
    avatarClass: 'bg-gradient-to-br from-amber-400 to-amber-700',
    rowClass:    '',
    rankClass:   'text-status-amber',
    isMe:        false,
  },
  {
    rank:        '2',
    name:        'You',
    sub:         '28 workouts',
    score:       '2,610',
    initial:     'P',
    avatarClass: 'bg-gradient-to-br from-brand-pink to-brand-purple',
    rowClass:    'bg-brand-purple/10 rounded-xl mx-[-8px] px-2',
    rankClass:   'text-text-secondary',
    isMe:        true,
  },
  {
    rank:        '3',
    name:        'Sara',
    sub:         '25 workouts',
    score:       '2,340',
    initial:     'S',
    avatarClass: 'bg-gradient-to-br from-brand-blue to-brand-cyan',
    rowClass:    '',
    rankClass:   'text-text-secondary',
    isMe:        false,
  },
] as const;

const QUICK_ACTIONS = [
  { Icon: Dumbbell,        label: 'Log Workout', iconColor: 'text-brand-purple'  },
  { Icon: UtensilsCrossed, label: 'Log Meal',    iconColor: 'text-status-amber'  },
  { Icon: Droplets,        label: 'Add Water',   iconColor: 'text-brand-cyan'    },
  { Icon: ScanLine,        label: 'Scan Food',   iconColor: 'text-status-green'  },
] as const;

const CHALLENGES = [
  {
    Icon:    Trophy,
    pct:     73,
    barClass: 'bg-gradient-to-r from-brand-pink to-brand-purple',
    title:   '30 Workouts in 30 Days',
    meta:    '22/30 · 8 days left',
  },
  {
    Icon:    Droplets,
    pct:     90,
    barClass: 'bg-gradient-to-r from-brand-blue to-brand-cyan',
    title:   'Hydration Streak',
    meta:    '9/10 days · 1 day left',
  },
] as const;

const INITIAL_NOTIFS: NotifItem[] = [
  {
    id: '1', title: 'Your recovery improved 6%',
    body: 'Great sleep last night helped a lot',
    time: '2h', unread: true, dismissed: false,
    Icon: Sparkles, iconBg: 'bg-brand-purple/15', iconColor: 'text-brand-purple',
  },
  {
    id: '2', title: 'Arjun passed your weekly score',
    body: 'Push a bit harder to reclaim #1',
    time: '5h', unread: true, dismissed: false,
    Icon: Trophy, iconBg: 'bg-brand-pink/15', iconColor: 'text-brand-pink',
  },
  {
    id: '3', title: 'Hydration goal hit 3 days straight',
    body: 'Keep the streak going today',
    time: '1d', unread: false, dismissed: false,
    Icon: Droplets, iconBg: 'bg-status-green/15', iconColor: 'text-status-green',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Shared Helper Components
// ═══════════════════════════════════════════════════════════════════════════════

function SectionHeader({
  title,
  action,
  onAction,
  actionNode,
}: {
  title:       string;
  action?:     string;
  onAction?:   () => void;
  actionNode?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center mt-5 mb-2.5">
      <h2 className="text-[15px] font-bold text-text-primary">{title}</h2>
      {actionNode ?? (
        action && (
          <button
            onClick={onAction}
            className="text-[11.5px] text-brand-purple font-bold"
          >
            {action}
          </button>
        )
      )}
    </div>
  );
}

function Card({
  children,
  className = '',
}: {
  children:   React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-border rounded-3xl p-4 ${className}`}>
      {children}
    </div>
  );
}

function useAnimated(delay = 200) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(id);
  }, [delay]);
  return animated;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section Components
// ═══════════════════════════════════════════════════════════════════════════════

function WorkoutBanner() {
  return (
    <button
      className="w-full flex items-center gap-3 rounded-3xl p-3.5 border border-brand-purple/18 text-left"
      style={{ background: 'linear-gradient(120deg, #2a2210, #171310)' }}
    >
      <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
        <Dumbbell size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#D6D0FF] tracking-widest uppercase font-semibold mb-0.5">
          Today's AI Workout
        </p>
        <p className="text-[14.5px] font-extrabold text-white leading-tight">Push Strength</p>
        <p className="text-[10.5px] text-[#D6D0FF] mt-0.5">45 min · 6 exercises</p>
      </div>
      <div className="w-[34px] h-[34px] rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <ChevronRight size={15} className="text-white" />
      </div>
    </button>
  );
}

function RecoveryStreakGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      <div className="bg-card border border-border rounded-3xl p-3.5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11.5px] text-text-secondary font-semibold">Recovery Score</span>
          <Activity size={15} className="text-status-green" />
        </div>
        <div className="flex items-center gap-2.5">
          <RingProgress progress={0.89} color="#A3E635" label="89" />
          <div>
            <p className="text-[14px] font-extrabold text-text-primary">Excellent</p>
            <p className="text-[10px] text-text-secondary mt-0.5">Ready to train</p>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-3xl p-3.5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11.5px] text-text-secondary font-semibold">Workout Streak</span>
          <Flame size={15} className="text-status-amber" />
        </div>
        <p className="text-[19px] font-extrabold text-text-primary leading-tight">
          24 <span className="text-[11px] text-text-secondary font-semibold">days</span>
        </p>
        <div className="flex gap-1.5 mt-2">
          {STREAK_DAYS.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[10px] font-bold ${
                  day.done
                    ? 'bg-gradient-to-br from-status-amber to-orange-700 text-white'
                    : 'bg-card-inset text-text-secondary'
                }`}
              >
                {day.done ? <Check size={11} /> : day.abbr}
              </div>
              <span className="text-[8.5px] text-text-secondary">{day.abbr}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

{/* 🟢 NEW: 15-MINUTE STREAK SAVER SECTION (WHITEBOARD NODE 2) */}
function StreakSaverSection() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [workoutReady, setWorkoutReady] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setWorkoutReady(true);
    }, 1000);
  };

  return (
    <>
      <SectionHeader title="15-Min Streak Saver" />
      <Card className="border-status-amber/30 bg-gradient-to-b from-card to-status-amber/5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-status-amber/20 text-status-amber flex items-center justify-center flex-shrink-0">
            <Clock size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <b className="text-[13px] font-extrabold text-text-primary">Short on time today?</b>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-status-amber/20 text-status-amber">AI EMERGENCY</span>
            </div>
            <p className="text-[10.5px] text-text-secondary mt-0.5">
              Save your 24-day streak with a fast 15-minute workout.
            </p>
          </div>
        </div>

        {workoutReady ? (
          <div className="p-3 bg-card-inset rounded-2xl border border-border space-y-2 mb-3">
            <p className="text-[10px] font-bold text-status-amber uppercase tracking-wider">AI Quick Routine:</p>
            <div className="flex justify-between items-center text-[12px] font-semibold text-text-primary border-b border-border/50 pb-1.5">
              <span>🚶 Brisk Walk</span>
              <span className="text-text-secondary">5 mins</span>
            </div>
            <div className="flex justify-between items-center text-[12px] font-semibold text-text-primary">
              <span>💪 Pushups</span>
              <span className="text-text-secondary">50 reps (3 sets)</span>
            </div>
          </div>
        ) : null}

        <button
          onClick={workoutReady ? () => alert("Streak saved! Great job!") : handleGenerate}
          disabled={isGenerating}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-status-amber to-orange-600 text-white font-bold text-[12px] flex items-center justify-center gap-2 transition-transform active:scale-98"
        >
          {isGenerating ? (
            "Building 15-min Plan..."
          ) : workoutReady ? (
            <><Check size={14} /> Mark as Complete & Save Streak</>
          ) : (
            <><Zap size={14} /> Generate 15-Min Quick Workout</>
          )}
        </button>
      </Card>
    </>
  );
}

type GoalType = { label: string; pct: number; barClass: string; };

function GoalProgressSection({ goals, onManage }: { goals: GoalType[]; onManage: () => void }) {
  const animated = useAnimated();
  return (
    <>
      <SectionHeader title="Goal Progress" action="Manage" onAction={onManage} />
      <Card>
        {goals.map((goal, i) => (
          <div key={i} className={i < goals.length - 1 ? 'mb-3' : ''}>
            <div className="flex justify-between text-[11.5px] mb-1.5">
              <span className="text-text-secondary">{goal.label}</span>
              <b className="font-bold text-text-primary">{goal.pct}%</b>
            </div>
            <div className="h-[7px] bg-card-inset rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${goal.barClass} transition-all duration-1000 ease-out`}
                style={{ width: animated ? `${goal.pct}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

function NutritionSection({ onOpenMealModal }: { onOpenMealModal: () => void }) {
  return (
    <>
      <SectionHeader title="Calories & Nutrition" action="Log Meal" onAction={onOpenMealModal} />
      <Card>
        <div className="flex justify-around items-center">
          {NUTRITION_RINGS.map(ring => (
            <div key={ring.label} className="flex flex-col items-center">
              <RingProgress progress={ring.progress} color={ring.color} label={ring.display} />
              <p className="text-[9.5px] text-text-secondary mt-1.5">{ring.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function WaterSection({ glasses, setGlasses, maxGlasses }: { glasses: number; setGlasses: React.Dispatch<React.SetStateAction<number>>; maxGlasses: number; }) {
  const pct   = Math.round((glasses / maxGlasses) * 100);
  const label = `${(glasses * 0.4).toFixed(1)} / ${(maxGlasses * 0.4).toFixed(1)}L`;

  return (
    <>
      <SectionHeader title="Water Intake" action={label} />
      <Card>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGlasses(g => Math.max(0, g - 1))}
            className="w-8 h-8 rounded-full border border-border bg-card-inset text-text-primary flex items-center justify-center"
          >
            <Minus size={14} />
          </button>
          <div className="flex-1 h-2 bg-card-inset rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <button
            onClick={() => setGlasses(g => Math.min(maxGlasses, g + 1))}
            className="w-8 h-8 rounded-full border border-border bg-card-inset text-text-primary flex items-center justify-center"
          >
            <Plus size={14} />
          </button>
        </div>
      </Card>
    </>
  );
}

function LiveAICoachSection() {
  const [aiResponse, setAiResponse] = useState("Tap the button to ask the coach for a tip.");
  const [isThinking, setIsThinking] = useState(false);

  const handleTestCoach = async () => {
    setIsThinking(true);
    setAiResponse("FitAI Pro is analyzing your data...");
    
    // Fake delay to simulate AI thinking before we connect the real backend!
    setTimeout(() => {
      setAiResponse("Based on your 89% recovery, push hard today but add 10 mins of stretching post-workout!");
      setIsThinking(false);
    }, 1500);
  };

  return (
    <>
      <SectionHeader title="Live AI Coach" />
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-purple/15 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-brand-purple" />
          </div>
          <p className="text-[13px] text-text-secondary italic flex-1 mt-1">
            "{aiResponse}"
          </p>
        </div>
        <button 
          onClick={handleTestCoach}
          disabled={isThinking}
          className="w-full py-3 rounded-xl bg-gradient-to-br from-brand-purple to-brand-pink text-background font-extrabold text-[14px] disabled:opacity-50 transition-all hover:scale-[1.02]"
        >
          {isThinking ? "Consulting AI..." : "Ask Coach for a Tip"}
        </button>
      </Card>
    </>
  );
}

function WeeklyCalendarSection({ selectedDay, setSelectedDay }: { selectedDay: string; setSelectedDay: (d: string) => void; }) {
  return (
    <>
      <SectionHeader title="Weekly Calendar" />
      <Card>
        <div className="flex justify-between">
          {WEEK_DAYS.map(day => {
            const isSelected = selectedDay === day.key;
            return (
              <button
                key={day.key}
                onClick={() => setSelectedDay(day.key)}
                className={[
                  'flex-1 flex flex-col items-center py-2.5 px-0.5 rounded-2xl transition-all duration-200',
                  isSelected ? 'bg-gradient-to-b from-brand-purple to-brand-violet' : day.isToday ? 'bg-card-inset' : '',
                ].join(' ')}
              >
                <span className={`text-[9.5px] mb-1.5 font-medium ${isSelected ? 'text-white' : 'text-text-secondary'}`}>
                  {day.key}
                </span>
                <span className={`text-[13px] font-bold ${isSelected ? 'text-white' : 'text-text-primary'}`}>
                  {day.date}
                </span>
                {day.hasMarker && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-white/50' : 'bg-brand-purple'}`} />
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </>
  );
}

function ActivitySection() {
  return (
    <>
      <SectionHeader title="Recent Activity" action="View All" />
      <Card>
        {ACTIVITY_ITEMS.map((item, i) => (
          <div key={i} className={`flex items-center gap-2.5 py-2.5 ${i < ACTIVITY_ITEMS.length - 1 ? 'border-b border-border' : ''}`}>
            <div className={`w-[34px] h-[34px] rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
              <item.Icon size={16} className={item.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <b className="text-[12px] font-bold text-text-primary block">{item.title}</b>
              <span className="text-[10px] text-text-secondary">{item.sub}</span>
            </div>
            <span className="text-[10px] text-text-secondary flex-shrink-0">{item.time}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

function LeaderboardSection({ userName }: { userName: string }) {
  const dynamicInitial = userName ? userName.charAt(0).toUpperCase() : 'P';
  
  return (
    <>
      <SectionHeader title="Leaderboard" action="Friends" />
      <Card>
        {LEADERBOARD.map((entry, i) => (
          <div key={i} className={`flex items-center gap-2.5 py-2 ${entry.rowClass}`}>
            <span className={`w-5 text-[12px] font-extrabold text-center flex-shrink-0 ${entry.rankClass}`}>{entry.rank}</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-background flex-shrink-0 ${entry.avatarClass}`}>
              {entry.isMe ? dynamicInitial : entry.initial}
            </div>
            <div className="flex-1 min-w-0">
              <b className="text-xs font-bold text-text-primary block">{entry.name}</b>
              <span className="text-[9.5px] text-text-secondary">{entry.sub}</span>
            </div>
            <span className="text-xs font-extrabold text-brand-purple">{entry.score}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

function QuickActionsSection({ 
  onOpenMealModal, 
  onOpenWorkoutModal, 
  onOpenScanModal, 
  onAddWater 
}: { 
  onOpenMealModal: () => void;
  onOpenWorkoutModal: () => void;
  onOpenScanModal: () => void;
  onAddWater: () => void;
}) {
  const [tapped, setTapped] = useState<number | null>(null);
  
  const handleTap = (i: number, label: string) => { 
    setTapped(i); 
    setTimeout(() => setTapped(null), 150); 
    
    if (label === 'Log Meal') onOpenMealModal();
    if (label === 'Log Workout') onOpenWorkoutModal();
    if (label === 'Scan Food') onOpenScanModal();
    if (label === 'Add Water') onAddWater();
  };

  return (
    <>
      <SectionHeader title="Quick Actions" />
      <Card>
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map((action, i) => (
            <button key={action.label} onClick={() => handleTap(i, action.label)} className="flex flex-col items-center text-center">
              <div className={['w-[52px] h-[52px] rounded-2xl bg-card-inset flex items-center justify-center mx-auto mb-1.5', 'transition-transform duration-150', action.iconColor, tapped === i ? 'scale-90' : 'scale-100 hover:scale-105'].join(' ')}>
                <action.Icon size={22} />
              </div>
              <span className="text-[9.5px] text-text-secondary font-semibold leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </>
  );
}

function LiveStatsSection() {
  const stats = [
    { value: '6,240', label: 'Steps'      },
    { value: '42',    label: 'Active Min' },
    { value: '78',    label: 'BPM Now'    },
  ];
  return (
    <>
      <SectionHeader
        title="Live Statistics"
        actionNode={
          <span className="flex items-center gap-1.5 text-[11.5px] text-brand-purple font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse-dot" />
            Live
          </span>
        }
      />
      <Card>
        <div className="flex justify-around text-center">
          {stats.map(stat => (
            <div key={stat.label}>
              <p className="text-[17px] font-extrabold text-text-primary">{stat.value}</p>
              <p className="text-[9.5px] text-text-secondary mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function ChallengesSection() {
  const animated = useAnimated();
  return (
    <>
      <SectionHeader title="Active Challenges" action="Browse" />
      <Card>
        {CHALLENGES.map((c, i) => (
          <div key={i} className={`flex items-center gap-3 ${i < CHALLENGES.length - 1 ? 'mb-3' : ''}`}>
            <div className="w-10 h-10 rounded-2xl bg-brand-pink/15 text-brand-pink flex items-center justify-center flex-shrink-0">
              <c.Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <b className="text-xs font-bold text-text-primary block mb-1">{c.title}</b>
              <div className="h-1.5 bg-card-inset rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ease-out ${c.barClass}`} style={{ width: animated ? `${c.pct}%` : '0%' }} />
              </div>
              <span className="text-[9.5px] text-text-secondary mt-1 block">{c.meta}</span>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

function NotificationsSection({ notifs, setNotifs }: { notifs: NotifItem[]; setNotifs: React.Dispatch<React.SetStateAction<NotifItem[]>>; }) {
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  const clearAll = () => {
    setNotifs(prev => prev.map(n => ({ ...n, dismissed: true })));
    setTimeout(() => { setNotifs(prev => prev.map(n => ({ ...n, unread: false }))); }, 300);
  };
  const visible = notifs.filter(n => !n.dismissed);

  return (
    <>
      <SectionHeader title="Notifications" action="Clear All" onAction={clearAll} />
      <Card>
        {visible.length === 0 ? (
          <p className="text-center text-xs text-text-secondary py-2">All caught up! 🎉</p>
        ) : (
          visible.map((notif, i) => (
            <button key={notif.id} onClick={() => markRead(notif.id)} className={['flex items-start gap-2.5 py-2.5 w-full text-left relative', 'transition-opacity duration-300', notif.dismissed ? 'opacity-0 pointer-events-none' : 'opacity-100', i < visible.length - 1 ? 'border-b border-border' : ''].join(' ')}>
              {notif.unread && <span className="absolute -left-2 top-4 w-1.5 h-1.5 rounded-full bg-brand-purple" />}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.iconBg}`}>
                <notif.Icon size={15} className={notif.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <b className="text-[11.5px] font-bold text-text-primary block">{notif.title}</b>
                <span className="text-[10px] text-text-secondary">{notif.body}</span>
              </div>
              <span className="text-[9.5px] text-text-secondary flex-shrink-0 pt-0.5">{notif.time}</span>
            </button>
          ))
        )}
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════════════════════

export function DashboardPage() {
  const router = useRouter();

  const [glasses,   setGlasses]       = useState<number>(4.5);
  const [selectedDay, setSelectedDay] = useState<string>('Wed');
  const [notifs, setNotifs]           = useState<NotifItem[]>(INITIAL_NOTIFS);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goals, setGoals] = useState([
    { label: 'Lose 5kg',   pct: 64, barClass: 'bg-brand-purple' },
    { label: 'Bench 90kg', pct: 81, barClass: 'bg-brand-blue'   },
    { label: 'Run 10km',   pct: 42, barClass: 'bg-brand-cyan'   },
  ]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editGoalText, setEditGoalText] = useState('');

  const unreadCount = notifs.filter(n => n.unread && !n.dismissed).length;

  const [userName, setUserName] = useState('Priyanshi');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-start justify-center font-sans">
      <div className="relative w-full max-w-[390px] min-h-screen bg-background overflow-hidden">
        <div className="h-screen overflow-y-auto scrollbar-none px-5 pt-6 pb-28">

          <Header name={userName} notificationCount={unreadCount} />

          <WorkoutBanner />
          <RecoveryStreakGrid />
          
          {/* 🟢 DROPPED 15-MIN STREAK SAVER HERE */}
          <StreakSaverSection />

          <GoalProgressSection goals={goals} onManage={() => setIsGoalModalOpen(true)} />
          
          <NutritionSection onOpenMealModal={() => router.push('/nutrition')} />
          
          <WaterSection glasses={glasses} setGlasses={setGlasses} maxGlasses={7} />
          
          <LiveAICoachSection />
          
          <WeeklyCalendarSection selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
          <ActivitySection />
          
          <LeaderboardSection userName={userName} />
          
          <QuickActionsSection 
            onOpenMealModal={() => router.push('/nutrition')} 
            onOpenWorkoutModal={() => setIsWorkoutModalOpen(true)}
            onOpenScanModal={() => setIsScanModalOpen(true)}
            onAddWater={() => setGlasses(g => Math.min(7, g + 1))} 
          />
          <LiveStatsSection />
          <ChallengesSection />
          <NotificationsSection notifs={notifs} setNotifs={setNotifs} />

          <div className="h-4" aria-hidden="true" />
        </div>

        <WorkoutModal 
          isOpen={isWorkoutModalOpen} 
          onClose={() => setIsWorkoutModalOpen(false)} 
        />

        {/* --- SCAN FOOD MODAL --- */}
        {isScanModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm p-6 bg-background rounded-3xl border border-border shadow-2xl text-center">
              <div className="w-16 h-16 bg-brand-purple/20 text-brand-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <ScanLine size={32} />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Camera Access Required</h2>
              <p className="text-sm text-text-secondary mb-6">FitAI needs camera access to scan your food and calculate macros automatically.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsScanModalOpen(false)}
                  className="flex-1 py-3 bg-text-secondary/20 hover:bg-text-secondary/30 text-text-primary rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setIsScanModalOpen(false)}
                  className="flex-1 py-3 bg-gradient-to-br from-status-green to-emerald-600 text-white rounded-xl font-semibold transition-colors hover:scale-[1.02]"
                >
                  Open Camera
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MANAGE GOALS MODAL --- */}
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm p-6 bg-background rounded-3xl border border-border shadow-2xl">
              <h2 className="text-xl font-bold text-text-primary mb-2">Manage Goals</h2>

              {editingIndex !== null ? (
                <>
                  <p className="text-sm text-text-secondary mb-6">Rename your target.</p>
                  <input
                    type="text"
                    value={editGoalText}
                    onChange={(e) => setEditGoalText(e.target.value)}
                    className="w-full p-4 bg-card-inset border border-border rounded-xl mb-6 text-text-primary focus:outline-none focus:border-brand-purple"
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setEditingIndex(null)}
                      className="flex-1 py-3 bg-text-secondary/20 hover:bg-text-secondary/30 text-text-primary rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        const newGoals = [...goals];
                        newGoals[editingIndex].label = editGoalText;
                        setGoals(newGoals);
                        setEditingIndex(null);
                      }}
                      className="flex-1 py-3 bg-gradient-to-br from-brand-purple to-brand-pink text-white rounded-xl font-semibold hover:scale-[1.02]"
                    >
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-text-secondary mb-6">Adjust your current fitness targets.</p>
                  <div className="space-y-4 mb-6">
                    {goals.map((goal, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-card-inset rounded-xl border border-border">
                        <span className="text-sm font-semibold text-text-primary">{goal.label}</span>
                        <button 
                          onClick={() => {
                            setEditingIndex(index);
                            setEditGoalText(goal.label);
                          }}
                          className="text-xs font-bold text-brand-purple"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                    <button className="w-full p-3 border border-dashed border-border rounded-xl text-sm font-semibold text-text-secondary hover:text-brand-purple hover:border-brand-purple transition-colors">
                      + Add New Goal
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      setIsGoalModalOpen(false);
                      setEditingIndex(null);
                    }}
                    className="w-full py-3 bg-gradient-to-br from-brand-purple to-brand-pink text-white rounded-xl font-semibold transition-colors hover:scale-[1.02]"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <BottomNav onAddClick={() => setIsWorkoutModalOpen(true)} />
      </div>
    </div>
  );
}

export default DashboardPage;