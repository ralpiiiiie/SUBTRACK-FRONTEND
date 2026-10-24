import { Card, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { CustomSelect } from "@/components/ui/Form";
import { Skeleton } from "@/components/ui/Skeleton";
import { BILLING_CYCLE_LABELS, DEFAULT_CURRENCY } from "@/lib/constants";
import { PreferenceRow, Row } from "./SettingsRows";
import type { NotificationPreferences } from "@/types/settings";

export function AppearanceCard() {
  return (
    <Card>
      <CardHeader title="Appearance" subtitle="Personalize how SubTrack looks." />
      <div className="px-5 pb-4">
        <dl>
          <Row label="Theme">Light</Row>
        </dl>
        <p className="pt-1 text-xs text-faint">
          Light is the only theme right now — dark mode is on the roadmap.
        </p>
      </div>
    </Card>
  );
}

export function SubscriptionPreferencesCard({
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
        title="Subscription preferences"
        subtitle="New subscription forms start with these defaults."
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
          {[0, 1].map((index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        <div className="px-5 pb-4">
          <PreferenceRow
            title="Default billing cycle"
            description="Used when you add a new subscription."
            control={
              <CustomSelect
                aria-label="Default billing cycle"
                className="w-36"
                value={preferences.defaultBillingCycle}
                onChange={(val) =>
                  onToggle({
                    defaultBillingCycle: val as NotificationPreferences["defaultBillingCycle"],
                  })
                }
                options={Object.entries(BILLING_CYCLE_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            }
          />
          <PreferenceRow
            title="Default currency"
            description="Only the Philippine Peso is supported for now."
            control={
              <span className="text-sm font-medium text-ink">
                {DEFAULT_CURRENCY} (₱)
              </span>
            }
          />
        </div>
      )}
    </Card>
  );
}