import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { trialLabel } from "@/lib/format";
import type { Subscription } from "@/types/subscription";

export function TrialAlerts({
  trials,
  loading,
  onView,
}: {
  trials: Subscription[];
  loading?: boolean;
  onView: (subscription: Subscription) => void;
}) {
  const endingSoon = trials.filter((trial) => trial.trial_alert === "ending_soon");

  return (
    <Card>
      <CardHeader
        title="Free trials"
        subtitle={
          endingSoon.length > 0
            ? `${endingSoon.length} ${
                endingSoon.length === 1 ? "trial ends" : "trials end"
              } within 3 days`
            : "Tracked trials with countdowns"
        }
      />
      {loading ? (
        <div className="space-y-3 px-5 py-4">
          {[0, 1].map((index) => (
            <div key={index} className="shimmer h-11 rounded-[14px]" />
          ))}
        </div>
      ) : trials.length === 0 ? (
        <EmptyState
          title="No free trials"
          description="When you add a trial subscription, its countdown will show up here."
        />
      ) : (
        <ul className="divide-y divide-line-soft">
          {trials.map((trial) => (
            <li key={trial.id}>
              <button
                onClick={() => onView(trial)}
                className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {trial.name}
                  </span>
                  <span className="text-xs text-muted">
                    Ends {trial.trial_end_date}
                  </span>
                </span>
                <Badge
                  tone={trial.trial_alert === "ending_soon" ? "warning" : "info"}
                  dot={trial.trial_alert === "ending_soon"}
                >
                  {trialLabel(trial)}
                </Badge>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function UnusedSuggestions({
  subscriptions,
  onMarkUsed,
  onView,
}: {
  subscriptions: Subscription[];
  onMarkUsed: (subscription: Subscription) => void;
  onView: (subscription: Subscription) => void;
}) {
  if (subscriptions.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-ink">Are you still using these?</h3>
        <p className="text-xs text-muted">
          Gentle reminders for subscriptions you have not used recently.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {subscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className="rounded-xl border border-warning/25 bg-warning-light/40 px-4 py-3"
          >
            <button
              onClick={() => onView(subscription)}
              className="block text-left"
            >
              <p className="text-sm font-semibold text-ink">{subscription.name}</p>
              <p className="mt-0.5 text-xs text-warning">
                {subscription.last_used_date
                  ? `Last used ${subscription.days_since_last_used ?? "some"} days ago`
                  : "Never marked as used"}
              </p>
            </button>
            <p className="mt-2 text-xs text-ink-soft">
              Are you still getting value from this subscription?
            </p>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkUsed(subscription)}
              >
                Used it recently
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}