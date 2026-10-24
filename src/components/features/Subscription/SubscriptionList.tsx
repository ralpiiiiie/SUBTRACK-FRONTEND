import { Button } from "@/components/ui/Button";
import { CATEGORY_STYLES } from "@/lib/constants";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import {
  RenewalBadge,
  StatusBadge,
  TrialBadge,
} from "@/components/features/Subscription/AlertLabels";
import type { Subscription } from "@/types/subscription";
import { cn } from "@/lib/cn";

export interface SubscriptionRowProps {
  subscription: Subscription;
  onView: (subscription: Subscription) => void;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
  onToggleStatus: (subscription: Subscription) => void;
  compact?: boolean;
}

const statusCardStyles: Record<string, { border: string; bg: string }> = {
  active: { border: "border-line", bg: "bg-transparent" },
  paused: { border: "border-warning/30", bg: "bg-warning/5" },
  cancelled: { border: "border-danger/30", bg: "bg-danger/5" },
};

const statusContentStyles: Record<string, string> = {
  active: "",
  paused: "opacity-70",
  cancelled: "opacity-50 line-through",
};

export function SubscriptionCard({ subscription, onView }: { subscription: Subscription; onView: (s: Subscription) => void }) {
  const categoryStyle = CATEGORY_STYLES[subscription.category];
  const cardStyle = statusCardStyles[subscription.status];
  const contentStyle = statusContentStyles[subscription.status];

  return (
    <button
      onClick={() => onView(subscription)}
      className={cn(
        "glass-card w-full px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-pop",
        cardStyle.border,
        cardStyle.bg,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${categoryStyle.dot}`} />
            <h3 className={cn("truncate text-sm font-semibold text-ink", contentStyle)}>
              {subscription.name}
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-muted">{subscription.category_label}</p>
        </div>
        <StatusBadge subscription={subscription} />
      </div>

      <div className={cn("mt-3 flex items-baseline gap-1.5", contentStyle)}>
        <span className="text-lg font-semibold tracking-tight text-ink">
          {formatCurrency(subscription.cost)}
        </span>
        <span className="text-xs text-muted">
          / {subscription.billing_cycle_label.toLowerCase()}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <RenewalBadge subscription={subscription} />
        <TrialBadge subscription={subscription} />
      </div>
    </button>
  );
}

export function SubscriptionRow({
  subscription,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  compact,
}: SubscriptionRowProps) {
  const categoryStyle = CATEGORY_STYLES[subscription.category];
  const cardStyle = statusCardStyles[subscription.status];
  const contentStyle = statusContentStyles[subscription.status];

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 border-b border-line-soft px-4 py-4 transition-colors hover:bg-surface-2 sm:px-5 md:grid-cols-[minmax(0,1.6fr)_1fr_1fr_1.1fr_auto_auto] md:items-center md:gap-4",
        "last:border-0",
        compact && "md:grid-cols-[minmax(0,1.6fr)_1.2fr_1fr_auto] md:py-3.5",
        cardStyle.border,
        cardStyle.bg,
      )}
    >
      <div className="min-w-0">
        <button
          onClick={() => onView(subscription)}
          className="group flex min-w-0 items-center gap-2.5 text-left"
        >
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white",
              categoryStyle.dot,
            )}
          >
            {subscription.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className={cn("block truncate text-sm font-semibold text-ink group-hover:text-primary", contentStyle)}>
              {subscription.name}
            </span>
            <span className="block truncate text-xs text-muted">
              {subscription.category_label}
              {subscription.payment_method
                ? ` · ${subscription.payment_method}`
                : ""}
            </span>
          </span>
        </button>
      </div>

      <div className="flex items-baseline gap-1.5 md:block">
        <span className={cn("text-sm font-semibold text-ink", contentStyle)}>
          {formatCurrency(subscription.cost)}
        </span>
        <span className="text-xs text-muted">
          / {subscription.billing_cycle_label.toLowerCase()}
        </span>
        <p className="hidden text-xs text-muted md:mt-0.5 md:block">
          ≈ {formatCurrency(subscription.monthly_cost)}/mo
        </p>
      </div>

      <div className="md:hidden" />

      <RenewalBadge subscription={subscription} />

      <div className="flex flex-wrap gap-1.5 md:justify-start">
        <TrialBadge subscription={subscription} />
      </div>

      <div className="flex justify-center">
        <StatusBadge
          subscription={subscription}
          className="min-w-[7rem] justify-center whitespace-nowrap"
        />
      </div>

      <div className="flex items-center gap-1 md:justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(subscription)}
          aria-label={`Edit ${subscription.name}`}
          title="Edit"
        >
          <Icon name="edit" className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleStatus(subscription)}
          aria-label={subscription.status === "paused" ? `Resume ${subscription.name}` : `Pause ${subscription.name}`}
          title={subscription.status === "paused" ? "Resume" : "Pause"}
          disabled={subscription.status === "cancelled"}
        >
          <Icon
            name={subscription.status === "paused" ? "play" : "pause"}
            className="h-4 w-4"
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(subscription)}
          aria-label={`Delete ${subscription.name}`}
          title="Delete"
          className="hover:text-danger"
        >
          <Icon name="trash" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function RecentSubscriptionRow({
  subscription,
  onView,
}: {
  subscription: Subscription;
  onView: (s: Subscription) => void;
}) {
  const categoryStyle = CATEGORY_STYLES[subscription.category];
  const contentStyle = statusContentStyles[subscription.status];
  const cardStyle = statusCardStyles[subscription.status];

  return (
    <button
      onClick={() => onView(subscription)}
      className={cn(
        "flex w-full items-center justify-between gap-3 border-b border-line-soft px-5 py-3 text-left transition-colors last:border-0 hover:bg-surface-2",
        cardStyle.border,
        cardStyle.bg,
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className={`h-2 w-2 shrink-0 rounded-full ${categoryStyle.dot}`} />
        <span className={cn("min-w-0", contentStyle)}>
          <span className="block truncate text-sm font-medium text-ink">
            {subscription.name}
          </span>
          <span className="block text-xs text-muted">
            {formatCurrency(subscription.cost)} /{" "}
            {subscription.billing_cycle_label.toLowerCase()}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <StatusBadge subscription={subscription} />
        <span className="hidden text-xs text-muted sm:block">
          {formatShortDate(subscription.renewal_date)}
        </span>
      </span>
    </button>
  );
}

export function SubscriptionListRecent({
  subscriptions,
  onView,
  loading,
  emptyTitle = "No subscriptions yet",
}: {
  subscriptions: Subscription[];
  onView: (s: Subscription) => void;
  loading?: boolean;
  emptyTitle?: string;
}) {
  return (
    <div className="glass-card overflow-hidden">
      {loading ? (
        <div className="space-y-3 px-5 py-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="shimmer h-11 rounded-[14px]" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-medium text-ink">{emptyTitle}</p>
          <p className="mt-1 text-xs text-muted">
            Your newest subscriptions will appear here.
          </p>
        </div>
      ) : (
        <div>
          {subscriptions.map((subscription) => (
            <RecentSubscriptionRow
              key={subscription.id}
              subscription={subscription}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
}