import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Field,
  Input,
  Textarea,
  CustomSelect,
} from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { Switch } from "@/components/ui/Switch";
import { ApiError } from "@/lib/axios";
import {
  CATEGORY_LABELS,
  DEFAULT_NOTIFICATION_PREFERENCES,
  STATUS_LABELS,
} from "@/lib/constants";
import { createSubscription, updateSubscription } from "@/services/subscriptionService";
import { useSettingsStore } from "@/state/settingsStore";
import type {
  BillingCycle,
  Category,
  CatalogMeta,
  Subscription,
  SubscriptionPayload,
  SubscriptionStatus,
} from "@/types/subscription";

export interface SubscriptionFormModalProps {
  open: boolean;
  onClose: () => void;
  catalog: CatalogMeta | null;
  subscription?: Subscription | null;
  onSaved: (subscription: Subscription) => void;
}

interface FormState {
  name: string;
  cost: string;
  billing_cycle: string;
  renewal_date: string;
  category: string;
  payment_method: string;
  status: string;
  is_trial: boolean;
  trial_end_date: string;
  last_used_date: string;
  notes: string;
}

const emptyForm: FormState = {
  name: "",
  cost: "",
  billing_cycle: "monthly",
  renewal_date: "",
  category: "entertainment",
  payment_method: "",
  status: "active",
  is_trial: false,
  trial_end_date: "",
  last_used_date: "",
  notes: "",
};

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function calculateRenewalDate(billingCycle: BillingCycle): string {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localToday = new Date(today.getTime() - offset * 60_000);

  let daysToAdd = 30;
  if (billingCycle === "weekly") daysToAdd = 7;
  else if (billingCycle === "yearly") daysToAdd = 365;

  const renewalDate = new Date(localToday);
  renewalDate.setDate(renewalDate.getDate() + daysToAdd);

  const year = renewalDate.getFullYear();
  const month = String(renewalDate.getMonth() + 1).padStart(2, "0");
  const day = String(renewalDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toFormState(subscription: Subscription): FormState {
  return {
    name: subscription.name,
    cost: String(subscription.cost),
    billing_cycle: subscription.billing_cycle,
    renewal_date: subscription.renewal_date,
    category: subscription.category,
    payment_method: subscription.payment_method ?? "",
    status: subscription.status,
    is_trial: subscription.is_trial,
    trial_end_date: subscription.trial_end_date ?? "",
    last_used_date: subscription.last_used_date ?? "",
    notes: subscription.notes ?? "",
  };
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.name.trim()) errors.name = "Name is required.";
  if (form.cost === "" || Number.isNaN(Number(form.cost))) {
    errors.cost = "Cost is required.";
  } else if (Number(form.cost) < 0) {
    errors.cost = "Cost cannot be negative.";
  }
  if (form.is_trial && !form.trial_end_date) {
    errors.trial_end_date = "Trial end date is required for a free trial.";
  }
  if (
    form.is_trial &&
    form.trial_end_date &&
    form.renewal_date &&
    form.trial_end_date < form.renewal_date
  ) {
    errors.trial_end_date = "Trial end date cannot be before the renewal date.";
  }
  if (form.last_used_date && form.last_used_date > todayString()) {
    errors.last_used_date = "Last used date cannot be in the future.";
  }

  return errors;
}

const BILLING_CYCLE_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function SubscriptionFormModal({
  open,
  onClose,
  catalog,
  subscription,
  onSaved,
}: SubscriptionFormModalProps) {
  const isEdit = Boolean(subscription);
  const settingsStore = useSettingsStore();
  const preferredCycle =
    settingsStore.settings?.preferences?.defaultBillingCycle ??
    DEFAULT_NOTIFICATION_PREFERENCES.defaultBillingCycle;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openKey = open ? (subscription?.id ?? "__new__") : null;
  const [lastOpenKey, setLastOpenKey] = useState<string | null>(null);
  if (openKey !== lastOpenKey) {
    setLastOpenKey(openKey);
    if (openKey !== null) {
      setForm(
        subscription
          ? toFormState(subscription)
          : { ...emptyForm, billing_cycle: preferredCycle },
      );
      setErrors({});
      setServerError(null);
    }
  }

  const paymentMethods = useMemo(
    () => [catalog?.payment_methods ?? []].flat(),
    [catalog],
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const resetTrial = (isTrial: boolean) => {
    setForm((current) => ({
      ...current,
      is_trial: isTrial,
      trial_end_date: isTrial ? current.trial_end_date : "",
    }));
  };

  const handleSubmit = async () => {
    const validation = validate(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    const renewalDate = isEdit
      ? form.renewal_date
      : calculateRenewalDate(form.billing_cycle as BillingCycle);

    const payload: SubscriptionPayload = {
      name: form.name.trim(),
      cost: Number(form.cost),
      billing_cycle: form.billing_cycle as BillingCycle,
      renewal_date: renewalDate,
      category: form.category as Category,
      payment_method: form.payment_method.trim() || null,
      status: isEdit ? (form.status as SubscriptionStatus) : "active",
      is_trial: form.is_trial,
      trial_end_date: form.is_trial ? form.trial_end_date : null,
      last_used_date: form.last_used_date || null,
      notes: form.notes.trim() || null,
    };

    setSaving(true);
    setServerError(null);

    try {
      const saved = isEdit && subscription
        ? await updateSubscription(subscription.id, payload)
        : await createSubscription(payload);
      onSaved(saved);
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        setErrors(
          Object.fromEntries(
            Object.entries(error.errors).map(([key, messages]) => [
              key,
              Array.isArray(messages) ? (messages[0] ?? "") : String(messages),
            ]),
          ),
        );
      } else if (error instanceof Error) {
        setServerError(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBillingCycleChange = (cycle: BillingCycle) => {
    set("billing_cycle", cycle);
    if (!isEdit) {
      const newRenewalDate = calculateRenewalDate(cycle);
      set("renewal_date", newRenewalDate);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${subscription?.name}` : "Add Subscription"}
      description={isEdit ? "Update the details below to keep the record accurate." : "Track a new recurring service you pay for."}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? "Save changes" : "Add subscription"}
          </Button>
        </>
      }
    >
      {serverError && (
        <div className="mb-4 rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
          {serverError}
        </div>
      )}

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="sub-name" required>
            <Input
              id="sub-name"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              placeholder="e.g. Netflix"
              invalid={Boolean(errors.name)}
              autoFocus
            />
            {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
          </Field>

          <Field label="Cost" htmlFor="sub-cost" required>
            <Input
              id="sub-cost"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.cost}
              onChange={(event) => set("cost", event.target.value)}
              placeholder="549.00"
              invalid={Boolean(errors.cost)}
            />
            {errors.cost && <p className="text-xs text-danger">{errors.cost}</p>}
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Billing Cycle" htmlFor="sub-cycle" required>
            <div
              id="sub-cycle"
              role="radiogroup"
              aria-label="Billing Cycle"
              className="grid grid-cols-3 gap-2"
            >
              {BILLING_CYCLE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={form.billing_cycle === value}
                  onClick={() => handleBillingCycleChange(value)}
                  className={`
                    relative rounded-[14px] border px-3 py-2.5 text-sm font-medium transition-all duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-shell
                    disabled:cursor-not-allowed disabled:opacity-50
                    ${
                      form.billing_cycle === value
                        ? "border-primary/60 bg-primary-light text-primary shadow-primary/10"
                        : "border-line bg-surface-2 text-ink-soft hover:border-primary/40 hover:bg-surface-3"
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Category" htmlFor="sub-category" required>
            <CustomSelect
              id="sub-category"
              name="category"
              value={form.category}
              onChange={(val) => set("category", val)}
              options={catalog?.categories.map((category) => ({
                value: category,
                label: CATEGORY_LABELS[category],
              })) ?? []}
              placeholder="Select category"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Payment Method" htmlFor="sub-payment">
            <CustomSelect
              id="sub-payment"
              name="payment_method"
              value={form.payment_method}
              onChange={(val) => set("payment_method", val)}
              options={paymentMethods.map((method) => ({
                value: method,
                label: method,
              }))}
              placeholder="Select payment method"
            />
          </Field>

          {isEdit && (
            <Field label="Status" htmlFor="sub-status" required>
              <div className="grid gap-2 sm:grid-cols-3">
                {catalog?.statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => set("status", status)}
                    className={`
                      rounded-lg border px-3 py-2 text-sm font-medium transition-colors
                      ${
                        form.status === status
                          ? "border-primary/60 bg-primary-light text-primary"
                          : "border-line bg-surface-2 text-ink-soft hover:border-primary/40"
                      }
                    `}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </Field>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface-2 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Free trial</p>
              <p className="text-xs text-muted">
                Track a limited-time free trial with its own countdown.
              </p>
            </div>
            <Switch
              checked={form.is_trial}
              onChange={resetTrial}
              label="Free trial"
            />
          </div>

          {form.is_trial && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Trial End Date" htmlFor="sub-trial-end" required>
                <Input
                  id="sub-trial-end"
                  type="date"
                  value={form.trial_end_date}
                  onChange={(event) => set("trial_end_date", event.target.value)}
                  invalid={Boolean(errors.trial_end_date)}
                />
                {errors.trial_end_date && (
                  <p className="text-xs text-danger">{errors.trial_end_date}</p>
                )}
              </Field>
            </div>
          )}
        </div>

        <Field
          label="Last Used Date"
          htmlFor="sub-last-used"
          hint="Optional. Used to suggest when you might stop getting value."
        >
          <Input
            id="sub-last-used"
            type="date"
            value={form.last_used_date}
            onChange={(event) => set("last_used_date", event.target.value)}
            invalid={Boolean(errors.last_used_date)}
          />
          {errors.last_used_date && (
            <p className="text-xs text-danger">{errors.last_used_date}</p>
          )}
        </Field>

        <Field label="Notes" htmlFor="sub-notes">
          <Textarea
            id="sub-notes"
            value={form.notes}
            onChange={(event) => set("notes", event.target.value)}
            placeholder="Anything worth remembering about this subscription…"
          />
        </Field>
      </div>
    </Modal>
  );
}