import { CAPTIONS } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function LogoMark({
  className,
  tileClassName,
}: {
  className?: string;
  tileClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-soft",
        tileClassName,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 48 48"
        className={cn("h-5 w-5", className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13.5 24.5h14" />
        <path d="M28.5 14.5a12.5 12.5 0 0 1 0 19" />
        <path d="M26 14.7l3-4.2 3.2 4" />
      </svg>
    </span>
  );
}

export function Logo({
  compact = false,
  className,
  tileClassName,
}: {
  compact?: boolean;
  className?: string;
  tileClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark tileClassName={tileClassName} />
      {!compact && (
        <span className="font-display text-xl font-semibold uppercase tracking-wider text-ink">
          {CAPTIONS.appName}
        </span>
      )}
    </div>
  );
}