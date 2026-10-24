import { api, toApiError } from "@/lib/axios";
import type { User } from "@/types/auth";
import type {
  ChangePasswordPayload,
  NotificationPreferences,
  SettingsData,
  UpdateProfilePayload,
} from "@/types/settings";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/constants";

function unwrap<T>(data: { data: T }): T {
  return data.data;
}

export function mapPreferences(raw: Record<string, unknown>): NotificationPreferences {
  if (!raw || typeof raw !== "object") return DEFAULT_NOTIFICATION_PREFERENCES;
  return {
    renewalReminders: raw.renewal_reminders !== false,
    trialReminders: raw.trial_reminders !== false,
    expiredAlerts: raw.expired_alerts !== false,
    reminderDays: Number.isFinite(Number(raw.reminder_days))
      ? Number(raw.reminder_days)
      : DEFAULT_NOTIFICATION_PREFERENCES.reminderDays,
    defaultBillingCycle: (raw.default_billing_cycle as NotificationPreferences["defaultBillingCycle"]) ?? "monthly",
    defaultCurrency: (raw.default_currency as string) ?? DEFAULT_NOTIFICATION_PREFERENCES.defaultCurrency,
  };
}

export function serializePreferences(
  prefs: Partial<NotificationPreferences>,
): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};
  if (prefs.renewalReminders !== undefined) serialized.renewal_reminders = prefs.renewalReminders;
  if (prefs.trialReminders !== undefined) serialized.trial_reminders = prefs.trialReminders;
  if (prefs.expiredAlerts !== undefined) serialized.expired_alerts = prefs.expiredAlerts;
  if (prefs.reminderDays !== undefined) serialized.reminder_days = prefs.reminderDays;
  if (prefs.defaultBillingCycle !== undefined) serialized.default_billing_cycle = prefs.defaultBillingCycle;
  if (prefs.defaultCurrency !== undefined) serialized.default_currency = prefs.defaultCurrency;
  return serialized;
}

export async function getSettings(): Promise<SettingsData> {
  try {
    const { data } = await api.get<{
      data: {
        user: User;
        preferences: Record<string, unknown>;
        last_login_at: string | null;
      };
    }>("/settings");
    const settings = unwrap(data);
    return {
      user: settings.user,
      preferences: mapPreferences(settings.preferences),
      lastLoginAt: settings.last_login_at,
    };
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  try {
    const { data } = await api.patch<{ data: User }>("/settings/profile", payload);
    return unwrap(data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updatePreferences(
  payload: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  try {
    const { data } = await api.patch<{ data: Record<string, unknown> }>(
      "/settings/preferences",
      serializePreferences(payload),
    );
    return mapPreferences(unwrap(data));
  } catch (error) {
    throw toApiError(error);
  }
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  try {
    await api.patch("/settings/password", {
      current_password: payload.currentPassword,
      password: payload.newPassword,
      password_confirmation: payload.newPasswordConfirmation,
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function exportData(): Promise<void> {
  try {
    const response = await api.get("/settings/export", { responseType: "blob" });
    const blob = response.data as Blob;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subtrack-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteAccount(): Promise<void> {
  try {
    await api.delete("/account");
  } catch (error) {
    throw toApiError(error);
  }
}