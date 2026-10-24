import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  authSessionExpiredEvent,
} from "@/lib/axios";
import { clearToken, getToken, setToken } from "@/lib/token";
import * as authService from "@/services/authService";
import { clearLoginReminder } from "@/state/loginReminder";
import { reset as resetSettingsStore } from "@/state/settingsStore";
import { reset as resetSubscriptionStore } from "@/state/subscriptionStore";
import { Spinner } from "@/components/ui/Button";
import type { LoginPayload, RegisterPayload, User } from "@/types/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = getToken();
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (active) {
          setUser(currentUser);
        }
      } catch {
        if (active) {
          clearToken();
        }
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    }

    const handleExpired = () => {
      resetSubscriptionStore();
      resetSettingsStore();
      clearLoginReminder();
      setUser(null);
    };

    restoreSession();
    window.addEventListener(authSessionExpiredEvent, handleExpired);

    return () => {
      active = false;
      window.removeEventListener(authSessionExpiredEvent, handleExpired);
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const session = await authService.login(payload);
    setToken(session.token);
    resetSubscriptionStore();
    resetSettingsStore();
    setUser(session.user);
    return session.user;
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      const session = await authService.register(payload);
      setToken(session.token);
      resetSubscriptionStore();
      resetSettingsStore();
      setUser(session.user);
      return session.user;
    },
    [],
  );

  const clearSession = useCallback(() => {
    clearToken();
    resetSubscriptionStore();
    resetSettingsStore();
    clearLoginReminder();
    setUser(null);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {
      // Revoke locally even if the server is unreachable.
    }
    clearSession();
  }, [clearSession]);

  if (initializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-shell">
        <Spinner className="h-6 w-6 text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, initializing, login, register, logout, setUser, clearSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}