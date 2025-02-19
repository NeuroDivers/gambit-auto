
import { useState } from "react";
import { UserList } from "./UserList";
import { RoleManagement } from "./RoleManagement";
import { CreateUserDialog } from "./CreateUserDialog";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
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
    <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_360px]">
      {/* Main Content - Users List */}
      <div className="space-y-6">
        <Card className="border-border/20">
          <div className="border-b border-border/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">System Users</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage and monitor user accounts
                  </p>
                </div>
              </div>
              {isAdmin && (
                <Button onClick={() => setIsCreateUserOpen(true)} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create User
                </Button>
              )}
            </div>
          </div>
          <div className="p-4">
            <UserList initialRoleFilter={selectedRole} />
          </div>
        </Card>
      </div>

      {/* Sidebar - Role Management */}
      <div className="space-y-6">
        <Card className="border-border/20">
          <div className="p-4">
            <RoleManagement onRoleSelect={handleRoleSelect} />
          </div>
        </Card>

        <Card className="border-border/20">
          <div className="p-4">
            <RoleList />
          </div>
        </Card>
      </div>

      <CreateUserDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen} />
    </div>
  );
};
