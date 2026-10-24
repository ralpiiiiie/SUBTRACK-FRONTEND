import type {
  BillingCycle,
  Category,
  RenewalAlert,
  SubscriptionStatus,
  TrialAlert,
} from "@/types/subscription";
import type { NotificationPreferences } from "@/types/settings";

export const CURRENCY_SYMBOL = "₱";
export const DEFAULT_CURRENCY = "PHP";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  renewalReminders: true,
  trialReminders: true,
  expiredAlerts: true,
  reminderDays: 3,
  defaultBillingCycle: "monthly",
  defaultCurrency: DEFAULT_CURRENCY,
};

export const REMINDER_DAY_OPTIONS = [1, 2, 3, 5, 7, 14] as const;

export const CATEGORY_LABELS: Record<Category, string> = {
  entertainment: "Entertainment",
  productivity: "Productivity",
  fitness: "Fitness",
  utility: "Utility",
  education: "Education",
  gaming: "Gaming",
  cloud_storage: "Cloud Storage",
  other: "Other",
};

export const CATEGORY_STYLES: Record<
  Category,
  { badge: string; dot: string; bar: string }
> = {
  entertainment: {
    badge: "bg-violet-500/15 text-violet-300 ring-violet-400/30",
    dot: "bg-violet-400",
    bar: "bg-violet-400",
  },
  productivity: {
    badge: "bg-blue-500/15 text-blue-300 ring-blue-400/30",
    dot: "bg-blue-400",
    bar: "bg-blue-400",
  },
  fitness: {
    badge: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
    dot: "bg-emerald-400",
    bar: "bg-emerald-400",
  },
  utility: {
    badge: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
  },
  education: {
    badge: "bg-teal-500/15 text-teal-300 ring-teal-400/30",
    dot: "bg-teal-400",
    bar: "bg-teal-400",
  },
  gaming: {
    badge: "bg-indigo-500/15 text-indigo-300 ring-indigo-400/30",
    dot: "bg-indigo-400",
    bar: "bg-indigo-400",
  },
  cloud_storage: {
    badge: "bg-cyan-500/15 text-cyan-300 ring-cyan-400/30",
    dot: "bg-cyan-400",
    bar: "bg-cyan-400",
  },
  other: {
    badge: "bg-white/[0.07] text-ink-soft ring-white/10",
    dot: "bg-muted",
    bar: "bg-muted",
  },
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
};

export const STATUS_STYLES: Record<
  SubscriptionStatus,
  { badge: string; dot: string }
> = {
  active: {
    badge: "bg-success-light text-success ring-success/30",
    dot: "bg-success",
  },
  paused: {
    badge: "bg-warning-light text-warning ring-warning/30",
    dot: "bg-warning",
  },
  cancelled: {
    badge: "bg-white/[0.07] text-muted ring-white/10",
    dot: "bg-faint",
  },
};

export const RENEWAL_STYLES: Record<
  RenewalAlert,
  "danger" | "warning" | "info" | "neutral"
> = {
  overdue: "danger",
  due_today: "danger",
  due_soon: "warning",
  approaching: "info",
  later: "neutral",
};

export const TRIAL_STYLES: Record<Exclude<TrialAlert, null>, "warning" | "info" | "neutral"> = {
  ended: "neutral",
  ending_soon: "warning",
  active: "info",
};

export const CAPTIONS = {
  appName: "SubTrack",
  tagline: "Know what you pay, and know when it's due.",
};