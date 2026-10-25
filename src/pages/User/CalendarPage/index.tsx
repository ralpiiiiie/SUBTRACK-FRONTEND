import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Icon } from "@/components/ui/Icon";
import { Topbar } from "@/components/common/Topbar";
import { Spinner } from "@/components/ui/Button";
import {
  RenewalCalendar,
  type CalendarMonth,
} from "@/components/features/Calendar/RenewalCalendar";
import { SubscriptionDetailModal } from "@/components/features/Subscription/SubscriptionDetailModal";
import { SubscriptionFormModal } from "@/components/features/Subscription/SubscriptionFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import {
  ensureLoaded,
  reload,
  useSubscriptionStore,
} from "@/state/subscriptionStore";
import { currentMonth, nextThirtyDays } from "@/components/features/Calendar/calendarPage.utils";
import { UpcomingRenewalsPanel, HowItWorksPanel } from "@/components/features/Calendar/UpcomingRenewalsPanel";
import { DayRenewalsModal } from "@/components/features/Calendar/DayRenewalsModal";

type OutletContext = { openMenu: () => void };

export default function CalendarPage() {
  const { openMenu } = useOutletContext<OutletContext>();
  const store = useSubscriptionStore();

  const [month, setMonth] = useState<CalendarMonth>(currentMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    void ensureLoaded();
  }, []);

  const subscriptions = store.subscriptions;
  const actions = useSubscriptionActions();
  const nextRenewals = nextThirtyDays(subscriptions);

  const daySubscriptions = useMemo(
    () =>
      selectedDay
        ? subscriptions.filter((s) => s.renewal_date === selectedDay)
        : [],
    [subscriptions, selectedDay],
  );

  const count = subscriptions.length;
  const error = store.status === "error" && count === 0 ? store.error : null;
  const loading =
    (store.status === "loading" || store.status === "idle") && count === 0;

  return (
    <div className="min-h-screen">
      <Topbar
        title="Renewal Calendar"
        subtitle="See every upcoming charge on one calendar"
        icon="calendar"
        onOpenMenu={openMenu}
        actions={
          <Button onClick={actions.openCreate}>
            <Icon name="plus" className="h-4 w-4" />
            <span className="hidden sm:inline">Add Subscription</span>
            <span className="sm:hidden">Add</span>
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        {error ? (
          <ErrorState
            title="Unable to load the calendar"
            description={error}
            onRetry={() => {
              void reload();
            }}
          />
        ) : (
          <>
            {loading ? (
              <div className="glass-card flex flex-col items-center justify-center h-96">
                <Spinner className="h-6 w-6 text-primary mb-4" />
              </div>
            ) : (
              <RenewalCalendar
                month={month}
                subscriptions={subscriptions}
                onMonthChange={setMonth}
                onSelectSubscription={actions.openDetail}
                onSelectDay={setSelectedDay}
              />
            )}

            <section className="grid gap-4 lg:grid-cols-3">
              <UpcomingRenewalsPanel
                subscriptions={nextRenewals}
                onSelect={actions.openDetail}
              />
              <HowItWorksPanel />
            </section>
          </>
        )}
      </div>

      <DayRenewalsModal
        selectedDay={selectedDay}
        subscriptions={daySubscriptions}
        onClose={() => setSelectedDay(null)}
        onSelectSubscription={(subscription) => {
          setSelectedDay(null);
          actions.openDetail(subscription);
        }}
      />

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
        centerOnMobile
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