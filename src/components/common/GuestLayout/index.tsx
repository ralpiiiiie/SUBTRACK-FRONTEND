import { Outlet } from "react-router";
import { Logo } from "@/components/common/Logo";
import { Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CAPTIONS } from "@/lib/constants";

const perks = [
  "Track monthly and yearly spend across platforms",
  "Get reminded before every renewal date",
  "See which subscriptions you actually use",
];

const brandIcons = ["bell", "calendar", "wallet"] as const;

export default function GuestLayout() {
  return (
    <div className="page-glow flex min-h-screen bg-shell">
      <aside className="glow-red sticky top-0 hidden h-screen w-105 shrink-0 flex-col justify-between border-r border-line bg-surface p-10 backdrop-blur-2xl lg:flex">
        <Logo />
        <div className="pb-8">
          <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-ink">
            Stay on top of every subscription.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {CAPTIONS.tagline}
          </p>
          <ul className="mt-7 space-y-3.5">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                  <Icon name="check" className="h-3.5 w-3.5" />
                </span>
                {perk}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex items-center gap-2.5">
            {brandIcons.map((icon) => (
              <span
                key={icon}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-surface-2 text-muted"
              >
                <Icon name={icon} className="h-4.5 w-4.5" />
              </span>
            ))}
            <p className="ml-1 text-xs font-medium text-faint">
              No missed renewals. No wasted spend.
            </p>
          </div>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <ThemeToggle className="absolute right-4 top-4 z-10 border-line bg-surface backdrop-blur-xl sm:right-6 sm:top-6" />
        <div className="w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}