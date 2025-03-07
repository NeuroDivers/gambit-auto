
import { Separator } from "@/components/ui/separator"
import { PersonalInfoForm } from "./sections/PersonalInfoForm"
import { PasswordChangeForm } from "./sections/PasswordChangeForm"
import { useProfileData } from "@/hooks/useProfileData"
import { useProfileSubmission } from "@/hooks/useProfileSubmission"
import { usePasswordChange } from "@/hooks/usePasswordChange"

interface ProfileFormProps {
  role?: string | null
}

export function ProfileForm({ role }: ProfileFormProps) {
  // Use custom hooks to manage profile data and submissions
  const { form, isCustomer } = useProfileData(role)
  const { onSubmit, isSubmitting } = useProfileSubmission(isCustomer)
  const { 
    passwordForm, 
    onPasswordSubmit, 
    isUpdatingPassword, 
    passwordError 
  } = usePasswordChange()

  return (
    <div className="space-y-12">
      <PersonalInfoForm 
        form={form} 
        onSubmit={onSubmit}
        role={role}
        isSubmitting={isSubmitting}
      />

      <Separator />

      <PasswordChangeForm 
        form={passwordForm}
        onSubmit={onPasswordSubmit}
        isUpdating={isUpdatingPassword}
        error={passwordError}
      />
    </div>
  )
}
