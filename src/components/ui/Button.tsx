import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-btn text-ink border border-line-strong shadow-soft hover:border-line-strong hover:bg-surface-2 focus-visible:ring-primary/50",
  secondary:
    "bg-surface-2 text-ink border border-line hover:bg-surface-3 focus-visible:ring-primary/50",
  ghost:
    "text-ink-soft hover:bg-surface-2 active:bg-surface-3 focus-visible:ring-line-strong",
  outline:
    "border border-line-strong bg-transparent text-ink-soft hover:bg-surface-2 hover:text-ink focus-visible:ring-line-strong",
  danger:
    "border border-danger/50 bg-danger/10 text-danger hover:bg-danger/20 hover:border-danger/70 focus-visible:ring-danger/50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs gap-1.5",
  md: "h-12 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
  icon: "h-10 w-10",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, className, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[14px] font-medium transition-all duration-200",
          "motion-safe:active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        className ?? "h-5 w-5",
      )}
    />
  );
}