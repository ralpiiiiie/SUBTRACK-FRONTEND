import { DEFAULT_CURRENCY } from "@/lib/constants";
import type { Subscription } from "@/types/subscription";

export function formatCurrency(
  value: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  const formatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
}

export function formatCompact(value: number): string {
  const formatter = new Intl.NumberFormat("en-PH", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return formatter.format(value);
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

export function formatFullDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatWeekday(date: string | Date): string {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  return d.toLocaleDateString("en-PH", { weekday: "short" });
}

export function isToday(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function renewalLabel(subscription: Subscription): string {
  const { days_until_renewal: days } = subscription;

  if (days < 0) {
    const overdue = Math.abs(days);
    return overdue === 1
      ? "Renewal was yesterday"
      : `Overdue by ${overdue} days`;
  }

  if (days === 0) return "Due today";
  if (days === 1) return "Renews tomorrow";
  return `Renews in ${days} days`;
}

export function trialLabel(subscription: Subscription): string {
  const remaining = subscription.trial_days_remaining;

  if (remaining === null || remaining === undefined) return "";

  if (remaining < 0) {
    const ended = Math.abs(remaining);
    return ended === 1 ? "Trial ended yesterday" : `Trial ended ${ended} days ago`;
  }

  if (remaining === 0) return "Trial ends today";
  if (remaining === 1) return "Trial ends tomorrow";
  return `${remaining} days remaining in trial`;
}

export function unusedHint(
  subscription: Subscription,
  threshold = 30,
): string | null {
  const { days_since_last_used: days, last_used_date: lastUsed } = subscription;

  if (!lastUsed || days === null || days === undefined) return null;
  if (days < threshold) return null;

  return `You haven't marked ${subscription.name} as used in ${days} days.`;
}