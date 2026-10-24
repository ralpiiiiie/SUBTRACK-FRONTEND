import { Link } from "react-router";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { RenewalBadge, StatusBadge, TrialBadge } from "@/components/features/Subscription/AlertLabels";
import { CATEGORY_STYLES } from "@/lib/constants";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { Subscription } from "@/types/subscription";

export function UpcomingRenewals({
  subscriptions,
  loading,
  onView,
}: {
  subscriptions: Subscription[];
  loading?: boolean;
  onView: (subscription: Subscription) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Upcoming renewals"
        subtitle="Charges due in the next 7 days"
        action={
          <Link to="/calendar">
            <Button variant="ghost" size="sm">
              Calendar
              <Icon name="chevronRight" className="h-3.5 w-3.5" />
            </Button>
          </Link>
        }
      />
      {loading ? (
        <div className="space-y-3 px-5 py-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="shimmer h-12 rounded-[14px]" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          title="Nothing due soon"
          description="No subscriptions are renewing in the next 7 days. Enjoy the break."
          icon={<Icon name="bell" className="h-5 w-5" />}
        />
      ) : (
        <ul className="divide-y divide-line-soft">
          {subscriptions.map((subscription) => {
            const style = CATEGORY_STYLES[subscription.category];
            return (
              <li key={subscription.id}>
                <button
                  onClick={() => onView(subscription)}
                  className="flex w-full flex-col items-stretch gap-2 px-4 py-3.5 text-left transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3"
                >
                  <span className="flex min-w-0 items-start gap-3 sm:items-center">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white ${style.dot}`}
                    >
                      {subscription.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                        <span className="min-w-0 break-words text-sm font-semibold text-ink">
                          {subscription.name}
                        </span>
                        <StatusBadge subscription={subscription} />
                        <TrialBadge subscription={subscription} />
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {formatCurrency(subscription.cost)} /{" "}
                        {subscription.billing_cycle_label.toLowerCase()} ·{" "}
                        {formatShortDate(subscription.renewal_date)}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 self-start sm:self-auto">
                    <RenewalBadge subscription={subscription} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}