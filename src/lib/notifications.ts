import { formatCurrency, renewalLabel, trialLabel } from "@/lib/format";
import type { NotificationPreferences } from "@/types/settings";
import type { Subscription } from "@/types/subscription";

export const UNUSED_NOTIFICATION_DAYS = 30;

export type NotificationKind = "renewal" | "expired" | "trial" | "unused";

export type NotificationSeverity = "danger" | "warning" | "neutral";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  detail: string;
  subscription: Subscription;
}

export const NOTIFICATION_SEVERITY_DOT: Record<NotificationSeverity, string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  neutral: "bg-muted",
};

const SEVERITY_ORDER: Record<NotificationSeverity, number> = {
  danger: 0,
  warning: 1,
  neutral: 2,
};

function renewalSeverity(days: number): NotificationSeverity {
  if (days <= 1) return "danger";
  return "warning";
}

export function notificationPrice(subscription: Subscription): string {
  return `${formatCurrency(subscription.cost)} / ${subscription.billing_cycle_label.toLowerCase()}`;
}

/**
 * Compute actionable notifications for the given subscriptions using the
 * server-computed day offsets (days_until_renewal, trial_days_remaining,
 * days_since_last_used). One notification per subscription — the most severe
 * — so the popup and the bell stay consistent.
 */
export function buildNotifications(
  subscriptions: Subscription[],
  preferences: NotificationPreferences,
): AppNotification[] {
  const items: AppNotification[] = [];

  for (const subscription of subscriptions) {
    if (subscription.status !== "active") continue;

    const renewalDays = subscription.days_until_renewal;
    const trialDays = subscription.trial_days_remaining;
    const unusedDays = subscription.days_since_last_used;

    let item: AppNotification | null = null;

    if (renewalDays < 0 && preferences.expiredAlerts) {
      item = {
        id: `${subscription.id}:expired`,
        kind: "expired",
        severity: "danger",
        title: "Subscription expired",
        detail: renewalLabel(subscription),
        subscription,
      };
    } else if (renewalDays >= 0 && renewalDays <= preferences.reminderDays && preferences.renewalReminders) {
      item = {
        id: `${subscription.id}:renewal`,
        kind: "renewal",
        severity: renewalSeverity(renewalDays),
        title: renewalLabel(subscription),
        detail: notificationPrice(subscription),
        subscription,
      };
    } else if (
      subscription.is_trial &&
      trialDays !== null &&
      trialDays !== undefined &&
      preferences.trialReminders &&
      (trialDays <= preferences.reminderDays || trialDays < 0)
    ) {
      item = {
        id: `${subscription.id}:trial`,
        kind: "trial",
        severity: "warning",
        title: trialLabel(subscription),
        detail: notificationPrice(subscription),
        subscription,
      };
    } else if (
      unusedDays !== null &&
      unusedDays !== undefined &&
      unusedDays >= UNUSED_NOTIFICATION_DAYS
    ) {
      item = {
        id: `${subscription.id}:unused`,
        kind: "unused",
        severity: "neutral",
        title: "Not used recently",
        detail: `You haven't marked it as used in ${unusedDays} days.`,
        subscription,
      };
    }

    if (item) items.push(item);
  }

  return items.sort((a, b) => {
    const severityDelta = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (severityDelta !== 0) return severityDelta;
    return a.subscription.days_until_renewal - b.subscription.days_until_renewal;
  });
}