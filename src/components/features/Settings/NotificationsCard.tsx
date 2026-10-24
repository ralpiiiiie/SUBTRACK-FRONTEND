import { Card, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { CustomSelect } from "@/components/ui/Form";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { REMINDER_DAY_OPTIONS } from "@/lib/constants";
import { PreferenceRow } from "./SettingsRows";
import type { NotificationPreferences } from "@/types/settings";

export function NotificationsCard({
  preferences,
  loading,
  error,
  onRetry,
  onToggle,
}: {
  preferences: NotificationPreferences;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onToggle: (patch: Partial<NotificationPreferences>) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Notifications"
        subtitle="Choose which reminders you want to see."
      />
      {error ? (
        <div className="px-5 pb-5">
          <ErrorState
            title="Couldn't load your preferences"
            description={error}
            onRetry={onRetry}
          />
        </div>
      ) : loading ? (
        <div className="space-y-3 px-5 pb-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        <div className="px-5 pb-4">
          <PreferenceRow
            title="Renewal reminders"
            description="Alert me when a subscription renews soon."
            control={
              <Switch
                checked={preferences.renewalReminders}
                onChange={(checked) => onToggle({ renewalReminders: checked })}
                label="Renewal reminders"
              />
            }
          />
          <PreferenceRow
            title="Expired subscription alerts"
            description="Alert me when a subscription is overdue."
            control={
              <Switch
                checked={preferences.expiredAlerts}
                onChange={(checked) => onToggle({ expiredAlerts: checked })}
                label="Expired subscription alerts"
              />
            }
          />
          <PreferenceRow
            title="Trial expiration reminders"
            description="Alert me when a free trial is ending."
            control={
              <Switch
                checked={preferences.trialReminders}
                onChange={(checked) => onToggle({ trialReminders: checked })}
                label="Trial expiration reminders"
              />
            }
          />
          <PreferenceRow
            title="Reminder timing"
            description="How many days before a renewal counts as 'soon'."
            control={
              <CustomSelect
                aria-label="Reminder timing"
                className="w-36"
                value={String(preferences.reminderDays)}
                disabled={!preferences.renewalReminders}
                onChange={(val) =>
                  onToggle({ reminderDays: Number(val) })
                }
                options={REMINDER_DAY_OPTIONS.map((days) => ({
                  value: String(days),
                  label: `${days} day${days === 1 ? "" : "s"} before renewal`,
                }))}
              />
            }
          />
        </div>
      )}
    </Card>
  );
}