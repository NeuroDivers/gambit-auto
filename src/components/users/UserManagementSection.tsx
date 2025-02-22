
import { useState } from "react";
import { UserList } from "./UserList";
import { RoleManagement } from "./RoleManagement";
import { CreateUserDialog } from "./CreateUserDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { RoleList } from "./roles/RoleList";

export const UserManagementSection = () => {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const { isAdmin } = useAdminStatus();

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  return (
    <div className="space-y-4">      
      <div className="flex flex-col gap-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Users</h3>
              <p className="text-sm text-muted-foreground">View and manage system users</p>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsCreateUserOpen(true)} className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Create User
              </Button>
            )}
          </div>
          <UserList initialRoleFilter={selectedRole} />
        </div>
        <div className="space-y-4">
          <RoleManagement onRoleSelect={handleRoleSelect} />
          <RoleList />
        </div>
      </div>
      <CreateUserDialog 
        open={isCreateUserOpen} 
        onOpenChange={setIsCreateUserOpen} 
      />
    </div>
  );
};
