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
export const RoleManagement = ({
  onRoleSelect
}: RoleManagementProps) => {
  const {
    data: roleStats
  } = useRoleStats();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    isAdmin
  } = useAdminStatus();
  useRoleSubscription();
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-white/[0.87]">Role Overview</h3>
          <p className="text-sm text-white/60">
            Current distribution of user roles
          </p>
        </div>
        {isAdmin && <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>}
      </div>
      
      {roleStats && <RoleDistributionChart roleStats={roleStats} />}

      

      <RoleDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>;
};