'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, Plus, BarChart3, User, type LucideIcon } from 'lucide-react';

// ─── Internal Types ───────────────────────────────────────────────────────────

interface NavItem {
  href:  string;
  label: string;
  Icon:  LucideIcon;
}

// ─── Item Component (Now using Next.js Link) ──────────────────────────────────

function NavButton({
  item,
  isActive,
}: {
  item:     NavItem;
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      role="tab"
      aria-selected={isActive}
      aria-label={item.label}
      className={[
        'flex flex-col items-center gap-[3px] text-[10px] font-semibold',
        'px-3.5 py-2 rounded-2xl',
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

const LEFT_ITEMS: NavItem[] = [
  // FIXED: Changed '/' to '/dashboard' to keep users inside the app
  { href: '/dashboard', label: 'Home',    Icon: Home     },
  { href: '/recovery',  label: 'Workout', Icon: Dumbbell }, 
];

const RIGHT_ITEMS: NavItem[] = [
  { href: '/analytics', label: 'Analytics', Icon: BarChart3 },
  { href: '/profile',   label: 'Profile',   Icon: User      },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function BottomNav({ onFabPress }: { onFabPress?: () => void }) {
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
          isActive={pathname === item.href}
        />
      ))}

      {/* Central FAB */}
      <button
        type="button"
        aria-label="Quick add"
        onClick={onFabPress}
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
          isActive={pathname === item.href}
        />
      ))}
    </nav>
  );
}

export default BottomNav;