import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Topbar } from "@/components/common/Topbar";
import { useToast } from "@/components/ui/toast-context";
import { useAuth } from "@/context/auth-context";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/constants";
import { deleteAccount, exportData } from "@/services/settingsService";
import {
  ensureLoaded as ensureSettingsLoaded,
  reload as reloadSettings,
  savePreferences,
  useSettingsStore,
} from "@/state/settingsStore";
import {
  ensureLoaded as ensureSubscriptionsLoaded,
  reload as reloadSubscriptions,
  useSubscriptionStore,
} from "@/state/subscriptionStore";
import type { NotificationPreferences } from "@/types/settings";
import { ProfileModal } from "@/components/features/Settings/ProfileModal";
import { PasswordModal } from "@/components/features/Settings/PasswordModal";
import { AccountCard } from "@/components/features/Settings/AccountCard";
import { NotificationsCard } from "@/components/features/Settings/NotificationsCard";
import {
  AppearanceCard,
  SubscriptionPreferencesCard,
} from "@/components/features/Settings/PreferencesCards";
import {
  DataPrivacyCard,
  SecurityCard,
  DangerZoneCard,
} from "@/components/features/Settings/AccountActionCards";
import { ConnectionCard } from "@/components/features/Settings/ConnectionCard";
import { AboutCard } from "@/components/features/Settings/AboutCard";

type OutletContext = { openMenu: () => void };

const VITE_API_URL = import.meta.env.VITE_API_URL as string | undefined;

export default function SettingsPage() {
  const { openMenu } = useOutletContext<OutletContext>();
  const { user, setUser, clearSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const store = useSubscriptionStore();
  const settingsStore = useSettingsStore();

  const [checking, setChecking] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    void ensureSettingsLoaded();
    void ensureSubscriptionsLoaded();
  }, []);

  const onRecheck = useCallback(async () => {
    setChecking(true);
    const started = Date.now();
    await Promise.all([reloadSettings(), reloadSubscriptions()]);
    const elapsed = Date.now() - started;
    if (elapsed < 500) {
      await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
    }
    setChecking(false);
  }, []);

  const preferences =
    settingsStore.settings?.preferences ?? DEFAULT_NOTIFICATION_PREFERENCES;
  const settingsLoading =
    (settingsStore.status === "idle" || settingsStore.status === "loading") &&
    !settingsStore.settings;
  const settingsError =
    settingsStore.status === "error" && !settingsStore.settings
      ? settingsStore.error
      : null;

  const togglePreference = useCallback(
    async (patch: Partial<NotificationPreferences>) => {
      try {
        await savePreferences(patch);
      } catch (error) {
        toast(
          error instanceof Error
            ? error.message
            : "Couldn't update that preference.",
          "error",
        );
      }
    },
    [toast],
  );

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await exportData();
      toast("Your data export has been downloaded.");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Export failed. Please try again.",
        "error",
      );
    } finally {
      setExporting(false);
    }
  }, [toast]);

  const handleDeleteAccount = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      toast("Your account and subscriptions have been deleted.");
      clearSession();
      navigate("/login", { replace: true });
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : "Couldn't delete your account. Please try again.",
        "error",
      );
      setDeleting(false);
    }
  }, [clearSession, navigate, toast]);

  const data = store.dashboard;
  const connected =
    store.status === "ready" || (store.status === "loading" && Boolean(data));
  const connectionError =
    store.status === "error" && !data ? store.error : null;

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const lastLogin = settingsStore.settings?.lastLoginAt
    ? new Date(settingsStore.settings.lastLoginAt).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="min-h-screen">
      <Topbar
        title="Settings"
        subtitle="Profile, preferences and account"
        icon="settings"
        onOpenMenu={openMenu}
      />

      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <AccountCard
          user={user}
          memberSince={memberSince}
          lastLogin={lastLogin}
          loading={settingsLoading}
          onEdit={() => setProfileOpen(true)}
        />

        <NotificationsCard
          preferences={preferences}
          loading={settingsLoading}
          error={settingsError}
          onRetry={() => void reloadSettings()}
          onToggle={(patch) => void togglePreference(patch)}
        />

        <AppearanceCard />

        <SubscriptionPreferencesCard
          preferences={preferences}
          loading={settingsLoading}
          error={settingsError}
          onRetry={() => void reloadSettings()}
          onToggle={(patch) => void togglePreference(patch)}
        />

        <DataPrivacyCard exporting={exporting} onExport={() => void handleExport()} />

        <SecurityCard onChangePassword={() => setPasswordOpen(true)} />

        <DangerZoneCard onDelete={() => setDeleteOpen(true)} />

        <ConnectionCard
          connectionError={connectionError}
          connected={connected}
          data={data}
          checking={checking}
          apiUrl={VITE_API_URL}
          onRecheck={() => void onRecheck()}
        />

        <AboutCard />

        <p className="pb-2 px-1 text-center text-xs text-faint">
          Your data stays on your machine. No accounts, no tracking.
        </p>
      </div>

      {user && (
        <>
          <ProfileModal
            open={profileOpen}
            user={user}
            onClose={() => setProfileOpen(false)}
            onSaved={(updated) => {
              setUser(updated);
              toast("Profile updated.");
            }}
          />
          <PasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
          <ConfirmDialog
            open={deleteOpen}
            title="Delete account?"
            description="This permanently removes your profile, preferences and all of your subscriptions."
            confirmLabel="Delete my account"
            tone="danger"
            loading={deleting}
            onConfirm={() => void handleDeleteAccount()}
            onCancel={() => setDeleteOpen(false)}
          />
        </>
      )}
    </div>
  );
}