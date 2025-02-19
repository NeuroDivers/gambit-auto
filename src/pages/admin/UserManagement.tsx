
import { UserManagementSection } from "@/components/users/UserManagementSection"

export default function UserManagement() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users and roles
          </p>
        </div>
      </div>
      <UserManagementSection />
    </div>
  )
}
