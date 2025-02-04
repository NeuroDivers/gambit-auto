import { useRoleStats } from "./hooks/useRoleStats";
import { useRoleSubscription } from "./hooks/useRoleSubscription";
import { RoleStatsCard } from "./RoleStatsCard";
import { RoleDistributionChart } from "./RoleDistributionChart";

export const RoleManagement = () => {
  const { data: roleStats } = useRoleStats();
  useRoleSubscription();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-white/[0.87]">Role Overview</h3>
        <p className="text-sm text-white/60">
          Current distribution of user roles
        </p>
      </div>
      
      {roleStats && <RoleDistributionChart roleStats={roleStats} />}

      <div className="grid gap-4">
        {roleStats && Object.entries(roleStats).map(([role, count]) => (
          <RoleStatsCard key={role} role={role} count={count} />
        ))}
      </div>
    </div>
  );
};