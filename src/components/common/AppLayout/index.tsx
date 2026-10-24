import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { MobileSidebar, Sidebar } from "@/components/common/Sidebar";
import PopUpModal from "@/components/ui/PopUpModal";
import { ensureLoaded as ensureSettingsLoaded } from "@/state/settingsStore";
import { ensureLoaded as ensureSubscriptionsLoaded } from "@/state/subscriptionStore";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    void ensureSubscriptionsLoaded();
    void ensureSettingsLoaded();
  }, []);

  return (
    <div className="page-glow flex min-h-dvh w-full max-w-full bg-shell">
      <Sidebar />
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="mx-auto w-full min-w-0 max-w-full flex-1">
        <Outlet context={{ openMenu: () => setMenuOpen(true) }} />
      </main>
      <PopUpModal />
    </div>
  );
}