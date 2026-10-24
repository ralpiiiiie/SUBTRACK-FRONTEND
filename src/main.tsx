import "@/styles/global.css";

import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import AppLayout from "@/components/common/AppLayout";
import GuestLayout from "@/components/common/GuestLayout";
import { GuestOnly, RequireAuth } from "@/context/AuthGuards";
import { AuthProvider } from "@/context/AuthProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import { Spinner } from "@/components/ui/Button";
import { ToastProvider } from "@/components/ui/Toast";

const LoginPage = lazy(() => import("@/pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/Auth/RegisterPage"));
const CalendarPage = lazy(() => import("@/pages/User/CalendarPage"));
const DashboardPage = lazy(() => import("@/pages/User/DashboardPage"));
const SettingsPage = lazy(() => import("@/pages/User/SettingsPage"));
const SubscriptionsPage = lazy(() => import("@/pages/User/SubscriptionsPage"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-shell">
      <Spinner className="h-6 w-6 text-primary" />
    </div>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route element={<GuestLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <ToastProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>,
);