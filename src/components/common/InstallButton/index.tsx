"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/context/auth-context";

const DISMISSED_KEY = "subtrack-install-dismissed";

function getInitialDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

function getInitialIsIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

export function InstallButton() {
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS] = useState(getInitialIsIOS);
  const [dismissed, setDismissed] = useState(getInitialDismissed);

  useEffect(() => {
    if (!user) return;

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as EventListener);
    };
  }, [user]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  if (!user || dismissed || (!deferredPrompt && !isIOS)) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 animate-fade-up">
      <div className="glass-panel flex items-center gap-2 px-4 py-2.5 shadow-pop">
        {isIOS ? (
          <>
            <Icon name="share" className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-ink">
              Tap Share, then "Add to Home Screen"
            </span>
          </>
        ) : (
          <>
            <Icon name="download" className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline text-sm font-medium text-ink">
              Install App
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={handleInstall}
              className="h-9 px-3"
            >
              Install
            </Button>
          </>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-surface-2"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}