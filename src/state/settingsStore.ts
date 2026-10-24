import { useSyncExternalStore } from "react";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/constants";
import {
  getSettings,
  updatePreferences,
  updateProfile,
} from "@/services/settingsService";
import type { User } from "@/types/auth";
import type {
  NotificationPreferences,
  SettingsData,
  UpdateProfilePayload,
} from "@/types/settings";

export type SettingsStatus = "idle" | "loading" | "ready" | "error";

export interface SettingsStoreState {
  status: SettingsStatus;
  error: string | null;
  settings: SettingsData | null;
}

const INITIAL_STATE: SettingsStoreState = {
  status: "idle",
  error: null,
  settings: null,
};

let state: SettingsStoreState = INITIAL_STATE;
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;
let loadToken = 0;

function emit(): void {
  for (const listener of listeners) listener();
}

function commit(next: SettingsStoreState): void {
  if (next === state) return;
  state = next;
  emit();
}

function toError(e: unknown): string {
  return e instanceof Error ? e.message : "Request failed. Please try again.";
}

async function runLoad(token: number): Promise<void> {
  try {
    const settings = await getSettings();
    // A reset() (logout / user switch) bumps the token; drop this stale
    // result so the previous user's data never leaks into a new session.
    if (token !== loadToken) return;
    commit({ status: "ready", error: null, settings });
  } catch (e) {
    if (token !== loadToken) return;
    commit({ ...state, status: "error", error: toError(e) });
  } finally {
    if (token === loadToken) inflight = null;
  }
}

function load(force: boolean): Promise<void> {
  if (inflight) return inflight;
  if (!force && (state.status === "ready" || state.status === "loading")) {
    return Promise.resolve();
  }
  commit({ ...state, status: "loading", error: null });
  const promise = runLoad(loadToken);
  inflight = promise;
  return promise;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getState(): SettingsStoreState {
  return state;
}

export function useSettingsStore(): SettingsStoreState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function getPreferences(): NotificationPreferences {
  return state.settings?.preferences ?? DEFAULT_NOTIFICATION_PREFERENCES;
}

/**
 * Load the current user's settings at most once. Subsequent calls are no-ops
 * unless the store was reset or errored.
 */
export function ensureLoaded(): Promise<void> {
  return load(false);
}

/**
 * Force a fresh round trip from the backend, keeping old data visible in the
 * meantime. Used by retries and the "Recheck connection" action.
 */
export function reload(): Promise<void> {
  return load(true);
}

/**
 * Clear all cached settings, e.g. when the authenticated user changes or
 * logs out. Also invalidates any in-flight load so its late result is dropped.
 */
export function reset(): void {
  loadToken += 1;
  inflight = null;
  commit(INITIAL_STATE);
}

/**
 * Persist profile changes and optimistically replace the cached user.
 */
export async function saveProfile(payload: UpdateProfilePayload): Promise<User> {
  const user = await updateProfile(payload);
  if (state.settings) {
    commit({ ...state, settings: { ...state.settings, user } });
  }
  return user;
}

/**
 * Persist a preferences patch with optimistic UI update and revert on failure.
 */
export async function savePreferences(
  patch: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const previous = state.settings;
  const optimistic: NotificationPreferences = {
    ...getPreferences(),
    ...patch,
  };
  if (previous) {
    commit({ ...state, settings: { ...previous, preferences: optimistic } });
  }
  try {
    const confirmed = await updatePreferences(patch);
    if (state.settings) {
      commit({ ...state, settings: { ...state.settings, preferences: confirmed } });
    }
    return confirmed;
  } catch (error) {
    if (previous && state.settings) {
      commit({ ...state, settings: previous });
    }
    throw error;
  }
}