'use client';

import { useState, useEffect } from 'react';
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

// ── Reused project components ──────────────────────────────────────────────────
import { BottomNav } from '../ui/BottomNav';
import { RingProgress } from '../ui/RingProgress';
// 🟢 1. IMPORT ADDED HERE!
import { WorkoutModal } from '../ui/WorkoutModal'; 

// Note: The recovery page uses a page-specific <PageTopBar /> instead of the
// dashboard-style <Header /> because its layout (plain page title + icon buttons)
// is structurally incompatible with the greeting-name-avatar pattern of Header.
// BottomNav and RingProgress are the two primary reused components on this page.

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

type TabKey = 'body' | 'advice';

// ═══════════════════════════════════════════════════════════════════════════════
// Shared Hook
// ═══════════════════════════════════════════════════════════════════════════════

/** Fires `setAnimated(true)` after `delay` ms — used to trigger CSS bar transitions */
function useAnimated(delay = 250): boolean {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(id);
  }, [delay]);
  return animated;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Static Data
// ═══════════════════════════════════════════════════════════════════════════════

const SLEEP_BAR_HEIGHTS = [40, 70, 55, 85, 60, 75] as const;

const TIMELINE_STEPS = [
  { label: 'Today',        value: '89%',  dotClass: 'bg-status-green',  textClass: 'text-status-green',  isDone: true  },
  { label: 'Tomorrow',     value: '85%',  dotClass: 'bg-brand-blue',    textClass: 'text-brand-blue',    isDone: false },
  { label: '2 Days',       value: '70%',  dotClass: 'bg-brand-blue',    textClass: 'text-brand-blue',    isDone: false },
  { label: 'Full Recovery',value: '100%', dotClass: 'bg-brand-purple',  textClass: 'text-brand-purple',  isDone: false },
] as const;

const ADVICE_ITEMS = [
  { Icon: Activity,     label: 'Light Stretching', sub: '10 min'   },
  { Icon: AlignJustify, label: 'Foam Rolling',     sub: '8 min'    },
  { Icon: Beef,         label: 'Increase Protein', sub: '120–150g' },
  { Icon: Moon,         label: 'Sleep Early',      sub: '7–8 hrs'  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Page-scoped Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

/* ── Page Top Bar ─────────────────────────────────────────────────────────── */
function PageTopBar() {
  return (
    <div className="flex justify-between items-center mt-2.5 mb-4">
      <h1 className="text-[19px] font-extrabold text-text-primary">
        Recovery &amp; Health
      </h1>
      <div className="flex gap-2.5">
        <button
          aria-label="Help information"
          className="w-[38px] h-[38px] rounded-xl bg-card flex items-center justify-center text-text-secondary"
        >
          <Info size={17} aria-hidden="true" />
        </button>
        <button
          aria-label="Notifications"
          className="w-[38px] h-[38px] rounded-xl bg-card flex items-center justify-center text-text-secondary"
        >
          <Bell size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ── Recovery Hero Card ───────────────────────────────────────────────────── */
function RecoveryHero() {
  return (
    <section
      aria-label="Recovery score overview"
      className="relative rounded-3xl overflow-hidden mb-4 p-5 border border-brand-purple/20 flex items-center gap-2.5"
      style={{ background: 'linear-gradient(120deg, #111111 0%, #191919 100%)' }}
    >
      {/* ── Left: animated score ring (reuses RingProgress) ────────────────── */}
      <div className="flex-shrink-0">
        <p className="text-[13.5px] font-bold text-brand-cyan mb-2.5">Recovery Score</p>

        {/* Wrapper to overlay two-line label on top of RingProgress */}
        <div className="relative w-[112px] h-[112px]">
          <RingProgress
            progress={0.89}
            size={112}
            strokeWidth={11}
            color="#FBBF24"
            trackColor="rgba(255,255,255,0.08)"
            /* No `label` prop — we render a richer two-line overlay instead */
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[25px] font-extrabold text-text-primary leading-none">89%</span>
            <span className="text-[11px] text-status-green font-bold mt-0.5">Excellent</span>
          </div>
        </div>
      </div>

      {/* ── Middle: status copy ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium mb-0.5" style={{ color: '#BFEFDD' }}>Status</p>
        <p className="text-[15px] font-extrabold text-text-primary mb-1.5">Ready to Train</p>
        <p className="text-[10.5px] leading-relaxed" style={{ color: '#D9CBA0' }}>
          Your body is recovered and primed for performance.
        </p>
      </div>

      {/* ── Right: glowing body figure (animate-breathe from tailwind.config) ─ */}
      <div className="flex-shrink-0 animate-breathe" aria-hidden="true">
        <svg viewBox="0 0 80 100" fill="none" width="52" height="66">
          <defs>
            <linearGradient id="figGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FDE047" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="16" r="10"  fill="url(#figGrad)" opacity="0.9" />
          <circle cx="40" cy="16" r="3.5" fill="#FFD60A" />
          <path d="M40 26v18"                                          stroke="url(#figGrad)" strokeWidth="7" strokeLinecap="round" />
          <path d="M40 34c-10 0-20 6-24 16M40 34c10 0 20 6 24 16"    stroke="url(#figGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M16 50c-4 6-4 14 6 16M64 50c4 6 4 14-6 16"        stroke="url(#figGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M22 66c8 8 28 8 36 0"                               stroke="url(#figGrad)" strokeWidth="7" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    </section>
  );
}

/* ── Mini Stats 2×2 Grid ──────────────────────────────────────────────────── */
function MiniStatsGrid({ animated }: { animated: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-3">

      {/* Sleep */}
      <div className="bg-card border border-border rounded-3xl p-3.5">
        <div className="flex items-center gap-1.5 mb-2 text-[12px] font-bold text-text-secondary">
          <Moon size={15} className="text-brand-purple" aria-hidden="true" />
          Sleep
        </div>
        <p className="text-[17px] font-extrabold text-text-primary">7h 45m</p>
        <p className="text-[10.5px] text-status-green font-bold mt-0.5">Good</p>

        {/* Mini bar chart — 6 columns representing sleep stages */}
        <div className="flex items-end gap-[3px] h-5 mt-2" aria-hidden="true">
          {SLEEP_BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-brand-purple rounded-[2px] opacity-80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Heart Rate */}
      <div className="bg-card border border-border rounded-3xl p-3.5">
        <div className="flex items-center gap-1.5 mb-2 text-[12px] font-bold text-text-secondary">
          {/* Filled heart via fill prop — lucide icons accept standard SVG attributes */}
          <Heart size={15} fill="#EF4444" stroke="none" aria-hidden="true" />
          Heart Rate
        </div>
        <p className="text-[17px] font-extrabold text-text-primary">62 bpm</p>
        <p className="text-[10.5px] text-text-secondary mt-0.5">Resting</p>

        {/* Heartbeat polyline mini chart */}
        <svg
          className="w-full mt-1.5"
          viewBox="0 0 140 20"
          preserveAspectRatio="none"
          height="20"
          aria-hidden="true"
        >
          <polyline
            points="0,10 15,10 20,2 25,16 30,10 45,10 55,10 60,4 65,15 70,10 85,10 95,10 100,3 105,16 110,10 125,10 135,10"
            fill="none"
            stroke="#EF4444"
            strokeWidth="1.6"
          />
        </svg>
      </div>

      {/* Water Intake */}
      <div className="bg-card border border-border rounded-3xl p-3.5">
        <div className="flex items-center gap-1.5 mb-2 text-[12px] font-bold text-text-secondary">
          <Droplets size={15} className="text-brand-blue" aria-hidden="true" />
          Water Intake
        </div>
        <p className="text-[17px] font-extrabold text-text-primary">2.4 L</p>
        <p className="text-[10.5px] text-text-secondary mt-0.5">80%</p>
        <div
          className="h-1.5 bg-[#232C3F] rounded-full mt-2 overflow-hidden"
          role="progressbar"
          aria-valuenow={80}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Water intake: 80%"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan transition-all duration-1000 ease-out"
            style={{ width: animated ? '80%' : '0%' }}
          />
        </div>
      </div>

      {/* Stress */}
      <div className="bg-card border border-border rounded-3xl p-3.5">
        <div className="flex items-center gap-1.5 mb-2 text-[12px] font-bold text-text-secondary">
          <Zap size={15} className="text-status-amber" aria-hidden="true" />
          Stress
        </div>
        <p className="text-[17px] font-extrabold text-status-amber">Moderate</p>
        <p className="text-[10.5px] text-text-secondary mt-0.5">42/100</p>
        <div
          className="h-1.5 bg-[#232C3F] rounded-full mt-2 overflow-hidden"
          role="progressbar"
          aria-valuenow={42}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Stress level: 42 out of 100"
        >
          <div
            className="h-full rounded-full bg-status-amber transition-all duration-1000 ease-out"
            style={{ width: animated ? '42%' : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Recovery Timeline ────────────────────────────────────────────────────── */
function RecoveryTimeline() {
  return (
    <div className="bg-card border border-border rounded-3xl p-4 mb-3">
      {/* Card heading */}
      <div className="flex items-center gap-1.5 mb-3.5 text-[14.5px] font-bold text-text-primary">
        Recovery Timeline
        <HelpCircle size={14} className="text-text-secondary" aria-hidden="true" />
      </div>

      <div className="relative flex justify-between" role="list" aria-label="Recovery forecast">
        {/* Gradient connector line (rendered behind dots via z-index) */}
        <div
          className="absolute top-3 left-3 right-3 h-0.5"
          style={{ background: 'linear-gradient(90deg, #A3E635, #CA8A04, #F5C400)' }}
          aria-hidden="true"
        />

        {TIMELINE_STEPS.map((step, i) => (
          <div
            key={i}
            role="listitem"
            className="flex-1 flex flex-col items-center relative z-10"
          >
            {/* Step dot */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] border-background mb-2 ${step.dotClass}`}
            >
              {step.isDone
                ? <Check size={11} className="text-white" aria-hidden="true" />
                : <Star  size={9}  fill="white" className="text-white" aria-hidden="true" />
              }
            </div>
            <p className="text-[10.5px] text-text-secondary mb-0.5 text-center leading-tight">
              {step.label}
            </p>
            <p className={`text-[12.5px] font-extrabold text-center ${step.textClass}`}>
              {step.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Body Status Tab Panel ────────────────────────────────────────────────── */
function BodyStatusPanel() {
  return (
    <div className="flex flex-col items-center">
      {/* Colour-coded body map */}
      <svg
        width="100"
        height="156"
        viewBox="0 0 90 140"
        aria-label="Body recovery status map — green: recovered, amber: recovering, red: high fatigue"
      >
        {/* Head */}
        <ellipse cx="45" cy="12" rx="9"  ry="10" fill="#3A4356" />
        {/* Neck */}
        <path d="M31 22 h28 v12 h-28 z" fill="#3A4356" />
        {/* Upper torso — Recovered (green) */}
        <path d="M22 34 h46 v16 a23 23 0 0 1 -46 0 z" fill="#A3E635" opacity="0.85" />
        {/* Left arm — Recovered (green) */}
        <rect x="11"  y="36" width="11" height="30" rx="5.5" fill="#A3E635" opacity="0.70" />
        {/* Right arm — Recovering (amber) */}
        <rect x="68"  y="36" width="11" height="30" rx="5.5" fill="#F59E0B" opacity="0.75" />
        {/* Lower torso */}
        <rect x="26"  y="52" width="38" height="34" rx="8"   fill="#3A4356" />
        {/* Left leg — High Fatigue (red) */}
        <rect x="28"  y="88" width="15" height="32" rx="6"   fill="#EF4444" opacity="0.80" />
        {/* Right leg — Recovering (amber) */}
        <rect x="47"  y="88" width="15" height="32" rx="6"   fill="#F59E0B" opacity="0.75" />
      </svg>

      {/* Legend row */}
      <div className="flex gap-4 mt-2 text-[10.5px] text-text-secondary" aria-hidden="true">
        <div className="flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-status-green flex-shrink-0" />
          Recovered
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-status-amber flex-shrink-0" />
          Recovering
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-status-red flex-shrink-0" />
          High Fatigue
        </div>
      </div>

      <button
        className="mt-3.5 px-8 py-2.5 rounded-xl bg-brand-purple text-background text-[11px] font-bold"
        style={{ maxWidth: 220 }}
      >
        View Full Body
      </button>
    </div>
  );
}

/* ── AI Recovery Advice Tab Panel ────────────────────────────────────────── */
function AIAdvicePanel() {
  return (
    <ul className="flex flex-col gap-3" aria-label="AI recovery advice">
      {ADVICE_ITEMS.map((item, i) => (
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

/* ── Tabbed Card (Body Status / AI Recovery Advice) ─────────────────────── */
function TabbedCard({
  activeTab,
  setActiveTab,
}: {
  activeTab:    TabKey;
  setActiveTab: (t: TabKey) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-3xl p-4 mb-3">
      {/* Tab switcher */}
      <div
        role="tablist"
        aria-label="Recovery info sections"
        className="flex bg-card-inset rounded-xl p-1 mb-4"
      >
        {(['body', 'advice'] as const).map(tab => (
          <button
            key={tab}
            role="tab"
            id={`rec-tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`rec-panel-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={[
              'flex-1 text-center py-[9px] px-1 rounded-[9px] text-[11.5px] font-bold',
              'transition-all duration-200',
              activeTab === tab
                ? 'bg-gradient-to-br from-brand-purple to-brand-violet text-background'
                : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {tab === 'body' ? 'Body Status' : 'AI Recovery Advice'}
          </button>
        ))}
      </div>

      {/* Tab panel — key forces remount so fade-in replays on switch */}
      <div
        id={`rec-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`rec-tab-${activeTab}`}
        key={activeTab}
        className="animate-fade-in"
      >
        {activeTab === 'body' ? <BodyStatusPanel /> : <AIAdvicePanel />}
      </div>
    </div>
  );
}

/* ── Medical Reports ──────────────────────────────────────────────────────── */
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
        <button
          onClick={handleUpload}
          aria-busy={uploading}
          className="text-[11.5px] text-brand-purple font-bold transition-opacity duration-150 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload New'}
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Report icon */}
        <div className="w-9 h-9 rounded-xl bg-brand-purple/15 text-brand-purple flex items-center justify-center flex-shrink-0">
          <FileText size={17} aria-hidden="true" />
        </div>
        {/* Report meta */}
        <div className="flex-1 min-w-0">
          <b className="text-[12.5px] font-bold text-text-primary block">Blood Report</b>
          <span className="text-[10.5px] text-text-secondary">May 18, 2024</span>
        </div>
        {/* AI status pill */}
        <span className="text-[9.5px] font-bold px-2 py-[3px] rounded-full bg-status-green/15 text-status-green whitespace-nowrap">
          AI Summary Ready
        </span>
        {/* View link */}
        <button className="text-[11px] font-bold text-brand-purple whitespace-nowrap ml-1">
          View Report
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════════

export function RecoveryPage() {
  // nav active key — 'profile' maps to the rightmost nav slot (Health/Recovery)
  const [activeTab, setActiveTab] = useState<TabKey>('body');
  
  // 🟢 2. ADDED THE MEMORY STATE HERE!
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  
  const animated = useAnimated();

  return (
    <div className="min-h-screen bg-background flex items-start justify-center font-sans">
      {/* 390 px mobile viewport, centred on desktop */}
      <div className="relative w-full max-w-[390px] min-h-screen bg-background overflow-hidden">

        {/* ── Scrollable content ──────────────────────────────────────────── */}
        <div className="h-screen overflow-y-auto scrollbar-none px-5 pt-6 pb-28">

          <PageTopBar />
          <RecoveryHero />
          <MiniStatsGrid animated={animated} />
          <RecoveryTimeline />

          <TabbedCard
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <MedicalReports />

          {/* ── Start Recovery Routine CTA ──────────────────────────────── */}
          <button
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[14.5px] font-extrabold text-white mb-4 transition-opacity duration-150 active:opacity-80"
            style={{
              background: 'linear-gradient(135deg, #F5C400 0%, #CA8A04 100%)',
              boxShadow:  '0 10px 28px -10px rgba(245,196,0,0.6)',
            }}
          >
            Start Recovery Routine
            <ChevronRight size={16} aria-hidden="true" />
          </button>

          {/* Bottom spacer so last card clears the nav */}
          <div className="h-4" aria-hidden="true" />
        </div>

        {/* ── Reused BottomNav ────────────────────────────────────────────── */}
        {/* 🟢 3. ADDED THE onAddClick COMMAND TO THE NAV BAR */}
        <BottomNav onAddClick={() => setIsWorkoutModalOpen(true)} />
        
        {/* 🟢 4. ADDED THE MODAL COMPONENT */}
        <WorkoutModal 
          isOpen={isWorkoutModalOpen} 
          onClose={() => setIsWorkoutModalOpen(false)} 
        />
        
      </div>
    </div>
  );
}

export default RecoveryPage;