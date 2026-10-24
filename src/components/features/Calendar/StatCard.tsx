import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";

export interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: IconName;
  accent?: "primary" | "success" | "warning" | "info" | "neutral";
  loading?: boolean;
}

const icons: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary-light text-primary",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  info: "bg-info-light text-info",
  neutral: "bg-surface-2 text-ink-soft",
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "primary",
  loading,
}: StatCardProps) {
  return (
    <div className="glass-card glow-red px-5 py-5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            icons[accent],
          )}
        >
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-6 w-24" />
          ) : (
            <p className="truncate font-display text-2xl font-semibold tracking-wide text-ink">
              {value}
            </p>
          )}
          {sub && <p className="truncate text-xs text-muted">{sub}</p>}
        </div>
      </div>
    </div>
  );
}