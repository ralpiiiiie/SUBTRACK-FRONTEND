import { Card, CardHeader } from "@/components/ui/Card";
import { CAPTIONS } from "@/lib/constants";
import { Row } from "./SettingsRows";

export function AboutCard() {
  return (
    <Card>
      <CardHeader title="About" subtitle="Your personal subscription tracker." />
      <div className="px-5 pb-4">
        <dl>
          <Row label="Application">{CAPTIONS.appName}</Row>
          <Row label="Purpose">
            Track recurring services, trials and renewals — self-hosted and
            private.
          </Row>
          <Row label="Stack">
            React + Vite + Tailwind CSS frontend · Laravel 12 API on PostgreSQL
          </Row>
        </dl>
      </div>
    </Card>
  );
}