const DAY_MS = 86_400_000;

/**
 * Parse a `YYYY-MM-DD` key as a local midnight {@link Date}.
 */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/**
 * Local midnight for the current day.
 */
export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Format a local {@link Date} as a `YYYY-MM-DD` key.
 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Whole days from `from` (local midnight) until the given date key.
 * Negative values mean the date is in the past.
 */
export function daysUntil(dateKey: string, from: Date = startOfToday()): number {
  return Math.round((parseDateKey(dateKey).getTime() - from.getTime()) / DAY_MS);
}

export function isToday(dateKey: string): boolean {
  return dateKey === toDateKey(new Date());
}

/**
 * True when `dateKey` falls between tomorrow and three days from now (inclusive).
 * Used for the "due soon" red highlight on the calendar.
 */
export function isDueWithinThreeDays(dateKey: string): boolean {
  const days = daysUntil(dateKey);
  return days >= 1 && days <= 3;
}

export function isOverdue(dateKey: string): boolean {
  return daysUntil(dateKey) < 0;
}