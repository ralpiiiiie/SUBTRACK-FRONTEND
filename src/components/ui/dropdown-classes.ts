export const dropdownTriggerClasses = {
  base: "h-12 w-full rounded-[14px] border border-line bg-surface-2 px-3.5 text-sm text-ink placeholder:text-faint transition-all duration-200",
  focus: "focus:border-primary/60 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary/25",
  active: "active:bg-surface-2",
  disabled: "disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted",
  invalid: "border-danger focus:border-danger focus:ring-danger/20",
  open: "border-primary/60 ring-2 ring-primary/25",
  tapHighlight: "-webkit-tap-highlight-color-transparent",
  appearance: "appearance-none pr-9",
};

export const dropdownChevronClasses =
  "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-transform duration-150";

export const dropdownPanelClasses =
  "absolute z-50 w-full max-w-full mt-1.5 rounded-[14px] border border-line-strong bg-btn text-ink shadow-pop overflow-y-auto overscroll-contain max-h-60 max-h-[40vh] py-1.5 animate-fade-up";

export const dropdownOptionClasses = {
  base: "px-3.5 py-3.5 text-sm transition-colors duration-150 cursor-pointer select-none active:bg-primary/5 first:rounded-t-[13px] last:rounded-b-[13px] -webkit-tap-highlight-color-transparent",
  selected: "bg-primary-light text-primary font-medium",
  default: "text-ink hover:bg-primary/5",
  disabled: "opacity-40 cursor-not-allowed",
  highlighted: "bg-primary/5",
};