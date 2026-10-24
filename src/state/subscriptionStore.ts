import { useSyncExternalStore } from "react";
import { CATEGORY_LABELS } from "@/lib/constants";
import { startOfToday } from "@/lib/dates";
import {
  getCatalog,
  getDashboard,
  getSubscriptions,
} from "@/services/subscriptionService";
import type {
  CatalogMeta,
  Category,
  CategorySpend,
  DashboardData,
  Subscription,
} from "@/types/subscription";

const DAY_MS = 86_400_000;
const UPCOMING_DAYS = 7;
const UNUSED_THRESHOLD_DAYS = 30;

export type StoreStatus = "idle" | "loading" | "ready" | "error";

export interface SubscriptionStoreState {
  status: StoreStatus;
  error: string | null;
  subscriptions: Subscription[];
  dashboard: DashboardData | null;
  catalog: CatalogMeta | null;
}

const INITIAL_STATE: SubscriptionStoreState = {
  status: "idle",
  error: null,
  subscriptions: [],
  dashboard: null,
  catalog: null,
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeDashboard(subscriptions: Subscription[]): DashboardData {
  const active = subscriptions.filter((s) => s.status === "active");
  const paused = subscriptions.filter((s) => s.status === "paused");
  const todayMs = startOfToday().getTime();

  const totalMonthly = round2(
    active.reduce((total, s) => total + s.monthly_cost, 0),
  );
  const totalYearly = round2(
    active.reduce((total, s) => total + s.yearly_cost, 0),
  );
  const pausedMonthly = round2(
    paused.reduce((total, s) => total + s.monthly_cost, 0),
  );

  const upcoming = subscriptions
    .filter((s) => s.status !== "cancelled" && s.days_until_renewal <= UPCOMING_DAYS)
    .sort((a, b) => a.days_until_renewal - b.days_until_renewal)
    .slice(0, 5);

  const trials = subscriptions
    .filter((s) => s.is_trial && s.status === "active")
    .sort((a, b) => (a.trial_end_date ?? "9999-12-31").localeCompare(b.trial_end_date ?? "9999-12-31"));

  const unused = subscriptions
    .filter((s) => s.status !== "cancelled")
    .filter((s) => {
      if (s.last_used_date) {
        return (s.days_since_last_used ?? 0) >= UNUSED_THRESHOLD_DAYS;
      }
      return s.created_at
        ? new Date(s.created_at).getTime() < todayMs - UNUSED_THRESHOLD_DAYS * DAY_MS
        : false;
    })
    .sort((a, b) => (b.last_used_date ?? "").localeCompare(a.last_used_date ?? ""))
    .slice(0, 3);

  const recentSubscriptions = [...subscriptions]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const categoryOrder = Object.keys(CATEGORY_LABELS) as Category[];

  const spendingByCategory: CategorySpend[] = categoryOrder
    .map((category) => {
      const items = active.filter((s) => s.category === category);
      return {
        category,
        label: CATEGORY_LABELS[category],
        monthly: round2(items.reduce((total, s) => total + s.monthly_cost, 0)),
        yearly: round2(items.reduce((total, s) => total + s.yearly_cost, 0)),
        count: items.length,
      };
    })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.monthly - a.monthly || a.category.localeCompare(b.category));

  return {
    total_monthly: totalMonthly,
    total_yearly: totalYearly,
    paused_monthly: pausedMonthly,
    active_count: active.length,
    paused_count: paused.length,
    cancelled_count: subscriptions.filter((s) => s.status === "cancelled").length,
    total_count: subscriptions.length,
    trial_count: trials.length,
    due_soon_count: upcoming.length,
    upcoming_renewals: upcoming,
    trials,
    unused_suggestions: unused,
    spending_by_category: spendingByCategory,
    recent_subscriptions: recentSubscriptions,
  };
}

let state: SubscriptionStoreState = INITIAL_STATE;
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;
let loadToken = 0;

function emit(): void {
  for (const listener of listeners) listener();
}

function commit(next: SubscriptionStoreState): void {
  if (next === state) return;
  state = next;
  emit();
}

function toError(e: unknown): string {
  return e instanceof Error ? e.message : "Request failed. Please try again.";
}

async function runLoad(token: number): Promise<void> {
  try {
    const [catalog, pages, dashboard] = await Promise.all([
      getCatalog(),
      getSubscriptions({ per_page: 100, sort: "renewal_date" }),
      getDashboard(),
    ]);
    // A reset() (logout / user switch) bumps the token; drop this stale
    // result so the previous user's data never leaks into a new session.
    if (token !== loadToken) return;
    commit({
      status: "ready",
      error: null,
      subscriptions: pages.data ?? [],
      dashboard,
      catalog,
    });
  } catch (e) {
    if (token !== loadToken) return;
    commit({ ...state, status: "error", error: toError(e) });
  } finally {
    if (token === loadToken) inflight = null;
  }
}

function load(force: boolean): Promise<void> {
  if (inflight) return inflight;
  if (!force && (state.status === "ready" || state.status === "loading")) {
    return Promise.resolve();
  }
  commit({ ...state, status: "loading", error: null });
  const promise = runLoad(loadToken);
  inflight = promise;
  return promise;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getState(): SubscriptionStoreState {
  return state;
}

export function useSubscriptionStore(): SubscriptionStoreState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function getSubscriptionById(id: string): Subscription | null {
  return state.subscriptions.find((s) => s.id === id) ?? null;
}

/**
 * Load the current user's subscriptions, dashboard and catalog at most once.
 * Subsequent calls are no-ops unless the store was reset or errored.
 */
export function ensureLoaded(): Promise<void> {
  return load(false);
}

/**
 * Force a fresh round trip from the backend, keeping old data visible in the
 * meantime. Used by retries and the "Recheck connection" action.
 */
export function reload(): Promise<void> {
  return load(true);
}

/**
 * Clear all cached data, e.g. when the authenticated user changes or logs out.
 * Also invalidates any in-flight load so its late result is dropped.
 */
export function reset(): void {
  loadToken += 1;
  inflight = null;
  commit(INITIAL_STATE);
}

function derive(nextSubscriptions: Subscription[]): SubscriptionStoreState {
  return {
    ...state,
    subscriptions: nextSubscriptions,
    dashboard: computeDashboard(nextSubscriptions),
  };
}

/**
 * Insert or replace a subscription returned by the backend (server truth).
 */
export function upsertSubscription(subscription: Subscription): void {
  const exists = state.subscriptions.some((s) => s.id === subscription.id);
  const next = exists
    ? state.subscriptions.map((s) => (s.id === subscription.id ? subscription : s))
    : [...state.subscriptions, subscription];
  commit(derive(next));
}

/**
 * Apply an optimistic subscription snapshot before the backend confirms.
 */
export function patchSubscription(subscription: Subscription): void {
  const next = state.subscriptions.map((s) =>
    s.id === subscription.id ? subscription : s,
  );
  commit(derive(next));
}

/**
 * Optimistically remove a subscription (row disappears immediately).
 */
export function removeSubscription(id: string): void {
  commit(derive(state.subscriptions.filter((s) => s.id !== id)));
}