import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/features/Subscription/AlertLabels";
import { formatFullDate } from "@/lib/format";
import type { Subscription } from "@/types/subscription";

export function DayRenewalsModal({
  selectedDay,
  subscriptions,
  onClose,
  onSelectSubscription,
}: {
  selectedDay: string | null;
  subscriptions: Subscription[];
  onClose: () => void;
  onSelectSubscription: (subscription: Subscription) => void;
}) {
  return (
    <Modal
      open={Boolean(selectedDay)}
      onClose={onClose}
      title={selectedDay ? formatFullDate(selectedDay) : undefined}
      description={`${subscriptions.length} renewal${subscriptions.length === 1 ? "" : "s"} on this day`}
    >
      {subscriptions.length === 0 ? (
        <p className="text-sm text-muted">Nothing renews on this day.</p>
      ) : (
        <ul className="divide-y divide-line-soft">
          {subscriptions.map((subscription) => (
            <li key={subscription.id}>
              <button
                onClick={() => onSelectSubscription(subscription)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-surface-2"
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
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold text-ink">
                    {Number(subscription.cost).toLocaleString("en-PH", {
                      style: "currency",
                      currency: "PHP",
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  <StatusBadge subscription={subscription} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}