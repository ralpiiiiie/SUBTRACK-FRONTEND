import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import Notification from "@/components/common/Notification";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/auth-context";

export interface TopbarProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  actions?: ReactNode;
  onOpenMenu?: () => void;
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const name = user?.name ?? "Guest";
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = () => {
    setOpen(false);
    void logout().then(() => navigate("/login", { replace: true }));
  };

  return (
    <div className="relative">
      {open && (
        <button
          aria-label="Close user menu"
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setOpen(false)}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        data-cursor
        className="flex items-center gap-2 rounded-[14px] px-2 py-1.5 text-sm transition-colors hover:bg-surface-2"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
          {initials}
        </span>
        <span className="hidden max-w-32 truncate font-medium text-ink sm:block">
          {name}
        </span>
        <Icon
          name="chevronDown"
          className={cn(
            "hidden h-4 w-4 text-muted transition-transform duration-200 sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="glass-panel absolute right-0 top-full z-40 mt-2 w-56 origin-top-right animate-fade-up overflow-hidden"
        >
          <div className="border-b border-line-soft px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <button
            role="menuitem"
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-danger-light hover:text-danger"
          >
            <Icon name="logout" className="h-4.5 w-4.5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function Topbar({ title, subtitle, icon, actions, onOpenMenu }: TopbarProps) {
  return (
    <>
    <header className="glass-bar sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3.5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 lg:hidden"
            onClick={onOpenMenu}
            aria-label="Open navigation"
          >
            <Icon name="menu" className="h-5 w-5" />
          </Button>
          <div className="hidden min-w-0 flex-1 md:block">
            <h1 className="flex min-w-0 items-center gap-2 font-display text-lg font-semibold uppercase tracking-wide text-ink sm:text-2xl">
              {icon && <Icon name={icon} className="hidden h-5 w-5 shrink-0 text-primary sm:block" />}
              <span className="min-w-0 truncate">{title}</span>
            </h1>
            {subtitle && <p className="mt-0.5 hidden text-xs text-muted sm:block">{subtitle}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Notification />
          {actions}
          <UserMenu />
        </div>
      </div>
    </header>

    {/* Mobile page heading — topbar keeps only actions below md */}
    <div className="mx-auto mt-4 mb-3 w-full min-w-0 max-w-7xl px-4 md:hidden">
      <h1 className="min-w-0 break-words font-display text-2xl font-bold text-ink">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
    </>
  );
}