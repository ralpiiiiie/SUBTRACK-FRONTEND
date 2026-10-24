import { Input, CustomSelect } from "@/components/ui/Form";
import { Icon } from "@/components/ui/Icon";
import {
  BILLING_CYCLE_LABELS,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import type { Category, CatalogMeta, SubscriptionFilters } from "@/types/subscription";
import { sortOptions } from "./subscriptionsPage.utils";

export function SubscriptionFiltersBar({
  searchInput,
  onSearch,
  filters,
  catalog,
  onUpdateFilter,
}: {
  searchInput: string;
  onSearch: (value: string) => void;
  filters: SubscriptionFilters;
  catalog: CatalogMeta | null;
  onUpdateFilter: (key: keyof SubscriptionFilters, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative lg:w-80">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
        />
        <Input
          value={searchInput}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search by name or payment method…"
          className="pl-9"
          aria-label="Search subscriptions"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:items-center">
        <CustomSelect
          value={filters.category ?? ""}
          onChange={(val) => onUpdateFilter("category", val)}
          options={[
            { value: "", label: "All categories" },
            ...(catalog?.categories.map((category) => ({
              value: category,
              label: CATEGORY_LABELS[category as Category],
            })) ?? []),
          ]}
          aria-label="Filter by category"
        />

        <CustomSelect
          value={filters.status ?? ""}
          onChange={(val) => onUpdateFilter("status", val)}
          options={[
            { value: "", label: "All statuses" },
            ...(catalog?.statuses.map((status) => ({
              value: status,
              label: STATUS_LABELS[status],
            })) ?? []),
          ]}
          aria-label="Filter by status"
        />

        <CustomSelect
          value={filters.billing_cycle ?? ""}
          onChange={(val) => onUpdateFilter("billing_cycle", val)}
          options={[
            { value: "", label: "All cycles" },
            ...(catalog?.billing_cycles.map((cycle) => ({
              value: cycle,
              label: BILLING_CYCLE_LABELS[cycle],
            })) ?? []),
          ]}
          aria-label="Filter by billing cycle"
        />

        <CustomSelect
          value={filters.sort ?? "renewal_date"}
          onChange={(val) => onUpdateFilter("sort", val)}
          options={sortOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          aria-label="Sort subscriptions"
          className="lg:w-40"
        />
      </div>
    </div>
  );
}