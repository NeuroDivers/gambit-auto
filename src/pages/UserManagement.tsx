import { UserManagementSection } from "@/components/users/UserManagementSection"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"

export default function UserManagement() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <div className="mb-8">
            <PageBreadcrumbs />
            <h1 className="text-3xl font-bold">User Management</h1>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto">
          <UserManagementSection />
        </div>
      </div>
    </div>
  )
}