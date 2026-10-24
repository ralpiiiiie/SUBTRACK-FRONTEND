import { useEffect } from "react";
import { useOutletContext } from "react-router";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { Icon } from "@/components/ui/Icon";
import { Topbar } from "@/components/common/Topbar";
import { SpendingByCategory } from "@/components/features/Dashboard/SpendingByCategory";
import { SubscriptionDetailModal } from "@/components/features/Subscription/SubscriptionDetailModal";
import { SubscriptionFormModal } from "@/components/features/Subscription/SubscriptionFormModal";
import {
  TrialAlerts,
  UnusedSuggestions,
} from "@/components/features/Dashboard/TrialAlerts";
import { UpcomingRenewals } from "@/components/features/Dashboard/UpcomingRenewals";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import {
  ensureLoaded,
  reload,
  useSubscriptionStore,
} from "@/state/subscriptionStore";
import { DashboardStats } from "@/components/features/Dashboard/DashboardStats";
import { EmptyDashboardState } from "@/components/features/Dashboard/EmptyDashboardState";
import { RecentSubscriptionsSection } from "@/components/features/Dashboard/RecentSubscriptionsSection";

type OutletContext = { openMenu: () => void };

export default function DashboardPage() {
  const { openMenu } = useOutletContext<OutletContext>();
  const store = useSubscriptionStore();

  useEffect(() => {
    void ensureLoaded();
  }, []);

  const actions = useSubscriptionActions();

  const data = store.dashboard;
  const error = store.status === "error" && !data ? store.error : null;
  const loading = (store.status === "loading" || store.status === "idle") && !data;

  const today = new Date();
  const subtitle = today.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen">
      <Topbar
        title="Dashboard"
        subtitle={subtitle}
        icon="dashboard"
        onOpenMenu={openMenu}
        actions={
          <Button onClick={actions.openCreate}>
            <Icon name="plus" className="h-4 w-4" />
            <span className="hidden sm:inline">Add Subscription</span>
            <span className="sm:hidden">Add</span>
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {error ? (
          <ErrorState
            title="Unable to load the dashboard"
            description={error}
            onRetry={() => {
              void reload();
            }}
          />
        ) : (
          <>
            <DashboardStats data={data} loading={loading} />

            {loading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="glass-card shimmer h-72" />
                <div className="glass-card shimmer h-72" />
              </div>
            ) : (
              <>
                <section className="grid items-start gap-4 lg:grid-cols-2">
                  <UpcomingRenewals
                    subscriptions={data?.upcoming_renewals ?? []}
                    onView={actions.openDetail}
                  />
                  <SpendingByCategory
                    breakdown={data?.spending_by_category ?? []}
                  />
                </section>

                {data && data.total_count === 0 ? (
                  <EmptyDashboardState onAdd={actions.openCreate} />
                ) : (
                  <>
                    {(data?.trial_count ?? 0) > 0 && (
                      <section>
                        <TrialAlerts
                          trials={data?.trials ?? []}
                          onView={actions.openDetail}
                        />
                      </section>
                    )}

                    {data?.unused_suggestions &&
                      data.unused_suggestions.length > 0 && (
                        <UnusedSuggestions
                          subscriptions={data.unused_suggestions}
                          onMarkUsed={actions.handleMarkUsed}
                          onView={actions.openDetail}
                        />
                      )}

                    <RecentSubscriptionsSection
                      subscriptions={data?.recent_subscriptions ?? []}
                      onView={actions.openDetail}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      <SubscriptionFormModal
        open={actions.isFormOpen}
        onClose={actions.closeForm}
        catalog={actions.catalog}
        subscription={actions.editing}
        onSaved={actions.handleSaved}
      />
      <SubscriptionDetailModal
        subscription={actions.detail}
        open={Boolean(actions.detail)}
        onClose={actions.closeDetail}
        onMarkUsed={actions.handleMarkUsed}
        onEdit={actions.openEdit}
        onDelete={actions.confirmDelete}
      />
      <ConfirmDialog
        open={Boolean(actions.deleting)}
        title="Delete subscription?"
        description={`Are you sure you want to delete "${actions.deleting?.name}"? This permanently removes it, including its history.`}
        confirmLabel="Delete"
        loading={actions.deleteLoading}
        onConfirm={actions.performDelete}
        onCancel={actions.cancelDelete}
      />
    </div>
  );
}