import type { Subscription, SubscriptionFilters } from "@/types/subscription";

export const sortOptions: { value: string; label: string }[] = [
  { value: "renewal_date", label: "Next renewal" },
  { value: "name", label: "Name" },
  { value: "cost", label: "Cost" },
  { value: "created_at", label: "Recently added" },
];

export function compareBy(
  key: NonNullable<SubscriptionFilters["sort"]>,
  direction: NonNullable<SubscriptionFilters["sort_dir"]>,
) {
  const factor = direction === "desc" ? -1 : 1;
  return (a: Subscription, b: Subscription) => {
    let result: number;
    switch (key) {
      case "name":
        result = a.name.localeCompare(b.name);
        break;
      case "cost":
        result = a.cost - b.cost;
        break;
      case "created_at":
        result = a.created_at.localeCompare(b.created_at);
        break;
      default:
        result = a.renewal_date.localeCompare(b.renewal_date);
        break;
    }
    return result * factor;
  };
}