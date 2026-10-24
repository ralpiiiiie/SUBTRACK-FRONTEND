import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Icon } from "@/components/ui/Icon";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { SubscriptionRow } from "@/components/features/Subscription/SubscriptionList";
import type { Subscription } from "@/types/subscription";

export function SubscriptionResults({
  error,
  loading,
  filtered,
  hasActiveFilters,
  onRetry,
  onClearFilters,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  error: string | null;
  loading: boolean;
  filtered: Subscription[];
  hasActiveFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onCreate: () => void;
  onView: (subscription: Subscription) => void;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
  onToggleStatus: (subscription: Subscription) => void;
}) {
  if (error) {
    return (
      <ErrorState
        title="Unable to load subscriptions"
        description={error}
        onRetry={onRetry}
      />
    );
  }

  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <SkeletonRows rows={6} />
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="glass-card overflow-hidden">
        {hasActiveFilters ? (
          <EmptyState
            title="No subscriptions match your filters"
            description="Try adjusting the search or clearing filters."
            icon={<Icon name="search" className="h-5 w-5" />}
            action={
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No subscriptions yet"
            description="Add your first subscription to start tracking your recurring expenses and know when each one is due."
            icon={<Icon name="plus" className="h-5 w-5" />}
            action={
              <Button size="sm" onClick={onCreate}>
                <Icon name="plus" className="h-4 w-4" />
                Add your first subscription
              </Button>
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="hidden items-center gap-4 border-b border-line-soft bg-surface px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted md:grid md:grid-cols-[minmax(0,1.6fr)_1fr_1fr_1.1fr_auto_auto]">
        <span>Service</span>
        <span className="text-center md:translate-x-[-100px]">Cost</span>
        <span className="text-center md:translate-x-[-130px]">Renewal</span>
        <span className="text-center md:translate-x-[-130px]">Trial</span>
        <span className="text-center md:translate-x-[-100px]">Status</span>
        <span className="text-right">Actions</span>
      </div>
      <div>
        {filtered.map((subscription) => (
          <SubscriptionRow
            key={subscription.id}
            subscription={subscription}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </div>
  );
}