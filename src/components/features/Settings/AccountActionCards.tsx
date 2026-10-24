import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PreferenceRow } from "./SettingsRows";

export function DataPrivacyCard({
  exporting,
  onExport,
}: {
  exporting: boolean;
  onExport: () => void;
}) {
  return (
    <Card>
      <CardHeader title="Data & privacy" subtitle="Download or delete your data anytime." />
      <div className="px-5 pb-4">
        <PreferenceRow
          title="Export my data"
          description="A JSON file with your profile, preferences and subscriptions."
          control={
            <Button variant="outline" size="sm" loading={exporting} onClick={onExport} data-cursor>
              <Icon name="download" className="h-4 w-4" />
              Export data
            </Button>
          }
        />
      </div>
    </Card>
  );
}

export function SecurityCard({ onChangePassword }: { onChangePassword: () => void }) {
  return (
    <Card>
      <CardHeader title="Security" subtitle="Keep your account protected." />
      <div className="px-5 pb-4">
        <PreferenceRow
          title="Password"
          description="Set a new password for your account."
          control={
            <Button variant="outline" size="sm" onClick={onChangePassword} data-cursor>
              Change password
            </Button>
          }
        />
      </div>
    </Card>
  );
}

export function DangerZoneCard({ onDelete }: { onDelete: () => void }) {
  return (
    <Card className="border-danger/30">
      <CardHeader title="Danger zone" subtitle="Irreversible account actions." />
      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">Delete account</p>
            <p className="mt-0.5 text-xs text-muted">
              Permanently remove your account, preferences and all subscriptions.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-danger/40 text-danger hover:bg-danger-light hover:text-danger"
            onClick={onDelete}
            data-cursor
          >
            <Icon name="trash" className="h-4 w-4" />
            Delete account
          </Button>
        </div>
      </div>
    </Card>
  );
}