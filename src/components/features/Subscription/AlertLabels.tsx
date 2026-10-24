import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import {
  RENEWAL_STYLES,
  STATUS_LABELS,
  TRIAL_STYLES,
} from "@/lib/constants";
import { renewalLabel, trialLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import type {
  RenewalAlert,
  Subscription,
  TrialAlert,
} from "@/types/subscription";

const RENEWAL_ICONS: Record<RenewalAlert, IconName | null> = {
  overdue: "alertCircle",
  due_today: "alertCircle",
  due_soon: "alertTriangle",
  approaching: "clock",
  later: null,
};

const TRIAL_ICONS: Record<Exclude<TrialAlert, null>, IconName | null> = {
  ended: "check",
  ending_soon: "alertTriangle",
  active: "spark",
};

const STATUS_ICONS: Record<string, IconName> = {
  active: "check",
  paused: "pause",
  cancelled: "x",
};

const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  paused: "warning",
  cancelled: "danger",
};

export function StatusBadge({
  subscription,
  className,
}: {
  subscription: Subscription;
  className?: string;
}) {
  const status = subscription.status;
  const tone = STATUS_TONES[status];
  const icon = STATUS_ICONS[status];

  return (
    <Badge tone={tone} dot={true} className={cn("gap-1.5", className)}>
      <Icon name={icon} className="h-3 w-3 shrink-0" />
      <span className="font-medium">{STATUS_LABELS[status]}</span>
    </Badge>
  );
}

export function RenewalBadge({ subscription }: { subscription: Subscription }) {
  if (subscription.status === "cancelled") {
    return <span className="text-xs text-muted">Cancelled</span>;
  }

  const tone = RENEWAL_STYLES[subscription.renewal_alert];
  const icon = RENEWAL_ICONS[subscription.renewal_alert];
  return (
    <Badge tone={tone}>
      {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
      {renewalLabel(subscription)}
    </Badge>
  );
}

export function TrialBadge({ subscription }: { subscription: Subscription }) {
  if (!subscription.is_trial || !subscription.trial_alert) return null;

  const tone = TRIAL_STYLES[subscription.trial_alert];
  const icon = TRIAL_ICONS[subscription.trial_alert];
  return (
    <Badge tone={tone}>
      {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
      {trialLabel(subscription)}
    </Badge>
  );
}

export { STATUS_LABELS };