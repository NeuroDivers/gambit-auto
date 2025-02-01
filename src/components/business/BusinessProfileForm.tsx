import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ContactInfoSection } from "./form-sections/ContactInfoSection"
import { BusinessHoursSection } from "./form-sections/BusinessHoursSection"
import { MediaUploadField } from "../work-orders/form-fields/MediaUploadField"
import { useMediaUpload } from "../work-orders/hooks/useMediaUpload"
import { useBusinessProfileForm } from "./hooks/useBusinessProfileForm"
import { useEffect } from "react"

export function BusinessProfileForm() {
  const { form, profile, isLoading, onSubmit, defaultBusinessHours } = useBusinessProfileForm()
  const { uploading, mediaUrl, handleFileUpload, handleMediaRemove, setMediaUrl } = useMediaUpload()

  useEffect(() => {
    if (profile) {
      form.reset({
        company_name: profile.company_name || "",
        phone_number: profile.phone_number || "",
        email: profile.email || "",
        address: profile.address || "",
        business_hours: profile.business_hours 
          ? profile.business_hours 
          : defaultBusinessHours,
        logo_url: profile.logo_url || "",
      })
      setMediaUrl(profile.logo_url)
    }
  }, [profile, form, setMediaUrl, defaultBusinessHours])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted rounded-md" />
          ))}
        </div>
        <div className="h-20 bg-muted rounded-md" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-10 bg-muted rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <MediaUploadField
          onFileUpload={handleFileUpload}
          mediaUrl={mediaUrl}
          uploading={uploading}
          onMediaRemove={handleMediaRemove}
        />
        <ContactInfoSection form={form} />
        <BusinessHoursSection form={form} />
        <Button type="submit">Update Business Profile</Button>
      </form>
    </Form>
  )
}