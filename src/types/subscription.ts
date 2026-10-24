export type BillingCycle = "weekly" | "monthly" | "yearly";

export type Category =
  | "entertainment"
  | "productivity"
  | "fitness"
  | "utility"
  | "education"
  | "gaming"
  | "cloud_storage"
  | "other";

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type RenewalAlert =
  | "overdue"
  | "due_today"
  | "due_soon"
  | "approaching"
  | "later";

export type TrialAlert = "ended" | "ending_soon" | "active" | null;

export interface Estimate {
  monthly: number;
  yearly: number;
}

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  billing_cycle: BillingCycle;
  billing_cycle_label: string;
  renewal_date: string;
  category: Category;
  category_label: string;
  payment_method: string | null;
  status: SubscriptionStatus;
  status_label: string;
  is_trial: boolean;
  trial_end_date: string | null;
  last_used_date: string | null;
  notes: string | null;
  monthly_cost: number;
  yearly_cost: number;
  days_until_renewal: number;
  renewal_alert: RenewalAlert;
  trial_days_remaining: number | null;
  trial_alert: TrialAlert;
  days_since_last_used: number | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPayload {
  name: string;
  cost: number | string;
  billing_cycle: BillingCycle;
  renewal_date: string;
  category: Category;
  payment_method?: string | null;
  status: SubscriptionStatus;
  is_trial: boolean;
  trial_end_date?: string | null;
  last_used_date?: string | null;
  notes?: string | null;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CategorySpend {
  category: Category;
  label: string;
  monthly: number;
  yearly: number;
  count: number;
}

export interface DashboardData {
  total_monthly: number;
  total_yearly: number;
  paused_monthly: number;
  active_count: number;
  paused_count: number;
  cancelled_count: number;
  total_count: number;
  trial_count: number;
  due_soon_count: number;
  upcoming_renewals: Subscription[];
  trials: Subscription[];
  unused_suggestions: Subscription[];
  spending_by_category: CategorySpend[];
  recent_subscriptions: Subscription[];
}

export interface LabeledOption {
  value: string;
  label: string;
}

export interface CatalogMeta {
  billing_cycles: BillingCycle[];
  categories: Category[];
  statuses: SubscriptionStatus[];
  category_labels: Record<string, string>;
  billing_cycle_labels: Record<string, string>;
  status_labels: Record<string, string>;
  payment_methods: string[];
}

export interface SubscriptionFilters {
  search?: string;
  category?: string;
  status?: string;
  billing_cycle?: string;
  sort?: "name" | "cost" | "renewal_date" | "created_at";
  sort_dir?: "asc" | "desc";
  per_page?: number;
}