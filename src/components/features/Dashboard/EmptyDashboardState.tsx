import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function EmptyDashboardState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
        <Icon name="plus" className="h-6 w-6" />
      </div>
      <h2 className="text-base font-semibold text-ink">No subscriptions yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Add your first subscription to start tracking your recurring
        expenses and see upcoming renewals.
      </p>
      <Button className="mt-6" onClick={onAdd}>
        <Icon name="plus" className="h-4 w-4" />
        Add your first subscription
      </Button>
    </div>
  );
}