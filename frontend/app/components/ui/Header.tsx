'use client';

import { Bell } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeaderProps {
  /** User's display name */
  name: string;
  /** Greeting prefix text. @default 'Good morning,' */
  greeting?: string;
  /** Number of unread notifications — hides badge when 0. @default 0 */
  notificationCount?: number;
  /** Called when the notification bell is tapped */
  onNotificationClick?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Header({
  name,
  greeting            = 'Good morning,',
  notificationCount   = 0,
  onNotificationClick,
}: HeaderProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="flex justify-between items-start mb-4">
      {/* Greeting */}
      <div>
        <p className="text-[13px] text-text-secondary">{greeting}</p>
        <h1 className="text-[20px] font-extrabold text-text-primary leading-tight">
          {name} 👋
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell */}
        <button
          onClick={onNotificationClick}
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
          className="relative w-9 h-9 rounded-full bg-card flex items-center justify-center text-text-secondary
                     hover:bg-card-inset transition-colors duration-150"
        >
          <Bell size={18} />

          {notificationCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-[3px]
                         bg-status-red text-white text-[9px] font-extrabold rounded-full
                         flex items-center justify-center border-2 border-background"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div
          aria-label={`${name}'s avatar`}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-pink to-brand-purple
                     flex items-center justify-center font-extrabold text-[12.5px]
                     text-background select-none"
        >
          {initial}
        </div>
      </div>
    </header>
  );
}

export default Header;
