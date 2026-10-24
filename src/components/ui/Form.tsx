import { useRef, useState, useEffect } from "react";
import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import {
  dropdownTriggerClasses,
  dropdownChevronClasses,
} from "./dropdown-classes";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-medium uppercase tracking-wider text-muted"
      >
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputBase =
  "h-12 w-full rounded-[14px] border border-line bg-surface px-3.5 text-sm text-ink placeholder:text-faint transition-all duration-200 focus:border-primary/60 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted";

export function Input({
  invalid,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(inputBase, invalid && "border-danger focus:border-danger focus:ring-danger/20", className)}
      {...props}
    />
  );
}

export function Select({
  invalid,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const select = selectRef.current;
    if (!select) return;

    const onFocus = () => setIsOpen(true);
    const onBlur = () => setIsOpen(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Tab") setIsOpen(false);
    };

    select.addEventListener("focus", onFocus);
    select.addEventListener("blur", onBlur);
    select.addEventListener("keydown", onKeyDown);

    return () => {
      select.removeEventListener("focus", onFocus);
      select.removeEventListener("blur", onBlur);
      select.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <span className={cn("relative block", className)}>
      <select
        ref={selectRef}
        className={cn(
          dropdownTriggerClasses.base,
          dropdownTriggerClasses.focus,
          dropdownTriggerClasses.active,
          dropdownTriggerClasses.appearance,
          dropdownTriggerClasses.disabled,
          dropdownTriggerClasses.tapHighlight,
          invalid && dropdownTriggerClasses.invalid,
          isOpen && dropdownTriggerClasses.open
        )}
        style={{ backgroundImage: "none" }}
        {...props}
      >
        {children}
      </select>
      <Icon
        name="chevronDown"
        className={cn(dropdownChevronClasses, isOpen && "rotate-180")}
      />
    </span>
  );
}

export function Textarea({
  invalid,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(inputBase, "min-h-20", invalid && "border-danger focus:border-danger focus:ring-danger/20", className)}
      {...props}
    />
  );
}

export { CustomSelect } from "./CustomSelect";