'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Dumbbell,
  Plus,
  BarChart3,
  User,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react';

// ─── Internal Types ───────────────────────────────────────────────────────────

interface NavItem {
  href:  string;
  label: string;
  Icon:  LucideIcon;
}

// ─── Item Component ───────────────────────────────────────────────────────────

function NavButton({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      role="tab"
      aria-selected={isActive}
      aria-label={item.label}
      className={[
        'flex flex-col items-center gap-[3px] text-[10px] font-semibold',
        'px-3 py-2 rounded-2xl',
        'transition-all duration-200',
        isActive
          ? 'text-brand-purple bg-brand-purple/[0.12]'
          : 'text-text-secondary hover:text-text-primary',
      ].join(' ')}
    >
      <item.Icon size={20} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

// ─── Navigation Data ──────────────────────────────────────────────────────────
// Layout: Home · Workout | [FAB] | Recovery · Profile
// The FAB (centre + button) opens the quick-add workout modal on every screen.

const LEFT_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Home',    Icon: Home     },
  { href: '/workout',   label: 'Workout', Icon: Dumbbell },
];

const RIGHT_ITEMS: NavItem[] = [
  { href: '/recovery',  label: 'Recovery', Icon: HeartPulse },
  { href: '/analytics', label: 'Progress', Icon: BarChart3  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function BottomNav({ onAddClick }: { onAddClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      aria-label="Main navigation"
      className={[
        'fixed bottom-0 z-50',
        'left-1/2 -translate-x-1/2',
        'w-full max-w-[390px]',
        'h-20 bg-background/90 backdrop-blur-xl',
        'border-t border-border',
        'flex items-center justify-around px-2',
        'pb-[env(safe-area-inset-bottom)]',
      ].join(' ')}
    >
      {/* Left items */}
      {LEFT_ITEMS.map(item => (
        <NavButton
          key={item.href}
          item={item}
          isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
        />
      ))}

      {/* Central FAB — quick-add workout */}
      <button
        type="button"
        aria-label="Quick add workout"
        onClick={onAddClick}
        className={[
          'w-[52px] h-[52px] rounded-full -mt-6',
          'bg-gradient-to-br from-brand-purple to-brand-pink',
          'flex items-center justify-center text-background',
          'shadow-brand-glow',
          'transition-transform duration-150 active:scale-95',
        ].join(' ')}
      >
        <Plus size={22} aria-hidden="true" />
      </button>

      {/* Right items */}
      {RIGHT_ITEMS.map(item => (
        <NavButton
          key={item.href}
          item={item}
          isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
        />
      ))}
    </nav>
  );
}

export default BottomNav;