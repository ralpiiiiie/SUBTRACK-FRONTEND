import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { Icon } from "@/components/ui/Icon";
import { ApiError } from "@/lib/axios";
import { useToast } from "@/components/ui/toast-context";
import { useAuth } from "@/context/auth-context";
import { markLoginReminder } from "@/state/loginReminder";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setErrors({});
    setFormError(null);

    try {
      await login({ email, password });
      markLoginReminder();
      toast("Welcome back!");
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {});
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card animate-fade-up p-6 sm:p-8">
      <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-ink">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-muted">
        Sign in to see what's renewing next and what you're paying every month.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="Email" htmlFor="login-email" error={errors.email?.[0]} required>
          <div className="relative">
            <Icon
              name="mail"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              invalid={Boolean(errors.email)}
              className="pl-9"
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="login-password" error={errors.password?.[0]} required>
          <div className="relative">
            <Icon
              name="lock"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              invalid={Boolean(errors.password)}
              className="pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              data-cursor
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-faint transition-colors duration-200 hover:bg-surface-2 hover:text-ink-soft"
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} className="h-4 w-4" />
            </button>
          </div>
        </Field>

        {formError && (
          <p
            role="alert"
            className="flex animate-fade-up items-start gap-2 rounded-lg border border-danger/30 bg-danger-light px-3 py-2.5 text-sm font-medium text-danger"
          >
            <Icon name="alertCircle" className="mt-0.5 h-4 w-4 shrink-0" />
            {formError}
          </p>
        )}

        <Button type="submit" loading={submitting} className="w-full" data-cursor>
          {submitting ? (
            "Signing in…"
          ) : (
            <>
              Sign in
              <Icon name="arrowRight" className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        No account yet?{" "}
        <Link
          to="/register"
          className="font-medium text-primary transition-colors hover:text-primary"
          data-cursor
        >
          Create one
        </Link>
      </p>
    </div>
  );
}