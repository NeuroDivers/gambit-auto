
import { useRoleStats } from "./hooks/useRoleStats";
import { useRoleSubscription } from "./hooks/useRoleSubscription";
import { RoleStatsCard } from "./RoleStatsCard";
import { RoleDistributionChart } from "./RoleDistributionChart";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { RoleDialog } from "./roles/RoleDialog";
import { useAdminStatus } from "@/hooks/useAdminStatus";

interface RoleManagementProps {
  onRoleSelect?: (role: string) => void;
}

export const RoleManagement = ({ onRoleSelect }: RoleManagementProps) => {
  const { data: roleStats, isLoading } = useRoleStats();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isAdmin } = useAdminStatus();
  useRoleSubscription();

  if (isLoading) {
    return <div>Loading role statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">Role Overview</h3>
          <p className="text-sm text-muted-foreground">
            Current distribution of user roles
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        )}
      </div>
      
      {roleStats && Object.keys(roleStats).length > 0 ? (
        <>
          <RoleDistributionChart roleStats={roleStats} />
          <div className="grid gap-4">
            {Object.entries(roleStats).map(([role, count]) => (
              <RoleStatsCard 
                key={role} 
                role={role} 
                count={count} 
                onRoleSelect={onRoleSelect}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No roles found. {isAdmin && 'Click "Create Role" to add one.'}
        </div>
      )}

      <RoleDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};
