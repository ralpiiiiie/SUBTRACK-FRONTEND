import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { Topbar } from "@/components/common/Topbar";
import { SubscriptionDetailModal } from "@/components/features/Subscription/SubscriptionDetailModal";
import { SubscriptionFormModal } from "@/components/features/Subscription/SubscriptionFormModal";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import {
  ensureLoaded,
  reload,
  useSubscriptionStore,
} from "@/state/subscriptionStore";
import type { SubscriptionFilters } from "@/types/subscription";
import { compareBy } from "@/components/features/Subscription/subscriptionsPage.utils";
import { SubscriptionFiltersBar } from "@/components/features/Subscription/SubscriptionFiltersBar";
import { SubscriptionResults } from "@/components/features/Subscription/SubscriptionResults";

type OutletContext = { openMenu: () => void };

export default function SubscriptionsPage() {
  const { openMenu } = useOutletContext<OutletContext>();
  const store = useSubscriptionStore();

  const [filters, setFilters] = useState<SubscriptionFilters>({});
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    void ensureLoaded();
  }, []);

  const actions = useSubscriptionActions();

  const filtered = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    const category = filters.category;
    const status = filters.status;
    const cycle = filters.billing_cycle;
    const list = store.subscriptions.filter(
      (subscription) =>
        (!term ||
          subscription.name.toLowerCase().includes(term) ||
          (subscription.payment_method ?? "").toLowerCase().includes(term)) &&
        (!category || subscription.category === category) &&
        (!status || subscription.status === status) &&
        (!cycle || subscription.billing_cycle === cycle),
    );
    list.sort(
      compareBy(filters.sort ?? "renewal_date", filters.sort_dir ?? "asc"),
    );
    return list;
  }, [store.subscriptions, searchInput, filters]);

  const count = store.subscriptions.length;
  const error = store.status === "error" && count === 0 ? store.error : null;
  const loading =
    (store.status === "loading" || store.status === "idle") && count === 0;

  const updateFilter = (key: keyof SubscriptionFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value || undefined }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({});
  };

  const hasActiveFilters = Boolean(
    searchInput || filters.category || filters.status || filters.billing_cycle,
  );

  return (
    <div className="min-h-screen">
      <Topbar
        title="Subscriptions"
        subtitle={
          count
            ? `${count} total subscription${count === 1 ? "" : "s"}`
            : "Manage all your recurring services"
        }
        icon="list"
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
        <SubscriptionFiltersBar
          searchInput={searchInput}
          onSearch={setSearchInput}
          filters={filters}
          catalog={actions.catalog}
          onUpdateFilter={updateFilter}
        />

        <SubscriptionResults
          error={error}
          loading={loading}
          filtered={filtered}
          hasActiveFilters={hasActiveFilters}
          onRetry={() => void reload()}
          onClearFilters={clearFilters}
          onCreate={actions.openCreate}
          onView={actions.openDetail}
          onEdit={actions.openEdit}
          onDelete={actions.confirmDelete}
          onToggleStatus={actions.handleToggleStatus}
        />
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