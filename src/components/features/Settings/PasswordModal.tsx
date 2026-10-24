import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { ApiError } from "@/lib/axios";
import { changePassword } from "@/services/settingsService";
import type { ChangePasswordPayload } from "@/types/settings";

export function PasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset the form each time the modal opens (render-phase reset, matching
  // the subscription form modal).
  const openKey = open ? "open" : "closed";
  const [lastOpenKey, setLastOpenKey] = useState<string | null>(null);
  if (openKey !== lastOpenKey) {
    setLastOpenKey(openKey);
    if (openKey === "open") {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      setFormError(null);
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setErrors({});
    setFormError(null);

    const nextErrors: Record<string, string[]> = {};
    if (newPassword.length < 8) {
      nextErrors.password = ["Password must be at least 8 characters."];
    }
    if (newPassword !== confirmPassword) {
      nextErrors.confirm = ["Passwords do not match."];
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const payload: ChangePasswordPayload = {
        currentPassword,
        newPassword,
        newPasswordConfirmation: confirmPassword,
      };
      await changePassword(payload);
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        const serverErrors: Record<string, string[]> = {};
        if (error.errors?.current_password) serverErrors.current = error.errors.current_password;
        if (error.errors?.password) serverErrors.password = error.errors.password;
        setErrors(serverErrors);
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const hasFieldError = (key: string) => Boolean(errors[key]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change password"
      description="Use at least 8 characters. You'll be asked for your current password first."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="password-form" loading={saving} data-cursor>
            Update password
          </Button>
        </>
      }
    >
      <form id="password-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <p className="rounded-lg border border-danger/30 bg-danger-light px-3 py-2.5 text-sm font-medium text-danger">
            {formError}
          </p>
        )}
        <Field
          label="Current password"
          htmlFor="current-password"
          error={errors.current?.[0]}
          required
        >
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            invalid={hasFieldError("current")}
          />
        </Field>
        <Field label="New password" htmlFor="new-password" error={errors.password?.[0]} required>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            invalid={hasFieldError("password")}
          />
        </Field>
        <Field
          label="Confirm new password"
          htmlFor="confirm-password"
          error={errors.confirm?.[0]}
          required
        >
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            invalid={hasFieldError("confirm")}
          />
        </Field>
      </form>
    </Modal>
  );
}