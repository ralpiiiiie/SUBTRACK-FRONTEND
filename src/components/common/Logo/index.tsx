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
        className={cn("h-6 w-6", className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 10h32a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" />
        <circle cx="16" cy="10" r="2.5" fill="currentColor" />
        <circle cx="32" cy="10" r="2.5" fill="currentColor" />
        <path d="M24 18c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8c0-2.2-.9-4.2-2.4-5.7" fill="none" />
        <path d="M24 30c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8c0 2.2.9 4.2 2.4 5.7" fill="none" />
        <path d="M16 25.5l-2.5 2.5 2.5 2.5" fill="none" />
        <path d="M32 22.5l2.5-2.5-2.5-2.5" fill="none" />
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