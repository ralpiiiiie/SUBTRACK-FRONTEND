import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import {
  dropdownTriggerClasses,
  dropdownChevronClasses,
  dropdownPanelClasses,
  dropdownOptionClasses,
} from "./dropdown-classes";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  "aria-label"?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  invalid,
  disabled,
  id,
  name,
  className,
  "aria-label": ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const optionsRef = useRef<HTMLLIElement[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const close = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const open = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      const idx = options.findIndex((o) => o.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [disabled, value, options]);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const enabledIndices = options
        .map((o, i) => (!o.disabled ? i : -1))
        .filter((i) => i >= 0);

      switch (event.key) {
        case "Escape":
          close();
          triggerRef.current?.focus();
          break;
        case "ArrowDown":
          event.preventDefault();
          if (enabledIndices.length === 0) return;
          const currentPos = enabledIndices.indexOf(highlightedIndex);
          const nextPos = (currentPos + 1) % enabledIndices.length;
          setHighlightedIndex(enabledIndices[nextPos]);
          break;
        case "ArrowUp":
          event.preventDefault();
          if (enabledIndices.length === 0) return;
          const currentPosUp = enabledIndices.indexOf(highlightedIndex);
          const prevPos = (currentPosUp - 1 + enabledIndices.length) % enabledIndices.length;
          setHighlightedIndex(enabledIndices[prevPos]);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          const opt = options[highlightedIndex];
          if (opt && !opt.disabled) {
            onChange(opt.value);
            close();
          }
          break;
        case "Tab":
          close();
          break;
        default:
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            const search = event.key.toLowerCase();
            const nextIdx = options.findIndex(
              (o, i) =>
                i > highlightedIndex &&
                !o.disabled &&
                o.label.toLowerCase().startsWith(search)
            );
            if (nextIdx >= 0) setHighlightedIndex(nextIdx);
          }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, options, highlightedIndex, close, onChange]);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", onClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen && listRef.current && optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex].scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  const dropdownContent = isOpen ? (
    <ul
      ref={listRef}
      role="listbox"
      aria-label={ariaLabel}
      aria-activedescendant={
        highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined
      }
      className={cn(dropdownPanelClasses)}
      style={{
        maxHeight: "min(240px, 40vh)",
      } as React.CSSProperties}
    >
      {options.map((option, index) => (
        <li
          key={option.value}
          ref={(el) => {
            optionsRef.current[index] = el as HTMLLIElement;
          }}
          id={`option-${index}`}
          role="option"
          aria-selected={option.value === value}
          aria-disabled={option.disabled}
          onClick={() => {
            if (!option.disabled) {
              onChange(option.value);
              close();
            }
          }}
          onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
          className={cn(
            dropdownOptionClasses.base,
            option.value === value
              ? dropdownOptionClasses.selected
              : dropdownOptionClasses.default,
            option.disabled && dropdownOptionClasses.disabled,
            highlightedIndex === index && option.value !== value
              ? dropdownOptionClasses.highlighted
              : ""
          )}
        >
          {option.label}
        </li>
      ))}
    </ul>
  ) : null;

  return (
    <div
      ref={wrapperRef}
      className={cn("relative inline-block w-full", className)}
    >
      <button
        ref={triggerRef}
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            open();
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
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
      >
        <span className="flex items-center justify-between w-full">
          <span
            className={cn(
              "truncate",
              selectedOption ? "text-ink" : "text-faint"
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>
        </span>
      </button>
      <Icon
        name="chevronDown"
        className={cn(dropdownChevronClasses, isOpen && "rotate-180")}
      />
      <input type="hidden" name={name} value={value} />
      {dropdownContent}
    </div>
  );
}