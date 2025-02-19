
import { UserManagementSection } from "@/components/users/UserManagementSection"

export default function UserManagement() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>
      <UserManagementSection />
    </div>
  )
}
