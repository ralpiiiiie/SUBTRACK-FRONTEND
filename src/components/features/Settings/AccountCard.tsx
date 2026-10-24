import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { Row } from "./SettingsRows";
import type { User } from "@/types/auth";

export function AccountCard({
  user,
  memberSince,
  lastLogin,
  loading,
  onEdit,
}: {
  user: User | null;
  memberSince: string | null;
  lastLogin: string | null;
  loading: boolean;
  onEdit: () => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Account"
        subtitle="Your profile details."
        action={
          <Button variant="outline" size="sm" onClick={onEdit} data-cursor>
            <Icon name="edit" className="h-4 w-4" />
            Edit profile
          </Button>
        }
      />
      {loading ? (
        <div className="space-y-3 px-5 pb-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      ) : (
        <div className="px-5 pb-4">
          <dl>
            <Row label="Name">{user?.name ?? "—"}</Row>
            <Row label="Email">{user?.email ?? "—"}</Row>
            <Row label="Member since">{memberSince ?? "Unknown"}</Row>
            <Row label="Last login">{lastLogin ?? "Not recorded yet"}</Row>
          </dl>
        </div>
      )}
    </Card>
  );
}