import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { CATEGORY_STYLES } from "@/lib/constants";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/constants";
import {
  buildNotifications,
  notificationPrice,
} from "@/lib/notifications";
import { useSettingsStore } from "@/state/settingsStore";
import { useSubscriptionStore } from "@/state/subscriptionStore";

const MAX_VISIBLE = 6;

/**
 * Topbar bell with an unread-style count badge and a dropdown listing the
 * subscriptions that need attention (renewals due within the reminder
 * window, expired, trials ending, and long-unused items).
 */
export default function Notification() {
  const navigate = useNavigate();
  const store = useSubscriptionStore();
  const settingsStore = useSettingsStore();
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Presentation-only: keeps the mobile full-screen sheet mounted during its
  // slide-out. Does not change the existing open/close state or handlers.
  const [sheetClosing, setSheetClosing] = useState(false);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      setSheetClosing(false);
      if (window.matchMedia("(max-width: 639px)").matches) {
        document.body.style.overflow = "hidden"; // lock scroll under the sheet
        return () => {
          document.body.style.overflow = "";
        };
      }
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    const mobile = window.matchMedia("(max-width: 639px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (mobile && !reduce) setSheetClosing(true);
  }, [open]);

  useEffect(() => {
    if (!sheetClosing) return;
    const timer = window.setTimeout(() => setSheetClosing(false), 250);
    return () => window.clearTimeout(timer);
  }, [sheetClosing]);

  const preferences =
    settingsStore.settings?.preferences ?? DEFAULT_NOTIFICATION_PREFERENCES;

  const notifications = useMemo(
    () => buildNotifications(store.subscriptions, preferences),
    [store.subscriptions, preferences],
  );
  const count = notifications.length;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const goToSubscriptions = () => {
    setOpen(false);
    navigate("/subscriptions");
  };

  // Desktop anchoring: position the portaled panel under the bell button.
  const bellRect = bellRef.current?.getBoundingClientRect();
  const panelStyle =
    open && bellRect && window.matchMedia("(min-width: 640px)").matches
      ? {
          top: bellRect.bottom + 8,
          right: Math.max(16, window.innerWidth - bellRect.right),
        }
      : undefined;

  return (
    <div className="relative">
      <button
        ref={bellRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={count > 0 ? `Notifications (${count})` : "Notifications"}
        data-cursor
        className="relative flex h-11 w-11 items-center justify-center rounded-[14px] text-ink-soft transition-colors duration-200 hover:bg-surface-2 hover:text-ink sm:h-10 sm:w-auto sm:px-2.5"
      >
        <Icon name="bell" className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {(open || sheetClosing) &&
        createPortal(
          <>
            <button
              aria-label="Close notifications"
              className="fixed inset-0 z-[55] notif-panel hidden cursor-default bg-[var(--overlay)] animate-fade-in sm:block sm:animate-none"
              onClick={() => setOpen(false)}
            />
            <div
              role="menu"
              style={panelStyle}
              className={cn(
                "glass-panel notif-panel fixed inset-0 z-[70] flex h-[100dvh] w-full flex-col overflow-hidden rounded-none border-0 bg-shell pb-[env(safe-area-inset-bottom)]",
                sheetClosing
                  ? "animate-sheet-out"
                  : "animate-sheet-in sm:animate-none sm:transition-none sm:transform-none",
                "sm:bottom-auto sm:left-auto sm:z-[60] sm:h-auto sm:max-h-[70vh] sm:w-[380px] sm:max-w-[calc(100vw-2rem)] sm:rounded-3xl sm:border sm:pb-0",
              )}
            >
          <div className="flex items-center justify-between gap-2 border-b border-line-soft px-3 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:gap-3 sm:px-4 sm:pt-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Back"
                className="-ml-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-ink transition-colors hover:bg-surface-2 sm:hidden"
              >
                <Icon name="chevronLeft" className="h-6 w-6" />
              </button>
              <p className="min-w-0 truncate text-2xl font-bold text-ink sm:text-base sm:font-semibold sm:uppercase sm:tracking-wide">
                Notifications
              </p>
            </div>
            {count > 0 && (
              <Badge tone="danger">
                {count} alert{count === 1 ? "" : "s"}
              </Badge>
            )}
          </div>

          {count === 0 ? (
            <div className="flex-1 px-4 py-8 text-center sm:flex-none">
              <Icon name="bell" className="mx-auto h-6 w-6 text-faint" />
              <p className="mt-2 text-sm font-medium text-ink-soft">
                You're all caught up
              </p>
              <p className="mt-1 text-xs text-muted">
                No upcoming renewals or alerts right now.
              </p>
            </div>
          ) : (
            <>
              <ul className="scrollbar-thin min-h-0 flex-1 divide-y divide-line-soft overflow-y-auto overscroll-contain sm:max-h-80">
                {notifications.slice(0, MAX_VISIBLE).map((notification) => {
                  const style = CATEGORY_STYLES[notification.subscription.category];
                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        data-cursor
                        role="menuitem"
                        onClick={goToSubscriptions}
                        className="flex min-h-14 w-full min-w-0 items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2 sm:min-h-0 sm:py-3"
                      >
                        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white sm:h-8 sm:w-8 sm:rounded-lg">
                          <span className={`absolute inset-0 rounded-full ${style.dot}`} />
                          {notification.subscription.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">
                            {notification.subscription.name}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {notification.title}
                          </span>
                          <span className="mt-0.5 block text-xs font-medium">
                            {notification.kind === "expired" ? (
                              <span className="text-danger">Expired</span>
                            ) : notification.kind === "unused" ? (
                              <span className="text-muted">
                                {notification.subscription.days_since_last_used ?? ""}d
                              </span>
                            ) : (
                              <span className="text-ink-soft">
                                {notificationPrice(notification.subscription)}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {notifications.length > MAX_VISIBLE && (
                <p className="border-t border-line-soft px-4 py-2 text-xs text-muted">
                  Showing {MAX_VISIBLE} of {notifications.length}
                </p>
              )}
              <button
                type="button"
                data-cursor
                onClick={goToSubscriptions}
                className="flex w-full items-center justify-center gap-1.5 border-t border-line-soft px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary-lighter"
              >
                View all subscriptions
                <Icon name="chevronRight" className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          </div>
          </>,
          document.body,
        )}
    </div>
  );
}