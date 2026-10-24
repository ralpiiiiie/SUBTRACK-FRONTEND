import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { CATEGORY_STYLES } from "@/lib/constants";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/constants";
import {
  buildNotifications,
  type AppNotification,
} from "@/lib/notifications";
import { consumeLoginReminder } from "@/state/loginReminder";
import { useSettingsStore } from "@/state/settingsStore";
import { useSubscriptionStore } from "@/state/subscriptionStore";

const severityColor: Record<AppNotification["severity"], string> = {
  danger: "text-danger",
  warning: "text-warning",
  neutral: "text-muted",
};

const severityIcon: Record<AppNotification["severity"], "alertCircle" | "alertTriangle" | "bell"> = {
  danger: "alertCircle",
  warning: "alertTriangle",
  neutral: "bell",
};

/**
 * Shown right after a successful login when subscriptions need attention
 * (renewing within the reminder window, expired, or trials ending). It only
 * reads the most severe warning per subscription and deliberately leaves
 * "not used recently" items for the topbar bell.
 */
export default function PopUpModal() {
  const navigate = useNavigate();
  const subscriptionStore = useSubscriptionStore();
  const settingsStore = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);

  const preferences =
    settingsStore.settings?.preferences ?? DEFAULT_NOTIFICATION_PREFERENCES;

  const ready =
    subscriptionStore.status === "ready" &&
    settingsStore.status !== "idle" &&
    settingsStore.status !== "loading";

  // One-shot check right after the stores are ready — only when the user
  // just logged in. Uses the same render-phase reset pattern as the
  // subscription form so the modal never re-opens on later re-renders.
  const readyKey = ready ? "ready" : "waiting";
  const [lastReadyKey, setLastReadyKey] = useState<string | null>(null);
  if (readyKey === "ready" && lastReadyKey !== readyKey) {
    setLastReadyKey(readyKey);
    if (consumeLoginReminder()) {
      const alerts = buildNotifications(subscriptionStore.subscriptions, preferences).filter(
        (n) => n.kind !== "unused",
      );
      setItems(alerts);
      if (alerts.length > 0) setOpen(true);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Subscription Reminder"
      description="You have subscriptions that need your attention."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              navigate("/subscriptions");
            }}
          >
            <Icon name="list" className="h-4 w-4" />
            View Subscriptions
          </Button>
        </>
      }
    >
      <ul className="space-y-2">
        {items.map((notification) => {
          const style = CATEGORY_STYLES[notification.subscription.category];
          return (
            <li key={notification.id}>
              <button
                type="button"
                data-cursor
                onClick={() => {
                  setOpen(false);
                  navigate("/subscriptions");
                }}
                className="flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-2"
              >
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white">
                  <span className={`absolute inset-0 rounded-lg ${style.dot}`} />
                  {notification.subscription.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {notification.subscription.name}
                  </span>
                  <span
                    className={`flex items-center gap-1 truncate text-xs font-medium ${severityColor[notification.severity]}`}
                  >
                    <Icon
                      name={severityIcon[notification.severity]}
                      className="h-3 w-3 shrink-0"
                    />
                    {notification.kind === "expired"
                      ? notification.detail
                      : notification.title}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold text-ink">
                    {notification.kind === "expired" ? "Expired" : undefined}
                  </span>
                  {notification.kind !== "expired" && (
                    <span className="block text-xs text-muted">{notification.detail}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}