import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast-context";
import { STATUS_LABELS } from "@/lib/constants";
import { toDateKey } from "@/lib/dates";
import {
  deleteSubscription,
  markSubscriptionUsed,
  updateSubscription,
} from "@/services/subscriptionService";
import {
  getSubscriptionById,
  patchSubscription,
  removeSubscription,
  upsertSubscription,
  useSubscriptionStore,
} from "@/state/subscriptionStore";
import type { CatalogMeta, Subscription } from "@/types/subscription";

export interface SubscriptionActions {
  catalog: CatalogMeta | null;
  isFormOpen: boolean;
  editing: Subscription | null;
  detail: Subscription | null;
  deleting: Subscription | null;
  deleteLoading: boolean;
  actionLoadingIds: Set<string>;
  openCreate: () => void;
  openEdit: (subscription: Subscription) => void;
  closeForm: () => void;
  handleSaved: (subscription: Subscription) => Promise<void>;
  openDetail: (subscription: Subscription) => void;
  closeDetail: () => void;
  confirmDelete: (subscription: Subscription) => void;
  cancelDelete: () => void;
  performDelete: () => Promise<void>;
  handleToggleStatus: (subscription: Subscription) => Promise<void>;
  handleMarkUsed: (subscription: Subscription) => Promise<void>;
}

export function useSubscriptionActions(): SubscriptionActions {
  const { toast } = useToast();
  const store = useSubscriptionStore();

  const [isFormOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Subscription | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoadingIds, setActionLoadingIds] = useState<Set<string>>(new Set());

  const detail = useMemo(() => {
    if (!detailId) return null;
    return store.subscriptions.find((s) => s.id === detailId) ?? null;
  }, [detailId, store.subscriptions]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((subscription: Subscription) => {
    setDetailId(null);
    setEditing(subscription);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const handleSaved = useCallback(
    async (subscription: Subscription) => {
      const wasEditing = Boolean(editing);
      setFormOpen(false);
      setEditing(null);
      upsertSubscription(subscription);
      toast(
        wasEditing
          ? `${subscription.name} updated.`
          : `${subscription.name} added to your subscriptions.`,
      );
    },
    [editing, toast],
  );

  const openDetail = useCallback((subscription: Subscription) => {
    setDetailId(subscription.id);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailId(null);
  }, []);

  const confirmDelete = useCallback((subscription: Subscription) => {
    setDetailId(null);
    setDeleting(subscription);
  }, []);

  const cancelDelete = useCallback(() => {
    if (deleteLoading) return;
    setDeleting(null);
  }, [deleteLoading]);

  const performDelete = useCallback(async () => {
    if (!deleting) return;
    const target = deleting;
    setDeleteLoading(true);
    removeSubscription(target.id);
    try {
      await deleteSubscription(target.id);
      toast(`${target.name} deleted.`);
      setDeleting(null);
    } catch (error) {
      upsertSubscription(target);
      setDeleting(null);
      toast(error instanceof Error ? error.message : "Unable to delete.", "error");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleting, toast]);

  const runAction = useCallback(
    async (
      target: Subscription,
      optimistic: (subscription: Subscription) => Subscription,
      action: () => Promise<Subscription>,
      message: string,
    ) => {
      setActionLoadingIds((current) => new Set(current).add(target.id));
      const previous = getSubscriptionById(target.id) ?? target;
      patchSubscription(optimistic(previous));
      try {
        const updated = await action();
        upsertSubscription(updated);
        toast(message);
      } catch (error) {
        upsertSubscription(previous);
        toast(error instanceof Error ? error.message : "Action failed.", "error");
      } finally {
        setActionLoadingIds((current) => {
          const next = new Set(current);
          next.delete(target.id);
          return next;
        });
      }
    },
    [toast],
  );

  const handleToggleStatus = useCallback(
    (subscription: Subscription) => {
      const nextStatus = subscription.status === "paused" ? "active" : "paused";
      return runAction(
        subscription,
        (current) => ({
          ...current,
          status: nextStatus,
          status_label: STATUS_LABELS[nextStatus],
        }),
        () => updateSubscription(subscription.id, { status: nextStatus }),
        nextStatus === "active"
          ? `${subscription.name} resumed.`
          : `${subscription.name} paused.`,
      );
    },
    [runAction],
  );

  const handleMarkUsed = useCallback(
    (subscription: Subscription) =>
      runAction(
        subscription,
        (current) => ({
          ...current,
          last_used_date: toDateKey(new Date()),
          days_since_last_used: 0,
        }),
        () => markSubscriptionUsed(subscription.id),
        `Marked ${subscription.name} as used today.`,
      ),
    [runAction],
  );

  return useMemo(
    () => ({
      catalog: store.catalog,
      isFormOpen,
      editing,
      detail,
      deleting,
      deleteLoading,
      actionLoadingIds,
      openCreate,
      openEdit,
      closeForm,
      handleSaved,
      openDetail,
      closeDetail,
      confirmDelete,
      cancelDelete,
      performDelete,
      handleToggleStatus,
      handleMarkUsed,
    }),
    [
      store.catalog,
      isFormOpen,
      editing,
      detail,
      deleting,
      deleteLoading,
      actionLoadingIds,
      openCreate,
      openEdit,
      closeForm,
      handleSaved,
      openDetail,
      closeDetail,
      confirmDelete,
      cancelDelete,
      performDelete,
      handleToggleStatus,
      handleMarkUsed,
    ],
  );
}