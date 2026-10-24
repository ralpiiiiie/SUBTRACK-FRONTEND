let pending = false;

/**
 * Mark that the user just authenticated successfully. The reminder popup
 * consumes this exactly once on the next "ready" state.
 */
export function markLoginReminder(): void {
  pending = true;
}

/**
 * Return true once (and clear the flag) if a reminder should be shown.
 */
export function consumeLoginReminder(): boolean {
  const value = pending;
  pending = false;
  return value;
}

/**
 * Clear the flag on logout / session expiry so a stale reminder never shows.
 */
export function clearLoginReminder(): void {
  pending = false;
}