import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ContactInfoSection } from "./form-sections/ContactInfoSection"
import { BusinessHoursSection } from "./form-sections/BusinessHoursSection"
import { MediaUploadField } from "../work-orders/form-fields/MediaUploadField"
import { useMediaUpload } from "../work-orders/hooks/useMediaUpload"
import { useBusinessProfileForm } from "./hooks/useBusinessProfileForm"
import { useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2 } from "lucide-react"

export function BusinessProfileForm() {
  const { form, profile, isLoading, onSubmit, defaultBusinessHours } = useBusinessProfileForm()
  const { uploading, mediaUrl, handleFileUpload, handleMediaRemove, setMediaUrl } = useMediaUpload('business-logos')

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

  const handleSubmitWithLogo = async (values: any) => {
    const updatedValues = {
      ...values,
      logo_url: mediaUrl
    }
    await onSubmit(updatedValues)
  }

  const handleLogoRemove = async () => {
    handleMediaRemove()
    const currentValues = form.getValues()
    const updatedValues = {
      ...currentValues,
      logo_url: null
    }
    await onSubmit(updatedValues)
  }

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
      <form onSubmit={form.handleSubmit(handleSubmitWithLogo)} className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={mediaUrl || ""} alt="Business Logo" />
            <AvatarFallback>
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <MediaUploadField
              onFileUpload={handleFileUpload}
              mediaUrl={mediaUrl}
              uploading={uploading}
              onMediaRemove={handleLogoRemove}
              label="Business Logo"
              description="Upload your business logo. Recommended size: 256x256px"
            />
          </div>
        </div>
        <ContactInfoSection form={form} />
        <BusinessHoursSection form={form} />
        <Button type="submit">Update Business Profile</Button>
      </form>
    </Form>
  )
}