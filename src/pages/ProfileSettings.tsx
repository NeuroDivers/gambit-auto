import { ProfileForm } from "@/components/profile/ProfileForm"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"

export default function ProfileSettings() {
  return (
    <div className="container py-6 space-y-6">
      <PageBreadcrumbs />
      
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal profile information.
        </p>
      </div>

      <div className="max-w-2xl">
        <ProfileForm />
      </div>
    </div>
  )
}