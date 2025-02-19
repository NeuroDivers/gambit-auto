import { useState } from "react";
import { UserList } from "./UserList";
import { RoleManagement } from "./RoleManagement";
import { CreateUserDialog } from "./CreateUserDialog";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { RoleList } from "./roles/RoleList";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
export const UserManagementSection = () => {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const {
    isAdmin
  } = useAdminStatus();
  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };
  return <div className="grid gap-8 grid-cols-1 xl:grid-cols-[1fr_400px]">
      {/* Main Content - Users List */}
      <div className="space-y-8">
        <Card className="border-none shadow-md">
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">System Users</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage and monitor user accounts
                  </p>
                </div>
              </div>
              {isAdmin && <Button onClick={() => setIsCreateUserOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create User
                </Button>}
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="p-6">
              <UserList initialRoleFilter={selectedRole} />
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Sidebar - Role Management */}
      <div className="space-y-8">
        <Card className="border-none shadow-md">
          <div className="">
            <RoleManagement onRoleSelect={handleRoleSelect} />
          </div>
        </Card>

        <Card className="border-none shadow-md">
          <div className="p-6">
            <RoleList />
          </div>
        </Card>
      </div>

      <CreateUserDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen} />
    </div>;
};