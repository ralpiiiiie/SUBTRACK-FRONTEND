"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/context/auth-context";

export function PwaStatus() {
  const { user } = useAuth();
  const [isOffline, setIsOffline] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !user) return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    setIsOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    navigator.serviceWorker.ready.then((registration) => {
      setSwRegistration(registration);

      // Check for updates on load
      registration.update().catch(() => {});

      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user]);

  const handleRefresh = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  };

  if (!user) return null;

  return (
    <>
      {/* Offline banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-fade-down bg-warning/95 backdrop-blur-sm border-b border-warning/30 px-4 py-2.5 text-center text-sm font-medium text-warning">
          <Icon name="wifiOff" className="inline h-4 w-4 mr-2" />
          You're offline. Changes will sync when you're back online.
        </div>
      )}

      {/* Update available toast */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50 animate-fade-up">
          <div className="glass-panel flex items-center justify-between gap-3 px-4 py-3 shadow-pop border border-warning/30">
            <div className="flex items-center gap-2">
              <Icon name="refreshCw" className="h-5 w-5 text-warning animate-spin" />
              <span className="text-sm font-medium text-ink">New version available</span>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setUpdateAvailable(false)}>
                Later
              </Button>
              <Button size="sm" variant="primary" onClick={handleRefresh}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}