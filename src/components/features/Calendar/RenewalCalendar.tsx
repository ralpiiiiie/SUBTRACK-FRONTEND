import { Icon } from "@/components/ui/Icon";
import { CATEGORY_STYLES } from "@/lib/constants";
import { isDueWithinThreeDays, isToday } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import type { Subscription } from "@/types/subscription";
import { cn } from "@/lib/cn";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface CalendarMonth {
  year: number;
  month: number;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const days = daysInMonth(year, month);
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: days }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function RenewalCalendar({
  month,
  subscriptions,
  onMonthChange,
  onSelectSubscription,
  onSelectDay,
}: {
  month: CalendarMonth;
  subscriptions: Subscription[];
  onMonthChange: (month: CalendarMonth) => void;
  onSelectSubscription: (subscription: Subscription) => void;
  onSelectDay?: (dateKey: string) => void;
}) {
  const { year, month: monthIndex } = month;

  const byDay = new Map<number, Subscription[]>();
  for (const subscription of subscriptions) {
    const [y, m, d] = subscription.renewal_date.split("-").map(Number);
    if (y === year && m === monthIndex + 1) {
      const current = byDay.get(d) ?? [];
      current.push(subscription);
      byDay.set(d, current);
    }
  }

  const grid = buildGrid(year, monthIndex);

  const changeMonth = (offset: number) => {
    const next = new Date(year, monthIndex + offset, 1);
    onMonthChange({ year: next.getFullYear(), month: next.getMonth() });
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-ink-soft">
            <Icon name="calendar" className="h-4 w-4" />
          </span>
          <h2 className="font-display text-base font-semibold uppercase tracking-wide text-ink">
            {MONTH_LABELS[monthIndex]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => changeMonth(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2"
            aria-label="Previous month"
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              onMonthChange({ year: now.getFullYear(), month: now.getMonth() });
            }}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-2"
          >
            Today
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2"
            aria-label="Next month"
          >
            <Icon name="chevronRight" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-line-soft bg-surface">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted"
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label[0]}</span>
          </div>
        ))}
      </div>

      <div
        key={`${year}-${monthIndex}`}
        className="grid grid-cols-7 animate-fade-in gap-px bg-line-soft"
      >
        {grid.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-16 bg-transparent sm:min-h-24" />;
          }

          const renewals = byDay.get(day) ?? [];
          const dateStr = dateKey(year, monthIndex, day);
          const isCurrentDay = isToday(dateStr);
          const isDueSoon = renewals.some((s) => isDueWithinThreeDays(s.renewal_date));
          const dayClickable = renewals.length > 0 && onSelectDay;

          return (
            <div
              key={dateStr}
              className={cn(
                "min-h-16 bg-transparent p-1.5 sm:min-h-24 sm:p-2",
                isCurrentDay && "bg-primary-lighter/60",
                isDueSoon && "bg-danger-light ring-1 ring-inset ring-danger/30",
              )}
            >
              {dayClickable ? (
                <button
                  type="button"
                  onClick={() => onSelectDay(dateStr)}
                  aria-label={`View ${renewals.length} renewal${renewals.length === 1 ? "" : "s"} on ${dateStr}`}
                  title={`View ${renewals.length} renewal${renewals.length === 1 ? "" : "s"} on this day`}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all duration-200",
                    isCurrentDay
                      ? "bg-primary text-white"
                      : isDueSoon
                        ? "font-semibold text-danger hover:bg-danger/20"
                        : "text-ink-soft hover:bg-surface-2",
                  )}
                >
                  {day}
                </button>
              ) : (
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isCurrentDay ? "bg-primary text-white" : "text-ink-soft",
                  )}
                >
                  {day}
                </span>
              )}

              <div className="mt-1 space-y-1">
                {renewals.slice(0, 2).map((subscription) => {
                  const style = CATEGORY_STYLES[subscription.category];
                  return (
                    <button
                      key={subscription.id}
                      onClick={() => onSelectSubscription(subscription)}
                      title={`${subscription.name} · ${formatCurrency(subscription.cost)}`}
                      className="flex w-full items-center gap-1 rounded bg-surface-2 px-1 py-0.5 text-left text-[10px] font-medium text-ink transition-colors hover:bg-primary-light hover:text-primary sm:text-[11px]"
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
                      <span className="truncate">{subscription.name}</span>
                    </button>
                  );
                })}
                {renewals.length > 2 && dayClickable && (
                  <button
                    type="button"
                    onClick={() => onSelectDay(dateStr)}
                    className={cn(
                      "block w-full rounded px-1 text-left text-[10px] font-semibold uppercase tracking-wide transition-colors duration-200",
                      isDueSoon
                        ? "text-danger/80 hover:text-danger"
                        : "text-muted hover:text-primary",
                    )}
                  >
                    +{renewals.length - 2} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}