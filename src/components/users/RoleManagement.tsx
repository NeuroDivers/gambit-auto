
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleStatsCard } from "./RoleStatsCard";

interface RoleManagementProps {
  onRoleSelect: (role: string) => void;
}

export const RoleManagement = ({ onRoleSelect }: RoleManagementProps) => {
  const { data: roleStats } = useQuery({
    queryKey: ["roleStats"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          roles!profiles_role_id_fkey (
            name
          )
        `);
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Count users by role
      const stats: Record<string, number> = {};
      profiles.forEach((profile: any) => {
        const roleName = profile.roles?.name;
        if (roleName) {
          stats[roleName] = (stats[roleName] || 0) + 1;
        }
      });

      return stats;
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Filter by Role</h3>
        <p className="text-sm text-muted-foreground">
          Select a role to filter the user list
        </p>
      </div>
      <div className="space-y-4">
        <RoleStatsCard
          role="all"
          count={Object.values(roleStats || {}).reduce((a, b) => a + b, 0)}
          onRoleSelect={onRoleSelect}
        />
        {roleStats && Object.entries(roleStats).map(([role, count]) => (
          <RoleStatsCard
            key={role}
            role={role}
            count={count}
            onRoleSelect={onRoleSelect}
          />
        ))}
      </div>
    </div>
  );
};
