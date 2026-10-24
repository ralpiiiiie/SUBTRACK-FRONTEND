import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [requested, setRequested] = useState(false);

  const handleClose = () => {
    if (!loading) {
      setRequested(false);
      onCancel();
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!loading) onCancel();
      }}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone}
            onClick={() => {
              setRequested(true);
              onConfirm();
            }}
            loading={loading && requested}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-soft">{description}</p>
      {tone === "danger" && (
        <p className="mt-3 rounded-lg bg-danger-light px-3 py-2 text-xs text-danger">
          This action cannot be undone.
        </p>
      )}
    </Modal>
  );
}