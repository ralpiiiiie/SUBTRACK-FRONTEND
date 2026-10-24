import type { BillingCycle } from "@/types/subscription";
import type { User } from "@/types/auth";

export interface NotificationPreferences {
  renewalReminders: boolean;
  trialReminders: boolean;
  expiredAlerts: boolean;
  reminderDays: number;
  defaultBillingCycle: BillingCycle;
  defaultCurrency: string;
}

export interface SettingsData {
  user: User;
  preferences: NotificationPreferences;
  lastLoginAt: string | null;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}