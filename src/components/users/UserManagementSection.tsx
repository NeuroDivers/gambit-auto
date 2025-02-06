import { useState } from "react";
import { UserList } from "./UserList";
import { RoleManagement } from "./RoleManagement";
import { CreateUserDialog } from "./CreateUserDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";

export const UserManagementSection = () => {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const { isAdmin } = useAdminStatus();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white/[0.87]">User Management</h2>
      <p className="text-white/60">Manage users and their roles</p>
      
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-white/[0.87]">Users</h3>
              <p className="text-sm text-white/60">View and manage system users</p>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsCreateUserOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create User
              </Button>
            )}
          </div>
          <UserList />
        </div>
        <RoleManagement />
      </div>
      <CreateUserDialog 
        open={isCreateUserOpen} 
        onOpenChange={setIsCreateUserOpen} 
      />
    </div>
  );
};