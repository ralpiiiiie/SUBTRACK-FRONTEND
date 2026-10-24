import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { Icon } from "@/components/ui/Icon";
import { ApiError } from "@/lib/axios";
import { useToast } from "@/components/ui/toast-context";
import { useAuth } from "@/context/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      toast("Account created. Welcome!");
      navigate("/", { replace: true });
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
        Create your account
      </h1>
      <p className="mt-1 text-sm text-muted">
        Start tracking your subscriptions in under a minute.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="Name" htmlFor="register-name" error={errors.name?.at(0)} required>
          <div className="relative">
            <Icon
              name="user"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            />
            <Input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              invalid={Boolean(errors.name)}
              className="pl-9"
            />
          </div>
        </Field>

        <Field label="Email" htmlFor="register-email" error={errors.email?.[0]} required>
          <div className="relative">
            <Icon
              name="mail"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            />
            <Input
              id="register-email"
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

        <Field
          label="Password"
          htmlFor="register-password"
          error={errors.password?.at(0)}
          hint="At least 8 characters."
          required
        >
          <div className="relative">
            <Icon
              name="lock"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            />
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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

        <Field
          label="Confirm password"
          htmlFor="register-password-confirmation"
          error={errors.password?.at(1)}
          required
        >
          <div className="relative">
            <Icon
              name="lock"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            />
            <Input
              id="register-password-confirmation"
              type={showConfirmation ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              invalid={Boolean(errors.password)}
              className="pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmation((current) => !current)}
              aria-label={showConfirmation ? "Hide confirmation" : "Show confirmation"}
              aria-pressed={showConfirmation}
              data-cursor
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-faint transition-colors duration-200 hover:bg-surface-2 hover:text-ink-soft"
            >
              <Icon name={showConfirmation ? "eyeOff" : "eye"} className="h-4 w-4" />
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
            "Creating account…"
          ) : (
            <>
              Create account
              <Icon name="arrowRight" className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-primary transition-colors hover:text-primary"
          data-cursor
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}