
import { Card } from "@/components/ui/card";
import { useRoleStats } from "./hooks/useRoleStats";

export const RoleStatsCard = () => {
  const { data: roleStats, isLoading } = useRoleStats();

  if (isLoading) {
    return <div>Loading stats...</div>;
  }

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
        <div className="space-y-4">
          {Object.entries(roleStats || {}).map(([role, count]) => (
            <div key={role} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{role}</span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
