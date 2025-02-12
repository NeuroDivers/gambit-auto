
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
    <div className="space-y-8">      
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Users</h3>
              <p className="text-sm text-muted-foreground">View and manage system users</p>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsCreateUserOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create User
              </Button>
            )}
          </div>
          <UserList initialRoleFilter={selectedRole} />
        </div>
        <div className="space-y-8">
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
