import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "primary";

export interface BadgeProps {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-soft ring-line-strong",
  success: "bg-success-light text-success ring-success/30",
  warning: "bg-warning-light text-warning ring-warning/30",
  danger: "bg-danger-light text-danger ring-danger/30",
  info: "bg-info-light text-info ring-info/30",
  primary: "bg-primary-light text-primary ring-primary/30",
};

const dots: Record<Tone, string> = {
  neutral: "bg-muted",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  primary: "bg-primary",
};

const dotAnimations: Record<Tone, string> = {
  neutral: "",
  success: "motion-safe:animate-pulse-subtle",
  warning: "",
  danger: "",
  info: "",
  primary: "",
};

export function Badge({ tone = "neutral", dot, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            dots[tone],
            dotAnimations[tone],
          )}
        />
      )}
      {children}
    </span>
  );
}