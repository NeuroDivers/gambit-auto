
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { businessFormSchema, BusinessFormValues } from "../schemas/businessFormSchema"
import { LogoUploadSection } from "./LogoUploadSection"
import { ContactInfoFields } from "./ContactInfoFields"

interface BusinessFormProps {
  businessProfile: any
}

export function BusinessForm({ businessProfile }: BusinessFormProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = React.useState(false)
  const [lightLogoPreview, setLightLogoPreview] = React.useState<string | null>(null)
  const [darkLogoPreview, setDarkLogoPreview] = React.useState<string | null>(null)
  
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      company_name: "",
      email: "",
      phone_number: "",
      address: "",
      logo_url: "",
      light_logo_url: "",
      dark_logo_url: "",
    }
  })

  React.useEffect(() => {
    if (businessProfile) {
      form.reset({
        company_name: businessProfile.company_name || "",
        email: businessProfile.email || "",
        phone_number: businessProfile.phone_number || "",
        address: businessProfile.address || "",
        logo_url: businessProfile.logo_url || "",
        light_logo_url: businessProfile.light_logo_url || "",
        dark_logo_url: businessProfile.dark_logo_url || "",
      })
      setLightLogoPreview(businessProfile.light_logo_url || null)
      setDarkLogoPreview(businessProfile.dark_logo_url || null)
    }
  }, [businessProfile, form])

  const handleFileUpload = (type: 'light' | 'dark') => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Upload the file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business-logos')
        .getPublicUrl(fileName)

      // Update the form based on logo type
      if (type === 'light') {
        form.setValue('light_logo_url', publicUrl)
        setLightLogoPreview(publicUrl)
      } else {
        form.setValue('dark_logo_url', publicUrl)
        setDarkLogoPreview(publicUrl)
      }

      toast({
        title: "Success",
        description: `${type === 'light' ? 'Light' : 'Dark'} logo uploaded successfully.`,
      })
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload logo. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function onSubmit(values: BusinessFormValues) {
    try {
      const { error } = businessProfile 
        ? await supabase
            .from("business_profile")
            .update(values)
            .eq("id", businessProfile.id)
        : await supabase
            .from("business_profile")
            .insert([values])

      if (error) throw error

      toast({
        title: "Success",
        description: "Business profile updated successfully.",
      })
    } catch (error) {
      console.error("Error updating business profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error updating the business profile.",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ContactInfoFields form={form} />
        
        <LogoUploadSection
          form={form}
          isUploading={isUploading}
          lightLogoPreview={lightLogoPreview}
          darkLogoPreview={darkLogoPreview}
          onFileUpload={handleFileUpload}
        />

        <Button 
          type="submit" 
          className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
          disabled={isUploading}
        >
          Save Changes
        </Button>
      </form>
    </Form>
  )
}
