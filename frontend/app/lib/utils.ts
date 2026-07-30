/**
 * utils.ts
 * Helper functions for global date normalization across the app.
 * Resolves local vs UTC timezone bleed for daily tracking.
 */

/**
 * Returns the local calendar date as an ISO string (YYYY-MM-DD).
 * Use this instead of `new Date().toISOString().split('T')[0]` 
 * which defaults to UTC and causes mismatched days late at night.
 */
export function getLocalISODateString(date: Date = new Date()): string {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(date.getTime() - offsetMs);
  return localDate.toISOString().split('T')[0];
}

/**
 * Checks if two dates share the same local calendar day.
 */
export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Checks if 'date' is exactly one local calendar day before 'reference'.
 */
export function isYesterday(date: Date, reference: Date): boolean {
  const yesterday = new Date(reference);
  yesterday.setDate(reference.getDate() - 1);
  return isSameCalendarDay(date, yesterday);
}
