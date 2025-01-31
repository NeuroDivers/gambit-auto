import { UserList } from "./UserList";
import { RoleManagement } from "./RoleManagement";

export const UserManagementSection = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <p className="text-muted-foreground">Manage users and their roles</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <UserList />
        <RoleManagement />
      </div>
    </div>
  );
};