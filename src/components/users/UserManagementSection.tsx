
import { useState } from "react";
import { UserList } from "./UserList";
import { RoleManagement } from "./RoleManagement";
import { CreateUserDialog } from "./CreateUserDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { RoleList } from "./roles/RoleList";
import { Card } from "@/components/ui/card";

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
        <Card className="p-6 space-y-6">
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
        </Card>
        <div className="space-y-8">
          <Card className="p-6">
            <RoleManagement onRoleSelect={handleRoleSelect} />
          </Card>
          <Card className="p-6">
            <RoleList />
          </Card>
        </div>
      </div>
      <CreateUserDialog 
        open={isCreateUserOpen} 
        onOpenChange={setIsCreateUserOpen} 
      />
    </div>
  );
};
