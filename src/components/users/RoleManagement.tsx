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
      
      
      {roleStats && <RoleDistributionChart roleStats={roleStats} />}

      

      <RoleDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>;
};