import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export type ModalVariant = "default" | "bottom-sheet" | "centered-mobile";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  footer?: ReactNode;
  variant?: ModalVariant;
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
  variant = "default",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const isBottomSheet = variant === "bottom-sheet";
  const isCenteredMobile = variant === "centered-mobile";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        aria-label="Close dialog"
        className="absolute inset-0 animate-fade-in bg-[var(--modal-overlay)] backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "modal-panel relative z-10 flex animate-scale-in flex-col overflow-hidden",
          isBottomSheet
            ? "w-full max-h-[90dvh] rounded-t-[24px] sm:max-h-[92vh] sm:rounded-3xl sm:max-w-lg"
            : isCenteredMobile
              ? "w-full max-w-lg max-h-[90dvh] rounded-3xl m-auto sm:max-h-[92vh]"
              : "max-h-[90dvh] w-full sm:rounded-3xl",
          sizes[size],
        )}
        style={
          isBottomSheet
            ? { alignSelf: "flex-end" }
            : isCenteredMobile
              ? { alignSelf: "center" }
              : { alignSelf: "center" }
        }
      >
        {(title || description) && (
          <div className="border-b border-line-soft px-6 pb-3 pt-5">
            {title && <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-ink">{title}</h2>}
            {description && (
              <div className="mt-1 text-sm text-muted">{description}</div>
            )}
          </div>
        )}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-line-soft px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}