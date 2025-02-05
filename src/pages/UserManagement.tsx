import { UserManagementSection } from "@/components/users/UserManagementSection"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"

export default function UserManagement() {
  return (
    <div className="container py-6">
      <PageBreadcrumbs />
      <UserManagementSection />
    </div>
  )
}