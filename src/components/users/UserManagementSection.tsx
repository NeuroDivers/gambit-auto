import { useState } from "react";
import { UserList } from "./UserList";
import { RoleManagement } from "./RoleManagement";
import { CreateUserDialog } from "./CreateUserDialog";

export const UserManagementSection = () => {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-white/[0.87]">User Management</h2>
          <p className="text-white/60">Manage users and their roles</p>
        </div>
        <CreateUserDialog 
          open={isCreateUserOpen} 
          onOpenChange={setIsCreateUserOpen} 
        />
      </div>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white/[0.87]">Users</h3>
            <p className="text-sm text-white/60">View and manage system users</p>
          </div>
          <UserList />
        </div>
        <RoleManagement />
      </div>
    </div>
  );
};