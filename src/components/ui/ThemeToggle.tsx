import { flushSync } from "react-dom";
import { useTheme } from "@/context/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startViewTransition = (
      document as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      }
    ).startViewTransition?.bind(document);

    if (!startViewTransition || reduce) {
      toggleTheme();
      return;
    }

    // Circular reveal expanding from the center of the toggle pill.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const root = document.documentElement;
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty("--vt-r", `${radius}px`);

    startViewTransition(() => {
      flushSync(() => toggleTheme());
    });
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      data-cursor
      onClick={handleToggle}
      className={cn(
        "relative isolate inline-flex h-8 w-16 shrink-0 items-center rounded-full border border-line bg-surface p-1",
        "after:absolute after:-inset-3 after:content-['']",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-1 top-1 z-0 h-6 w-6 rounded-full bg-surface-2 shadow-soft ring-1 ring-line transition-transform duration-300 ease-in-out",
          isDark ? "translate-x-8" : "translate-x-0",
        )}
      />
      <span className="relative z-10 flex w-full items-center justify-between">
        <Icon
          name="sun"
          className={cn(
            "mx-1 h-4 w-4 transition-colors duration-200",
            isDark ? "text-faint" : "text-primary",
          )}
        />
        <Icon
          name="moon"
          className={cn(
            "mx-1 h-4 w-4 transition-colors duration-200",
            isDark ? "text-primary" : "text-faint",
          )}
        />
      </span>
    </button>
  );
}
