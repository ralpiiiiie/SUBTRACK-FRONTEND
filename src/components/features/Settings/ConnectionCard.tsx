import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/format";
import { Row } from "./SettingsRows";
import type { DashboardData } from "@/types/subscription";

export function ConnectionCard({
  connectionError,
  connected,
  data,
  checking,
  apiUrl,
  onRecheck,
}: {
  connectionError: string | null;
  connected: boolean;
  data: DashboardData | null | undefined;
  checking: boolean;
  apiUrl: string | undefined;
  onRecheck: () => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Data & connection"
        subtitle="Everything is stored and served by your local backend."
      />
      {connectionError ? (
        <div className="px-5 pb-5">
          <ErrorState
            title="Backend not reachable"
            description={connectionError}
            onRetry={onRecheck}
          />
        </div>
      ) : (
        <div className="px-5 pb-4">
          <dl>
            <Row label="API base URL">
              <span className="break-all text-xs">
                {apiUrl ?? "Not configured — using default"}
              </span>
            </Row>
            <Row label="Backend status">
              {connected ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Connected
                </span>
              ) : (
                <Skeleton className="h-4 w-16" />
              )}
            </Row>
            <Row label="Currency">Philippine Peso (₱)</Row>
            {!connected ? (
              <div className="space-y-2 py-2">
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              <>
                <Row label="Total monthly spend">
                  {formatCurrency(data?.total_monthly ?? 0)}
                </Row>
                <Row label="Total yearly estimate">
                  {formatCurrency(data?.total_yearly ?? 0)}
                </Row>
                <Row label="Subscription count">
                  {data?.active_count ?? 0} active · {data?.paused_count ?? 0}{" "}
                  paused · {data?.cancelled_count ?? 0} cancelled
                </Row>
                <Row label="Free trials tracked">{data?.trial_count ?? 0}</Row>
              </>
            )}
          </dl>
          <div className="mt-4">
            <Button variant="outline" size="sm" loading={checking} onClick={onRecheck}>
              <Icon name="renew" className="h-4 w-4" />
              Recheck connection
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}