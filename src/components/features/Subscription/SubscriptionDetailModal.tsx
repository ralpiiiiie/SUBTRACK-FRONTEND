import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/features/Subscription/AlertLabels";
import { CATEGORY_STYLES } from "@/lib/constants";
import {
  formatCurrency,
  formatFullDate,
  renewalLabel,
  trialLabel,
} from "@/lib/format";
import type { Subscription } from "@/types/subscription";

export interface SubscriptionDetailModalProps {
  subscription: Subscription | null;
  open: boolean;
  onClose: () => void;
  onMarkUsed: (subscription: Subscription) => void;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
  centerOnMobile?: boolean;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function SubscriptionDetailModal({
  subscription,
  open,
  onClose,
  onMarkUsed,
  onEdit,
  onDelete,
  centerOnMobile,
}: SubscriptionDetailModalProps) {
  if (!subscription) return null;

  const categoryStyle = CATEGORY_STYLES[subscription.category];
  const trialText = subscription.is_trial
    ? subscription.trial_end_date
      ? `${trialLabel(subscription)} · ${formatFullDate(subscription.trial_end_date)}`
      : "Free trial"
    : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={subscription.name}
      description={
        <span className="inline-flex items-center gap-2">
          <span
            className={`inline-flex h-2 w-2 rounded-full ${categoryStyle.dot}`}
          />
          {subscription.category_label}
        </span>
      }
      variant={centerOnMobile ? "centered-mobile" : "default"}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => onMarkUsed(subscription)}
            disabled={subscription.last_used_date
              ? subscription.days_since_last_used === 0
              : false}
          >
            Mark as used
          </Button>
          <Button variant="secondary" onClick={() => onEdit(subscription)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => onDelete(subscription)}>
            Delete
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-line bg-surface-2 p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Cost</p>
            <p className="font-display text-3xl font-semibold tracking-wide text-ink">
              {formatCurrency(subscription.cost)}
              <span className="ml-1 text-sm font-normal text-muted">
                / {subscription.billing_cycle_label.toLowerCase()}
              </span>
            </p>
          </div>
          <StatusBadge subscription={subscription} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="info">{`≈ ${formatCurrency(subscription.monthly_cost)}/month`}</Badge>
          <Badge tone="info">{`≈ ${formatCurrency(subscription.yearly_cost)}/year`}</Badge>
        </div>
      </div>

      <dl className="mt-4 divide-y divide-line-soft">
        <DetailRow
          label="Next renewal"
          value={
            <span className="flex flex-col items-end">
              <span>{formatFullDate(subscription.renewal_date)}</span>
              <span className="text-xs font-medium text-muted">
                {renewalLabel(subscription)}
              </span>
            </span>
          }
        />
        <DetailRow label="Billing cycle" value={subscription.billing_cycle_label} />
        <DetailRow label="Payment method" value={subscription.payment_method || "—"} />
        {trialText && <DetailRow label="Free trial" value={trialText} />}
        <DetailRow
          label="Last used"
          value={
            subscription.last_used_date
              ? `${formatFullDate(subscription.last_used_date)}${
                  subscription.days_since_last_used != null &&
                  subscription.days_since_last_used > 30
                    ? ` · ${subscription.days_since_last_used} days ago`
                    : ""
                }`
              : "—"
          }
        />
        {subscription.notes && (
          <div className="py-2">
            <dt className="text-sm text-muted">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">
              {subscription.notes}
            </dd>
          </div>
        )}
      </dl>
    </Modal>
  );
}