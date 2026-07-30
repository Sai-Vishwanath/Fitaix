'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bell,
  Info,
  Moon,
  Heart,
  Droplets,
  Zap,
  HelpCircle,
  Check,
  Star,
  ChevronRight,
  Activity,
  AlignJustify,
  Beef,
  FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ── Reused project components ──────────────────────────────────────────────────
import { BottomNav }   from '../ui/BottomNav';
import { RingProgress } from '../ui/RingProgress';
import { WorkoutModal } from '../ui/WorkoutModal';

import { useFitAIState, useFitAIHydrated } from '../../lib/FitAIContext';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

type TabKey = 'body' | 'advice';

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function useAnimated(delay = 250): boolean {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(id);
  }, [delay]);
  return animated;
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Moderate';
  return 'Low';
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#A3E635'; // green
  if (score >= 70) return '#FBBF24'; // amber
  if (score >= 50) return '#F59E0B'; // orange
  return '#EF4444';                  // red
}

function getReadinessText(score: number): string {
  if (score >= 85) return 'Ready to Train';
  if (score >= 70) return 'Train at Moderate Intensity';
  if (score >= 50) return 'Light Activity Recommended';
  return 'Rest & Recovery Day';
}

function fatigueToColor(fatigue: number): string {
  if (fatigue >= 60) return '#EF4444'; // red
  if (fatigue >= 35) return '#F59E0B'; // amber
  return '#A3E635';                    // green
}

const SLEEP_BAR_HEIGHTS = [40, 70, 55, 85, 60, 75] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════════════════════

function PageTopBar() {
  const state = useFitAIState();
  const router = useRouter();
  const hydrated = useFitAIHydrated();
  const name = hydrated && state.profile.name ? state.profile.name.split(' ')[0] : 'User';

  return (
    <div className="flex justify-between items-center mt-2.5 mb-4">
      <h1 className="text-[19px] font-extrabold text-text-primary">
        Recovery &amp; Health
      </h1>
      <div className="flex gap-2.5 items-center">
        <button onClick={() => alert('Help information coming soon!')} aria-label="Help information" className="w-[38px] h-[38px] rounded-xl bg-card flex items-center justify-center text-text-secondary active:scale-95 transition-transform">
          <Info size={17} aria-hidden="true" />
        </button>
        <button onClick={() => alert('No new notifications')} aria-label="Notifications" className="w-[38px] h-[38px] rounded-xl bg-card flex items-center justify-center text-text-secondary active:scale-95 transition-transform">
          <Bell size={17} aria-hidden="true" />
        </button>
        <div 
          className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center font-extrabold text-[13px] text-white cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-sm"
          onClick={() => router.push('/profile')}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
}

function RecoveryHero({ neuralScore }: { neuralScore: number }) {
  const scoreColor = getScoreColor(neuralScore);
  const scoreLabel = getScoreLabel(neuralScore);
  const readiness  = getReadinessText(neuralScore);

  const bodyText = neuralScore >= 85
    ? 'Your body is recovered and primed for performance.'
    : neuralScore >= 70
    ? 'Your body is mostly recovered. Train at a moderate level.'
    : neuralScore >= 50
    ? 'Some fatigue detected. Keep intensity moderate today.'
    : 'High fatigue detected. Prioritize rest and mobility work.';

  return (
    <section className="relative rounded-3xl overflow-hidden mb-4 p-5 border border-brand-purple/20 flex items-center gap-2.5" style={{ background: 'linear-gradient(120deg, #111111 0%, #191919 100%)' }}>
      <div className="flex-shrink-0">
        <p className="text-[13.5px] font-bold text-brand-cyan mb-2.5">Recovery Score</p>
        <div className="relative w-[112px] h-[112px]">
          <RingProgress progress={neuralScore / 100} size={112} strokeWidth={11} color={scoreColor} trackColor="rgba(255,255,255,0.08)" />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[25px] font-extrabold text-text-primary leading-none">{neuralScore}%</span>
            <span className="text-[11px] font-bold mt-0.5" style={{ color: scoreColor }}>{scoreLabel}</span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium mb-0.5" style={{ color: '#BFEFDD' }}>Status</p>
        <p className="text-[15px] font-extrabold text-text-primary mb-1.5">{readiness}</p>
        <p className="text-[10.5px] leading-relaxed" style={{ color: '#D9CBA0' }}>{bodyText}</p>
      </div>
      <div className="flex-shrink-0 animate-breathe" aria-hidden="true">
        <svg viewBox="0 0 80 100" fill="none" width="52" height="66">
          <defs>
            <linearGradient id="figGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={scoreColor} />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="16" r="10"  fill="url(#figGrad)" opacity="0.9" />
          <circle cx="40" cy="16" r="3.5" fill="#FFD60A" />
          <path d="M40 26v18" stroke="url(#figGrad)" strokeWidth="7" strokeLinecap="round" />
          <path d="M40 34c-10 0-20 6-24 16M40 34c10 0 20 6 24 16" stroke="url(#figGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M16 50c-4 6-4 14 6 16M64 50c4 6 4 14-6 16" stroke="url(#figGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M22 66c8 8 28 8 36 0" stroke="url(#figGrad)" strokeWidth="7" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    </section>
  );
}

function MiniStatsGrid({ animated, waterGlasses, maxWaterGlasses, sleepMinutes }: {
  animated: boolean; waterGlasses: number; maxWaterGlasses: number; sleepMinutes: number;
}) {
  const waterPct = Math.round((waterGlasses / maxWaterGlasses) * 100);
  const waterL   = (waterGlasses * 0.4).toFixed(1);
  const sleepH = Math.floor(sleepMinutes / 60);
  const sleepM = sleepMinutes % 60;
  const isGoodSleep = sleepMinutes >= 420;

  return (
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div className="bg-card border border-border rounded-3xl p-3.5">
        <div className="flex items-center gap-1.5 mb-2 text-[12px] font-bold text-text-secondary">
          <Moon size={15} className="text-brand-purple" aria-hidden="true" /> Sleep
        </div>
        <p className="text-[17px] font-extrabold text-text-primary">{sleepH}h {sleepM}m</p>
        <p className={`text-[10.5px] font-bold mt-0.5 ${isGoodSleep ? 'text-status-green' : 'text-status-amber'}`}>
          {isGoodSleep ? 'Good' : 'Needs attention'}
        </p>
        <div className="flex items-end gap-[3px] h-5 mt-2" aria-hidden="true">
          {SLEEP_BAR_HEIGHTS.map((h, i) => (
            <div key={i} className="flex-1 bg-brand-purple rounded-[2px] opacity-80" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-3xl p-3.5">
        <div className="flex items-center gap-1.5 mb-2 text-[12px] font-bold text-text-secondary">
          <Heart size={15} fill="#EF4444" stroke="none" aria-hidden="true" /> Heart Rate
        </div>
        <p className="text-[17px] font-extrabold text-text-primary">62 bpm</p>
        <p className="text-[10.5px] text-text-secondary mt-0.5">Resting</p>
        <svg className="w-full mt-1.5" viewBox="0 0 140 20" preserveAspectRatio="none" height="20" aria-hidden="true">
          <polyline points="0,10 15,10 20,2 25,16 30,10 45,10 55,10 60,4 65,15 70,10 85,10 95,10 100,3 105,16 110,10 125,10 135,10" fill="none" stroke="#EF4444" strokeWidth="1.6" />
        </svg>
      </div>
      <div className="bg-card border border-border rounded-3xl p-3.5">
        <div className="flex items-center gap-1.5 mb-2 text-[12px] font-bold text-text-secondary">
          <Droplets size={15} className="text-brand-blue" aria-hidden="true" /> Water Intake
        </div>
        <p className="text-[17px] font-extrabold text-text-primary">{waterL} L</p>
        <p className="text-[10.5px] text-text-secondary mt-0.5">{waterPct}%</p>
        <div className="h-1.5 bg-[#232C3F] rounded-full mt-2 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan transition-all duration-1000 ease-out" style={{ width: animated ? `${waterPct}%` : '0%' }} />
        </div>
      </div>
      <div className="bg-card border border-border rounded-3xl p-3.5">
        <div className="flex items-center gap-1.5 mb-2 text-[12px] font-bold text-text-secondary">
          <Zap size={15} className="text-status-amber" aria-hidden="true" /> Stress
        </div>
        <p className="text-[17px] font-extrabold text-status-amber">Moderate</p>
        <p className="text-[10.5px] text-text-secondary mt-0.5">42/100</p>
        <div className="h-1.5 bg-[#232C3F] rounded-full mt-2 overflow-hidden">
          <div className="h-full rounded-full bg-status-amber transition-all duration-1000 ease-out" style={{ width: animated ? '42%' : '0%' }} />
        </div>
      </div>
    </div>
  );
}

function RecoveryTimeline({ neuralScore }: { neuralScore: number }) {
  const steps = useMemo(() => [
    { label: 'Today', value: `${neuralScore}%`, dotClass: neuralScore >= 70 ? 'bg-status-green' : 'bg-status-amber', textClass: neuralScore >= 70 ? 'text-status-green' : 'text-status-amber', isDone: true },
    { label: 'Tomorrow', value: `${Math.min(100, Math.round(neuralScore + (100 - neuralScore) * 0.35))}%`, dotClass: 'bg-brand-blue', textClass: 'text-brand-blue', isDone: false },
    { label: '2 Days', value: `${Math.min(100, Math.round(neuralScore + (100 - neuralScore) * 0.65))}%`, dotClass: 'bg-brand-blue', textClass: 'text-brand-blue', isDone: false },
    { label: 'Full Recovery', value: '100%', dotClass: 'bg-brand-purple', textClass: 'text-brand-purple', isDone: false },
  ], [neuralScore]);

  return (
    <div className="bg-card border border-border rounded-3xl p-4 mb-3">
      <div className="flex items-center gap-1.5 mb-3.5 text-[14.5px] font-bold text-text-primary">
        Recovery Timeline <HelpCircle size={14} className="text-text-secondary" aria-hidden="true" />
      </div>
      <div className="relative flex justify-between" role="list">
        <div className="absolute top-3 left-3 right-3 h-0.5" style={{ background: 'linear-gradient(90deg, #A3E635, #CA8A04, #F5C400)' }} aria-hidden="true" />
        {steps.map((step, i) => (
          <div key={i} className="flex-1 flex flex-col items-center relative z-10">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] border-background mb-2 ${step.dotClass}`}>
              {step.isDone ? <Check size={11} className="text-white" /> : <Star size={9} fill="white" className="text-white" />}
            </div>
            <p className="text-[10.5px] text-text-secondary mb-0.5 text-center leading-tight">{step.label}</p>
            <p className={`text-[12.5px] font-extrabold text-center ${step.textClass}`}>{step.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BodyStatusPanel({ muscleFatigue }: { muscleFatigue: Record<string, number> }) {
  // Expanded logic for Full-Body SVG Map
  const chestBack     = Math.max(muscleFatigue['Chest'] ?? 20, muscleFatigue['Back'] ?? 20);
  const absCore       = Math.max(muscleFatigue['Abs'] ?? 20, muscleFatigue['Core'] ?? 20);
  const leftShoulder  = muscleFatigue['Shoulders'] ?? 20;
  const rightShoulder = muscleFatigue['Shoulders'] ?? 20;
  const leftBicep     = muscleFatigue['Biceps']    ?? 20;
  const rightTricep   = muscleFatigue['Triceps']   ?? 20;
  const leftQuad      = Math.max(muscleFatigue['Quads'] ?? 20, muscleFatigue['Glutes'] ?? 20);
  const rightHam      = Math.max(muscleFatigue['Hamstrings'] ?? 20, muscleFatigue['Glutes'] ?? 20);
  const calves        = muscleFatigue['Calves']    ?? 20;

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="156" viewBox="0 0 90 140" aria-label="Body recovery status map">
        {/* Head & Neck */}
        <ellipse cx="45" cy="12" rx="9" ry="10" fill="#3A4356" />
        <path d="M31 22 h28 v12 h-28 z" fill="#3A4356" />
        
        {/* Upper torso — Chest/Back */}
        <path d="M22 34 h46 v16 a23 23 0 0 1 -46 0 z" fill={fatigueToColor(chestBack)} opacity="0.85" />
        
        {/* Arms: Split into Shoulders (top 14px) and Biceps/Triceps (bot 16px) */}
        {/* Left Shoulder */}
        <rect x="11" y="36" width="11" height="14" rx="4" fill={fatigueToColor(leftShoulder)} opacity="0.75" />
        {/* Right Shoulder */}
        <rect x="68" y="36" width="11" height="14" rx="4" fill={fatigueToColor(rightShoulder)} opacity="0.75" />
        {/* Left Bicep */}
        <rect x="11" y="52" width="11" height="14" rx="4" fill={fatigueToColor(leftBicep)} opacity="0.70" />
        {/* Right Tricep */}
        <rect x="68" y="52" width="11" height="14" rx="4" fill={fatigueToColor(rightTricep)} opacity="0.70" />

        {/* Lower torso — Abs/Core */}
        <rect x="26" y="52" width="38" height="34" rx="8" fill={fatigueToColor(absCore)} opacity="0.85" />
        
        {/* Legs: Split into Quads/Glutes (top 16px) and Calves (bot 16px) */}
        <rect x="28" y="88" width="15" height="16" rx="6" fill={fatigueToColor(leftQuad)} opacity="0.80" />
        <rect x="47" y="88" width="15" height="16" rx="6" fill={fatigueToColor(rightHam)} opacity="0.80" />
        {/* Calves */}
        <rect x="28" y="106" width="15" height="14" rx="5" fill={fatigueToColor(calves)} opacity="0.75" />
        <rect x="47" y="106" width="15" height="14" rx="5" fill={fatigueToColor(calves)} opacity="0.75" />
      </svg>

      <div className="flex gap-4 mt-2 text-[10.5px] text-text-secondary" aria-hidden="true">
        <div className="flex items-center gap-1.5"><span className="w-[7px] h-[7px] rounded-full bg-status-green flex-shrink-0" />Recovered</div>
        <div className="flex items-center gap-1.5"><span className="w-[7px] h-[7px] rounded-full bg-status-amber flex-shrink-0" />Recovering</div>
        <div className="flex items-center gap-1.5"><span className="w-[7px] h-[7px] rounded-full bg-status-red flex-shrink-0" />High Fatigue</div>
      </div>

      <div className="w-full mt-4 space-y-2">
        {Object.entries(muscleFatigue).sort(([, a], [, b]) => b - a).slice(0, 5).map(([muscle, fatigue]) => (
          <div key={muscle} className="flex items-center gap-2">
            <span className="text-[10.5px] text-text-secondary w-20 flex-shrink-0">{muscle}</span>
            <div className="flex-1 h-1.5 bg-card-inset rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${fatigue}%`, background: fatigueToColor(fatigue) }} />
            </div>
            <span className="text-[9.5px] font-bold w-7 text-right flex-shrink-0" style={{ color: fatigueToColor(fatigue) }}>{fatigue}%</span>
          </div>
        ))}
      </div>
      <button onClick={() => alert('Full Body 3D View is coming in the next update!')} className="mt-3.5 px-8 py-2.5 rounded-xl bg-brand-purple text-background text-[11px] font-bold active:scale-95 transition-transform" style={{ maxWidth: 220 }}>
        View Full Body
      </button>
    </div>
  );
}

function LiveAIAdvicePanel({ muscleFatigue, sleepMinutes }: { muscleFatigue: Record<string, number>; sleepMinutes: number }) {
  const [advice, setAdvice] = useState<{ label: string; sub: string; Icon: any }[]>([
    { label: 'Analyzing Data...', sub: 'Groq LLM processing', Icon: Activity }
  ]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchAdvice = async () => {
      try {
        const highlyFatigued = Object.entries(muscleFatigue).filter(([_, val]) => val > 50).map(([k]) => k).join(', ') || 'None';
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { 
                role: "system", 
                content: "You are FitAI Coach. Provide EXACTLY 4 specific recovery recommendations based on muscle fatigue and sleep. Format EACH recommendation on a new line strictly as: Title|Duration_or_Detail. Output ONLY these 4 lines. No conversational filler, no markdown formatting." 
              },
              { role: "user", content: `Sleep: ${sleepMinutes} minutes. High fatigue muscles: ${highlyFatigued}.` }
            ]
          })
        });
        
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        const content = data.choices[0].message.content.trim();
        
        // Parse the strictly formatted "Title|Sub" lines
        const icons = [Activity, AlignJustify, Beef, Moon];
        const parsed = content.split('\n').filter((l: string) => l.includes('|')).map((line: string, i: number) => {
          const [label, sub] = line.split('|');
          return { label: label.trim(), sub: sub.trim(), Icon: icons[i % icons.length] };
        });

        if (parsed.length > 0) {
          setAdvice(parsed.slice(0, 4));
        } else {
          throw new Error('Parsing failed');
        }
      } catch (e) {
        setAdvice([
          { label: 'Light Stretching', sub: '10 min', Icon: Activity },
          { label: 'Foam Rolling', sub: '8 min', Icon: AlignJustify },
          { label: 'Increase Protein', sub: '120-150g', Icon: Beef },
          { label: 'Sleep Early', sub: '7-8 hrs', Icon: Moon },
        ]);
      }
    };
    fetchAdvice();
  }, [muscleFatigue, sleepMinutes]);

  return (
    <ul className="flex flex-col gap-3" aria-label="Live AI recovery advice">
      {advice.map((item, i) => (
        <li key={i}>
          <button className="flex items-center gap-2.5 w-full text-left group">
            <div className="w-[30px] h-[30px] rounded-xl bg-brand-purple/15 text-brand-purple flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-active:scale-95">
              <item.Icon size={14} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <b className="text-[11.5px] font-bold text-text-primary block">{item.label}</b>
              <span className="text-[10px] text-text-secondary">{item.sub}</span>
            </div>
            <ChevronRight size={13} className="text-text-secondary flex-shrink-0" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function TabbedCard({ activeTab, setActiveTab, neuralScore, muscleFatigue, sleepMinutes }: {
  activeTab: TabKey; setActiveTab: (t: TabKey) => void; neuralScore: number; muscleFatigue: Record<string, number>; sleepMinutes: number;
}) {
  return (
    <div className="bg-card border border-border rounded-3xl p-4 mb-3">
      <div role="tablist" className="flex bg-card-inset rounded-xl p-1 mb-4">
        {(['body', 'advice'] as const).map(tab => (
          <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 text-center py-[9px] px-1 rounded-[9px] text-[11.5px] font-bold transition-all duration-200 ${activeTab === tab ? 'bg-gradient-to-br from-brand-purple to-brand-violet text-background' : 'text-text-secondary hover:text-text-primary'}`}>
            {tab === 'body' ? 'Body Status' : 'AI Recovery Advice'}
          </button>
        ))}
      </div>
      <div className="animate-fade-in">
        {activeTab === 'body'
          ? <BodyStatusPanel muscleFatigue={muscleFatigue} />
          : <LiveAIAdvicePanel muscleFatigue={muscleFatigue} sleepMinutes={sleepMinutes} />
        }
      </div>
    </div>
  );
}

function MedicalReports() {
  const [uploading, setUploading] = useState(false);
  const handleUpload = () => {
    if (uploading) return;
    setUploading(true);
    setTimeout(() => setUploading(false), 1400);
  };
  return (
    <div className="bg-card border border-border rounded-3xl p-4 mb-3">
      <div className="flex justify-between items-center mb-3">
        <p className="text-[14.5px] font-bold text-text-primary">Medical Reports</p>
        <button onClick={handleUpload} className="text-[11.5px] text-brand-purple font-bold transition-opacity duration-150 disabled:opacity-50">{uploading ? 'Uploading…' : 'Upload New'}</button>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-brand-purple/15 text-brand-purple flex items-center justify-center flex-shrink-0"><FileText size={17} aria-hidden="true" /></div>
        <div className="flex-1 min-w-0"><b className="text-[12.5px] font-bold text-text-primary block">Blood Report</b><span className="text-[10.5px] text-text-secondary">May 18, 2024</span></div>
        <span className="text-[9.5px] font-bold px-2 py-[3px] rounded-full bg-status-green/15 text-status-green whitespace-nowrap">AI Summary Ready</span>
        <button onClick={() => alert('Opening medical report...')} className="text-[11px] font-bold text-brand-purple whitespace-nowrap ml-1 active:opacity-50 transition-opacity">View Report</button>
      </div>
    </div>
  );
}

export function RecoveryPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('body');
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'workout'|'recovery'>('workout');
  const animated = useAnimated();

  const state    = useFitAIState();
  const hydrated = useFitAIHydrated();

  const neuralScore    = hydrated ? state.recovery.neuralScore   : 89;
  const muscleFatigue  = hydrated ? state.recovery.muscleFatigue : {};
  const waterGlasses   = hydrated ? state.dashboard.waterGlasses   : 4.5;
  const maxWaterGlasses = hydrated ? state.dashboard.maxWaterGlasses : 7;
  const sleepMinutes   = hydrated ? state.recovery.sleepMinutes : 465;

  const recoveryExercises = [
    { id: 'r1', name: 'Dynamic Hamstring Stretch', sets: 2, reps: 10, weight: 0 },
    { id: 'r2', name: 'Foam Rolling Quads', sets: 1, reps: 5, weight: 0 },
    { id: 'r3', name: 'Child\'s Pose', sets: 1, reps: 1, weight: 0 },
    { id: 'r4', name: 'Thoracic Spine Openers', sets: 2, reps: 8, weight: 0 },
  ];

  return (
    <div className="min-h-screen bg-background flex items-start justify-center font-sans">
      <div className="relative w-full max-w-[390px] min-h-screen bg-background overflow-hidden">
        <div className="h-screen overflow-y-auto scrollbar-none px-5 pt-6 pb-28">
          <PageTopBar />
          <RecoveryHero neuralScore={neuralScore} />
          <MiniStatsGrid animated={animated} waterGlasses={waterGlasses} maxWaterGlasses={maxWaterGlasses} sleepMinutes={sleepMinutes} />
          <RecoveryTimeline neuralScore={neuralScore} />
          <TabbedCard activeTab={activeTab} setActiveTab={setActiveTab} neuralScore={neuralScore} muscleFatigue={muscleFatigue} sleepMinutes={sleepMinutes} />
          <MedicalReports />
          <button 
            onClick={() => { setModalMode('recovery'); setIsWorkoutModalOpen(true); }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[14.5px] font-extrabold text-white mb-4 transition-opacity duration-150 active:opacity-80" 
            style={{ background: 'linear-gradient(135deg, #F5C400 0%, #CA8A04 100%)', boxShadow:  '0 10px 28px -10px rgba(245,196,0,0.6)' }}
          >
            Start Recovery Routine <ChevronRight size={16} aria-hidden="true" />
          </button>
          <div className="h-4" aria-hidden="true" />
        </div>
        <BottomNav onAddClick={() => { setModalMode('workout'); setIsWorkoutModalOpen(true); }} />
        <WorkoutModal 
          isOpen={isWorkoutModalOpen} 
          onClose={() => setIsWorkoutModalOpen(false)} 
          initialWorkoutName={modalMode === 'recovery' ? "Active Recovery Flow" : "Custom Workout"}
          initialExercises={modalMode === 'recovery' ? recoveryExercises : undefined}
          mode={modalMode}
        />
      </div>
    </div>
  );
}

export default RecoveryPage;