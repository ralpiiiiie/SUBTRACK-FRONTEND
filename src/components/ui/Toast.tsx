import { useCallback, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import {
  ToastContext,
  type Toast,
  type ToastTone,
} from "@/components/ui/toast-context";

const tones: Record<ToastTone, string> = {
  success: "border-success/30",
  error: "border-danger/30",
  info: "border-info/30",
};

const iconTones: Record<ToastTone, string> = {
  success: "bg-success text-white",
  error: "bg-danger text-white",
  info: "bg-primary text-white",
};

const icons: Record<ToastTone, "check" | "x" | "info"> = {
  success: "check",
  error: "x",
  info: "info",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border border-line-strong bg-surface-2 px-4 py-3 shadow-pop backdrop-blur-xl animate-toast-in",
              tones[item.tone],
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                iconTones[item.tone],
              )}
            >
              <Icon name={icons[item.tone]} className="h-3 w-3" />
            </span>
            <p className="flex-1 text-sm">{item.message}</p>
            <button
              onClick={() => dismiss(item.id)}
              className="text-faint transition-colors hover:text-ink"
              aria-label="Dismiss notification"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}