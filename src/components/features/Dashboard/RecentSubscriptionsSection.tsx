import { Link } from "react-router";
import { Button } from "@/components/ui/Button";
import { SubscriptionListRecent } from "@/components/features/Subscription/SubscriptionList";
import type { Subscription } from "@/types/subscription";

export function RecentSubscriptionsSection({
  subscriptions,
  onView,
}: {
  subscriptions: Subscription[];
  onView: (subscription: Subscription) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Recent subscriptions</h2>
        <Button variant="ghost" size="sm">
          <Link to="/subscriptions">View all</Link>
        </Button>
      </div>
      <SubscriptionListRecent subscriptions={subscriptions} onView={onView} />
    </section>
  );
}