import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function ErrorState({
  title = "Unable to load data",
  description = "Please check your connection and try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="glass-card flex flex-col items-center justify-center px-6 py-12 text-center animate-fade-up">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-light text-danger">
        <Icon name="alertCircle" className="h-5 w-5" />
      </div>
      <h3 className="font-display text-base font-semibold uppercase tracking-wide text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}