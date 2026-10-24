import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { CATEGORY_STYLES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { CategorySpend } from "@/types/subscription";

export function SpendingByCategory({
  breakdown,
  loading,
}: {
  breakdown: CategorySpend[];
  loading?: boolean;
}) {
  const max = Math.max(1, ...breakdown.map((row) => row.monthly));

  return (
    <Card>
      <CardHeader
        title="Spending by category"
        subtitle="Monthly equivalent for active subscriptions"
      />
      {loading ? (
        <div className="space-y-4 px-5 py-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      ) : breakdown.length === 0 ? (
        <EmptyState
          title="No spending to show"
          description="Add active subscriptions to see how your money is distributed."
          icon={<Icon name="tag" className="h-5 w-5" />}
        />
      ) : (
        <div className="space-y-4 px-5 py-4">
          {breakdown.map((row) => {
            const style = CATEGORY_STYLES[row.category];
            return (
              <div key={row.category}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium text-ink-soft">
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    {row.label}
                    <span className="text-xs text-muted">
                      {row.count} {row.count === 1 ? "sub" : "subs"}
                    </span>
                  </span>
                  <span className="font-semibold text-ink">
                    {formatCurrency(row.monthly)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full ${style.bar} transition-all`}
                    style={{ width: `${(row.monthly / max) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}