import { StatCard } from "@/components/features/Calendar/StatCard";
import { formatCurrency } from "@/lib/format";
import type { DashboardData } from "@/types/subscription";

export function DashboardStats({
  data,
  loading,
}: {
  data: DashboardData | null | undefined;
  loading: boolean;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Monthly spend"
        value={loading ? "" : formatCurrency(data?.total_monthly ?? 0)}
        sub={
          !loading && (data?.paused_monthly ?? 0) > 0
            ? `+ ${formatCurrency(data?.paused_monthly ?? 0)} paused`
            : "Active subscriptions only"
        }
        icon="wallet"
        accent="primary"
        loading={loading}
      />
      <StatCard
        label="Yearly estimate"
        value={loading ? "" : formatCurrency(data?.total_yearly ?? 0)}
        sub={loading ? "" : "If the year ran at the current pace"}
        icon="spark"
        accent="warning"
        loading={loading}
      />
      <StatCard
        label="Active subscriptions"
        value={loading ? "" : String(data?.active_count ?? 0)}
        sub={
          loading
            ? ""
            : `${data?.paused_count ?? 0} paused · ${data?.cancelled_count ?? 0} cancelled`
        }
        icon="list"
        accent="success"
        loading={loading}
      />
    </section>
  );
}