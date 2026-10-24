import { NavLink, useNavigate } from "react-router";
import { cn } from "@/lib/cn";
import { CAPTIONS } from "@/lib/constants";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/context/auth-context";

const navigation: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/subscriptions", label: "Subscriptions", icon: "list" },
  { to: "/calendar", label: "Calendar", icon: "calendar" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

function UserCard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const name = user?.name ?? "Guest";
  const email = user?.email ?? "";
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = () => {
    void logout().then(() => navigate("/login", { replace: true }));
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        <p className="truncate text-xs text-muted">{email}</p>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-lg p-1.5 text-faint transition-colors hover:bg-danger-light hover:text-danger"
        aria-label="Sign out"
        data-cursor
      >
        <Icon name="logout" className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <Logo />
      </div>

      <div className="px-4 pb-5">
        <UserCard />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-surface-2 text-ink ring-1 ring-line-strong"
                  : "text-ink-soft hover:bg-surface-2 hover:text-ink lg:hover:translate-x-0.5",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  name={item.icon}
                  className={cn(
                    "h-4.5 w-4.5",
                    isActive ? "text-primary" : "text-muted group-hover:text-ink-soft",
                  )}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-5">
        <div className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="font-display text-xs font-semibold uppercase tracking-wider text-muted">
            {CAPTIONS.tagline}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-line bg-surface backdrop-blur-2xl lg:block">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        aria-label="Close menu"
        className="absolute inset-0 animate-fade-in bg-[var(--overlay)]"
        onClick={onClose}
      />
      <div className="absolute left-0 top-0 h-full w-64 animate-drawer-in border-r border-line bg-shell-2/95 pt-[env(safe-area-inset-top)] shadow-pop backdrop-blur-2xl">
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}