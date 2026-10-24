import { parseDateKey, startOfToday } from "@/lib/dates";
import type { Subscription } from "@/types/subscription";
import type { CalendarMonth } from "@/components/features/Calendar/RenewalCalendar";

const DAY_MS = 86_400_000;

export function currentMonth(): CalendarMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function nextThirtyDays(subscriptions: Subscription[]): Subscription[] {
  const today = startOfToday();
  const horizon = new Date(today.getTime() + 30 * DAY_MS);

  return subscriptions
    .filter((subscription) => {
      if (subscription.status === "cancelled") return false;
      const renewal = parseDateKey(subscription.renewal_date);
      return renewal >= today && renewal <= horizon;
    })
    .sort(
      (a, b) =>
        parseDateKey(a.renewal_date).getTime() -
        parseDateKey(b.renewal_date).getTime(),
    );
}