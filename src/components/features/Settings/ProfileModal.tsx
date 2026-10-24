import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { ApiError } from "@/lib/axios";
import { saveProfile } from "@/state/settingsStore";
import type { User } from "@/types/auth";

export function ProfileModal({
  open,
  user,
  onClose,
  onSaved,
}: {
  open: boolean;
  user: User;
  onClose: () => void;
  onSaved: (user: User) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
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
      setName(user.name);
      setEmail(user.email);
      setErrors({});
      setFormError(null);
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrors({});
    setFormError(null);
    try {
      const updated = await saveProfile({ name: name.trim(), email: email.trim() });
      onSaved(updated);
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {});
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="profile-form" loading={saving} data-cursor>
            Save changes
          </Button>
        </>
      }
    >
      <form id="profile-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <p className="rounded-lg border border-danger/30 bg-danger-light px-3 py-2.5 text-sm font-medium text-danger">
            {formError}
          </p>
        )}
        <Field label="Name" htmlFor="profile-name" error={errors.name?.[0]} required>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            invalid={Boolean(errors.name)}
          />
        </Field>
        <Field label="Email" htmlFor="profile-email" error={errors.email?.[0]} required>
          <Input
            id="profile-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            invalid={Boolean(errors.email)}
          />
        </Field>
      </form>
    </Modal>
  );
}