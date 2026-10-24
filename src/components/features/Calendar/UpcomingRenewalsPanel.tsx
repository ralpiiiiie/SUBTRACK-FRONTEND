import { Icon } from "@/components/ui/Icon";
import type { Subscription } from "@/types/subscription";
import { parseDateKey } from "@/lib/dates";

export function UpcomingRenewalsPanel({
  subscriptions,
  onSelect,
}: {
  subscriptions: Subscription[];
  onSelect: (subscription: Subscription) => void;
}) {
  return (
    <div className="glass-card lg:col-span-1">
      <div className="border-b border-line-soft px-5 py-4">
        <h3 className="font-display text-base font-semibold uppercase tracking-wide text-ink">Next 30 days</h3>
        <p className="mt-0.5 text-xs text-muted">Renewals you can plan for</p>
      </div>
      {subscriptions.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-8 text-center">
          <Icon name="check" className="mb-2 h-5 w-5 text-success" />
          <p className="text-sm text-muted">
            Nothing renews in the next 30 days.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line-soft">
          {subscriptions.map((subscription) => {
            const renewal = parseDateKey(subscription.renewal_date);
            return (
              <li key={subscription.id}>
                <button
                  onClick={() => onSelect(subscription)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {subscription.name}
                    </span>
                    <span className="text-xs text-muted">
                      {subscription.billing_cycle_label} ·{" "}
                      {subscription.category_label}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-ink">
                      {Number(subscription.cost).toLocaleString("en-PH", {
                        style: "currency",
                        currency: "PHP",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    <span className="text-xs text-muted">
                      {renewal.toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function HowItWorksPanel() {
  return (
    <div className="hidden lg:col-span-2 lg:block">
      <div className="glass-card px-6 py-5">
        <h3 className="font-display text-base font-semibold uppercase tracking-wide text-ink">How it works</h3>
        <ul className="mt-3 space-y-3 text-sm text-muted">
          <li className="flex gap-2.5">
            <Icon name="calendar" className="mt-0.5 h-4 w-4 text-primary" />
            Renewal dates come straight from your subscriptions — edit a
            renewal date and it updates here instantly.
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-danger-light ring-1 ring-inset ring-danger/30 text-[10px] font-bold leading-none text-danger">
              !
            </span>
            Days with a renewal within the next 3 days are flagged in red —
            everything later stays normal.
          </li>
          <li className="flex gap-2.5">
            <Icon name="spark" className="mt-0.5 h-4 w-4 text-success" />
            Click a date to see every renewal due on that day.
          </li>
        </ul>
      </div>
    </div>
  );
}