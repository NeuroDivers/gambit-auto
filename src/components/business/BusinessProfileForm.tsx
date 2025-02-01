import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { ContactInfoSection } from "./form-sections/ContactInfoSection"
import { BusinessHoursSection } from "./form-sections/BusinessHoursSection"
import { MediaUploadField } from "../work-orders/form-fields/MediaUploadField"
import { useMediaUpload } from "../work-orders/hooks/useMediaUpload"

const businessHoursSchema = z.object({
  monday: z.string().optional(),
  tuesday: z.string().optional(),
  wednesday: z.string().optional(),
  thursday: z.string().optional(),
  friday: z.string().optional(),
  saturday: z.string().optional(),
  sunday: z.string().optional(),
})

const businessFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  business_hours: businessHoursSchema,
  logo_url: z.string().optional(),
})

export type BusinessFormValues = z.infer<typeof businessFormSchema>

export function BusinessProfileForm() {
  const { toast } = useToast()
  const { uploading, mediaUrl, handleFileUpload, handleMediaRemove, setMediaUrl } = useMediaUpload()

  const { data: profile, refetch, isLoading } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
  })

  const defaultBusinessHours = {
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  }

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      company_name: "",
      phone_number: "",
      email: "",
      address: "",
      business_hours: defaultBusinessHours,
      logo_url: "",
    },
  })

  React.useEffect(() => {
    if (profile) {
      form.reset({
        company_name: profile.company_name || "",
        phone_number: profile.phone_number || "",
        email: profile.email || "",
        address: profile.address || "",
        business_hours: profile.business_hours 
          ? (profile.business_hours as z.infer<typeof businessHoursSchema>) 
          : defaultBusinessHours,
        logo_url: profile.logo_url || "",
      })
      setMediaUrl(profile.logo_url)
    }
  }, [profile, form, setMediaUrl])

  async function onSubmit(data: BusinessFormValues) {
    try {
      const { error } = await supabase
        .from("business_profile")
        .upsert({
          id: profile?.id || undefined,
          company_name: data.company_name,
          phone_number: data.phone_number,
          email: data.email,
          address: data.address,
          business_hours: data.business_hours,
          logo_url: mediaUrl,
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Business profile updated successfully.",
      })
      
      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
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