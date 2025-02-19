
import { UserManagementSection } from "@/components/users/UserManagementSection"

export default function UserManagement() {
  return (
    <div className="container py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage system users and their roles
          </p>
        </div>
      </div>
      <UserManagementSection />
    </div>
  )
}
