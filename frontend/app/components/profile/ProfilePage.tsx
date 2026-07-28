'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  BarChart2,
  Calendar,
  ChevronRight,
  Download,
  Lock,
  LogOut,
  Pencil,
  Ruler,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ── Reused project components ──────────────────────────────────────────────────
import { Header }    from '../ui/Header';
import { BottomNav } from '../ui/BottomNav';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

type ThemeKey     = 'dark' | 'light' | 'system';
type DeviceStatus = 'disconnected' | 'connecting' | 'connected';
type ExportState  = 'idle' | 'preparing' | 'ready';

// ═══════════════════════════════════════════════════════════════════════════════
// Static Data
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_GOALS      = ['Lose Weight', 'Build Muscle', 'Improve Strength', 'Endurance', 'Flexibility'] as const;
const ALL_EQUIPMENT  = ['Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar', 'Full Gym'] as const;

const THEME_OPTIONS: { key: ThemeKey; label: string; swatchStyle: React.CSSProperties }[] = [
  { key: 'dark',   label: 'Dark',   swatchStyle: { background: '#0A0A0A', border: '1px solid #2a2a2a' }  },
  { key: 'light',  label: 'Light',  swatchStyle: { background: '#F1F3F7' }                               },
  { key: 'system', label: 'System', swatchStyle: { background: 'linear-gradient(90deg,#0A0A0A 50%,#F1F3F7 50%)' } },
];

const DEVICES = [
  { key: 'appleWatch', name: 'Apple Watch Series 9', syncedSub: 'Synced 2 min ago' },
  { key: 'whoop',      name: 'WHOOP 4.0',            syncedSub: 'Synced'            },
  { key: 'googleFit',  name: 'Google Fit',             syncedSub: 'Synced'            },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Primitive / Layout Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.6px] mt-5 mx-1 mb-2">
      {children}
    </p>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden divide-y divide-border">
      {children}
    </div>
  );
}

function Row({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className={[
        'flex items-center gap-3 px-4 py-[13px]',
        onClick ? 'cursor-pointer transition-colors duration-150 active:bg-card-inset' : '',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function RowIcon({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 ${bg} ${color}`}>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={[
        'relative w-10 h-[23px] rounded-full flex-shrink-0 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
        checked ? 'bg-gradient-to-r from-brand-purple to-brand-violet' : 'bg-card-inset',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'absolute top-0.5 h-[19px] w-[19px] rounded-full bg-white shadow-sm transition-[left] duration-200',
          checked ? 'left-[19px]' : 'left-0.5',
        ].join(' ')}
      />
    </button>
  );
}

function ToggleRows({ items, toggles, onToggle }: { items: { key: string; label: string; sub?: string }[]; toggles: Record<string, boolean>; onToggle: (key: string) => void }) {
  return (
    <Card>
      {items.map(item => (
        <Row key={item.key} onClick={() => onToggle(item.key)}>
          <div className="flex-1 min-w-0">
            <b className="text-[12.5px] font-bold text-text-primary block">{item.label}</b>
            {item.sub && <span className="text-[10.5px] text-text-secondary">{item.sub}</span>}
          </div>
          <ToggleSwitch checked={!!toggles[item.key]} onChange={() => onToggle(item.key)} label={item.label} />
        </Row>
      ))}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section Components
// ═══════════════════════════════════════════════════════════════════════════════

/* ── Profile Hero (UPDATED to accept userName prop) ────────────────────────── */
function ProfileHero({ userName }: { userName: string }) {
  // Grab the first letter for the avatar
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3.5 bg-card border border-border rounded-[20px] p-4 mb-4">
      {/* Avatar with edit badge */}
      <div className="relative flex-shrink-0">
        <div
          aria-label={`${userName} avatar`}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-pink to-brand-purple
                     flex items-center justify-center font-extrabold text-[22px] text-background select-none"
        >
          {initial}
        </div>
        <button
          aria-label="Change profile photo"
          className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full
                     bg-background border-2 border-card flex items-center justify-center text-text-secondary"
        >
          <Pencil size={10} aria-hidden="true" />
        </button>
      </div>

      {/* Name / email / plan badge */}
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-extrabold text-text-primary">{userName}</p>
        <p className="text-[11.5px] text-text-secondary mt-0.5">user@email.com</p>
        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-[3px] rounded-full bg-brand-purple/15 text-brand-purple mt-1.5">
          ✦ PRO MEMBER
        </span>
      </div>

      {/* Chevron CTA */}
      <button
        aria-label="Edit profile details"
        className="w-8 h-8 rounded-[10px] bg-card-inset flex items-center justify-center text-text-secondary flex-shrink-0"
      >
        <ChevronRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

function FitnessProfileSection() {
  const rows = [
    { Icon: Ruler,    bg: 'bg-brand-purple/15', color: 'text-brand-purple', label: 'Height', sub: 'Update your height',  value: '168 cm' },
    { Icon: BarChart2,bg: 'bg-brand-blue/15',   color: 'text-brand-blue',   label: 'Weight', sub: 'Last logged today',   value: '61.4 kg'},
    { Icon: Calendar, bg: 'bg-brand-cyan/15',   color: 'text-brand-cyan',   label: 'Age',    sub: 'Date of birth',       value: '27'     },
  ] as const;

  return (
    <Card>
      {rows.map(row => (
        <Row key={row.label} onClick={() => {}}>
          <RowIcon bg={row.bg} color={row.color}>
            <row.Icon size={15} aria-hidden="true" />
          </RowIcon>
          <div className="flex-1 min-w-0">
            <b className="text-[12.5px] font-bold text-text-primary block">{row.label}</b>
            <span className="text-[10.5px] text-text-secondary">{row.sub}</span>
          </div>
          <div className="text-[11.5px] text-text-secondary flex items-center gap-1.5 flex-shrink-0">
            {row.value}
            <ChevronRight size={13} aria-hidden="true" />
          </div>
        </Row>
      ))}
    </Card>
  );
}

function ChipSelector({ options, selected, onToggle, label }: { options: readonly string[]; selected: string[]; onToggle: (v: string) => void; label: string }) {
  return (
    <Card>
      <div className="flex flex-wrap gap-2 p-3.5" role="group" aria-label={label}>
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              aria-pressed={active}
              className={[
                'text-[11.5px] font-semibold px-3.5 py-2 rounded-full border transition-all duration-200',
                active ? 'bg-gradient-to-r from-brand-purple to-brand-violet text-background border-transparent' : 'bg-card-inset text-text-secondary border-border hover:border-brand-purple/30',
              ].join(' ')}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function InjurySection() {
  const injuries = [
    { label: 'Lower Back Strain', sub: 'Logged March 2024', iconBg: 'bg-status-red/15', iconColor: 'text-status-red', pillBg: 'bg-status-amber/15', pillColor: 'text-status-amber', severity: 'Healing' },
    { label: 'Right Shoulder', sub: 'Logged Nov 2023', iconBg: 'bg-status-green/15', iconColor: 'text-status-green', pillBg: 'bg-status-green/15', pillColor: 'text-status-green', severity: 'Resolved' },
  ] as const;

  return (
    <Card>
      {injuries.map(inj => (
        <div key={inj.label} className="flex items-center gap-3 px-4 py-3">
          <RowIcon bg={inj.iconBg} color={inj.iconColor}>
            <AlertTriangle size={15} aria-hidden="true" />
          </RowIcon>
          <div className="flex-1 min-w-0">
            <b className="text-[12.5px] font-bold text-text-primary block">{inj.label}</b>
            <span className="text-[10.5px] text-text-secondary">{inj.sub}</span>
          </div>
          <span className={`text-[9.5px] font-bold px-2 py-[3px] rounded-full flex-shrink-0 ${inj.pillBg} ${inj.pillColor}`}>
            {inj.severity}
          </span>
        </div>
      ))}
    </Card>
  );
}

function ThemeSelector({ theme, setTheme }: { theme: ThemeKey; setTheme: (t: ThemeKey) => void }) {
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden">
      <div role="radiogroup" aria-label="Theme" className="flex gap-2.5 p-3.5">
        {THEME_OPTIONS.map(opt => {
          const active = theme === opt.key;
          return (
            <button
              key={opt.key}
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(opt.key)}
              className={[
                'flex-1 text-center py-3.5 px-2 rounded-2xl border-[1.5px] transition-all duration-200',
                active ? 'border-brand-purple bg-brand-purple/10' : 'border-transparent bg-card-inset',
              ].join(' ')}
            >
              <div className="w-full h-8 rounded-lg mb-2" style={opt.swatchStyle} aria-hidden="true" />
              <p className={`text-[10.5px] font-semibold ${active ? 'text-text-primary' : 'text-text-secondary'}`}>
                {opt.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SecuritySection({ twoFactor, onToggle }: { twoFactor: boolean; onToggle: () => void }) {
  return (
    <Card>
      <Row onClick={() => {}}>
        <RowIcon bg="bg-brand-purple/15" color="text-brand-purple"><Lock size={15} aria-hidden="true" /></RowIcon>
        <div className="flex-1 min-w-0"><b className="text-[12.5px] font-bold text-text-primary block">Change Password</b></div>
        <ChevronRight size={13} className="text-text-secondary" aria-hidden="true" />
      </Row>
      <Row onClick={onToggle}>
        <div className="flex-1 min-w-0">
          <b className="text-[12.5px] font-bold text-text-primary block">Two-Factor Authentication</b>
          <span className="text-[10.5px] text-text-secondary">Extra layer of security</span>
        </div>
        <ToggleSwitch checked={twoFactor} onChange={onToggle} label="Two-Factor Authentication" />
      </Row>
    </Card>
  );
}

function DevicesSection({ deviceStatus, onConnect }: { deviceStatus: Record<string, DeviceStatus>; onConnect: (key: string) => void }) {
  return (
    <Card>
      {DEVICES.map(device => {
        const status      = deviceStatus[device.key];
        const isConnected = status === 'connected';
        const isConnecting= status === 'connecting';

        return (
          <div key={device.key} className="flex items-center gap-3 px-4 py-[13px]">
            <div aria-hidden="true" className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-500 ${isConnected ? 'bg-status-green' : 'bg-text-secondary'}`} />
            <div className="flex-1 min-w-0">
              <b className="text-[12.5px] font-bold text-text-primary block">{device.name}</b>
              <span className="text-[10.5px] text-text-secondary">{isConnected ? device.syncedSub : 'Not connected'}</span>
            </div>
            <button
              onClick={() => onConnect(device.key)}
              disabled={isConnected || isConnecting}
              aria-label={isConnected ? `${device.name} connected` : `Connect ${device.name}`}
              className={['text-[10.5px] font-bold px-3 py-[6px] rounded-xl border flex-shrink-0 transition-all duration-300', isConnected ? 'border-status-green/30 bg-status-green/[0.08] text-status-green' : 'border-border bg-card-inset text-text-secondary'].join(' ')}
            >
              {isConnected ? 'Connected' : isConnecting ? 'Connecting…' : 'Connect'}
            </button>
          </div>
        );
      })}
    </Card>
  );
}

function SubscriptionCard() {
  return (
    <div className="rounded-[18px] p-4 mb-2" style={{ background: 'linear-gradient(135deg, #4a3a10, #8a6a10)' }}>
      <p className="text-[15px] font-extrabold text-text-primary mb-0.5">FitAI Pro — Premium</p>
      <p className="text-[11px] mb-3" style={{ color: '#E4DBFF' }}>Renews on Aug 18, 2024 · $12.99/mo</p>
      <button className="w-full py-[11px] rounded-xl bg-white text-[#5c4408] text-[12.5px] font-extrabold transition-opacity duration-150 active:opacity-80">
        Manage Subscription
      </button>
    </div>
  );
}

function ExportRow({ state, onClick }: { state: ExportState; onClick: () => void }) {
  return (
    <Card>
      <button
        onClick={onClick}
        disabled={state !== 'idle'}
        aria-label="Export my data"
        className="flex items-center gap-3 px-4 py-[13px] w-full text-left transition-colors duration-150 active:bg-card-inset disabled:pointer-events-none"
      >
        <RowIcon bg="bg-brand-cyan/15" color="text-brand-cyan"><Download size={15} aria-hidden="true" /></RowIcon>
        <div className="flex-1 min-w-0">
          <b className="text-[12.5px] font-bold text-text-primary block">Export My Data</b>
          <span className="text-[10.5px] text-text-secondary">Download as CSV or PDF</span>
        </div>
        <div className="text-[11.5px] text-text-secondary flex items-center gap-1.5 flex-shrink-0">
          {state === 'idle'      && <ChevronRight size={13} aria-hidden="true" />}
          {state === 'preparing' && <span className="animate-pulse">Preparing…</span>}
          {state === 'ready'     && <span className="text-status-green font-bold">✓ Ready</span>}
        </div>
      </button>
    </Card>
  );
}

function LogoutButton({ confirm, loggedOut, onClick }: { confirm: boolean; loggedOut: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loggedOut}
      className="w-full py-[15px] rounded-2xl border border-status-red/30 bg-status-red/[0.08] text-status-red text-[13.5px] font-bold flex items-center justify-center gap-2 mt-5 mb-[70px] transition-all duration-150 active:bg-status-red/[0.15] disabled:opacity-60"
    >
      {loggedOut ? 'Logged out ✓' : confirm ? 'Tap again to confirm' : <><LogOut size={16} aria-hidden="true" /> Log Out</>}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════════════════════

export function ProfilePage() {
  const [goals,     setGoals]     = useState<string[]>(['Lose Weight', 'Improve Strength']);
  const [equipment, setEquipment] = useState<string[]>(['Dumbbells', 'Barbell']);

  const toggleChip = (arr: string[], item: string, setFn: (v: string[]) => void) =>
    setFn(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    adaptiveCoaching: true, voiceFeedback: false, aggressiveProgression: false,
    workoutReminders: true, recoveryAlerts: true, socialUpdates: false,
    publicProfile: true, shareWorkoutData: false, twoFactor: true,
  });
  const toggle = (key: string) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const [theme, setTheme] = useState<ThemeKey>('dark');

  const [deviceStatus, setDeviceStatus] = useState<Record<string, DeviceStatus>>({
    appleWatch: 'connected', whoop: 'disconnected', googleFit: 'disconnected',
  });

  const connectDevice = (key: string) => {
    if (deviceStatus[key] === 'connected') return;
    setDeviceStatus(prev => ({ ...prev, [key]: 'connecting' }));
    setTimeout(() => setDeviceStatus(prev => ({ ...prev, [key]: 'connected' })), 1000);
  };

  const [exportState, setExportState] = useState<ExportState>('idle');

  const handleExport = () => {
    if (exportState !== 'idle') return;
    setExportState('preparing');
    setTimeout(() => {
      setExportState('ready');
      setTimeout(() => setExportState('idle'), 1200);
    }, 900);
  };

  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [loggedOut,     setLoggedOut]     = useState(false);

  const router = useRouter();

  const handleLogout = () => {
    if (!logoutConfirm) {
      setLogoutConfirm(true);
      setTimeout(() => setLogoutConfirm(false), 3000);
      return;
    }
    setLoggedOut(true);
    localStorage.clear(); 
    sessionStorage.clear(); 
    setTimeout(() => { router.push('/'); }, 800);
  };

  // 1. Dynamic User Name State
  const [userName, setUserName] = useState('Priyanshi');

  // 2. Fetch from memory on load
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-black flex items-start justify-center font-sans">
      <div className="relative w-full max-w-[390px] min-h-screen bg-background overflow-hidden">
        <div className="h-screen overflow-y-auto scrollbar-none px-5 pt-6 pb-28">

          {/* ── UPDATED: Header now uses dynamic userName ── */}
          <Header
            name={userName}
            greeting="Profile & Settings"
            notificationCount={0}
          />

          {/* ── UPDATED: ProfileHero now receives the dynamic userName ── */}
          <ProfileHero userName={userName} />

          <SectionLabel>Fitness Profile</SectionLabel>
          <FitnessProfileSection />

          <SectionLabel>Goals</SectionLabel>
          <ChipSelector label="Fitness goals" options={ALL_GOALS} selected={goals} onToggle={v => toggleChip(goals, v, setGoals)} />

          <SectionLabel>Equipment</SectionLabel>
          <ChipSelector label="Available equipment" options={ALL_EQUIPMENT} selected={equipment} onToggle={v => toggleChip(equipment, v, setEquipment)} />

          <SectionLabel>Injury History</SectionLabel>
          <InjurySection />

          <SectionLabel>AI Preferences</SectionLabel>
          <ToggleRows
            items={[
              { key: 'adaptiveCoaching',     label: 'Adaptive Coaching',      sub: 'Adjust plans based on recovery'    },
              { key: 'voiceFeedback',        label: 'Voice Feedback',         sub: 'Spoken cues during workouts'       },
              { key: 'aggressiveProgression', label: 'Aggressive Progression',  sub: 'Push volume faster when recovered' },
            ]}
            toggles={toggles} onToggle={toggle}
          />

          <SectionLabel>Notifications</SectionLabel>
          <ToggleRows
            items={[
              { key: 'workoutReminders', label: 'Workout Reminders', sub: 'Daily nudge at 6:00 PM'        },
              { key: 'recoveryAlerts',   label: 'Recovery Alerts',   sub: 'When readiness drops'          },
              { key: 'socialUpdates',    label: 'Social Updates',    sub: 'Leaderboard & friend activity' },
            ]}
            toggles={toggles} onToggle={toggle}
          />

          <SectionLabel>Theme Settings</SectionLabel>
          <ThemeSelector theme={theme} setTheme={setTheme} />

          <SectionLabel>Privacy</SectionLabel>
          <ToggleRows
            items={[
              { key: 'publicProfile',    label: 'Public Profile',    sub: 'Visible on leaderboards' },
              { key: 'shareWorkoutData', label: 'Share Workout Data', sub: 'With connected apps'     },
            ]}
            toggles={toggles} onToggle={toggle}
          />

          <SectionLabel>Security</SectionLabel>
          <SecuritySection twoFactor={toggles.twoFactor} onToggle={() => toggle('twoFactor')} />

          <SectionLabel>Connected Devices</SectionLabel>
          <DevicesSection deviceStatus={deviceStatus} onConnect={connectDevice} />

          <SectionLabel>Subscription</SectionLabel>
          <SubscriptionCard />

          <SectionLabel>Data Export</SectionLabel>
          <ExportRow state={exportState} onClick={handleExport} />

          <LogoutButton confirm={logoutConfirm} loggedOut={loggedOut} onClick={handleLogout} />
        </div>

        <BottomNav />
      </div>
    </div>
  );
}

export default ProfilePage;