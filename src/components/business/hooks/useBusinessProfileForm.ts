import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"

const businessHoursSchema = z.object({
  monday: z.string().optional(),
  tuesday: z.string().optional(),
  wednesday: z.string().optional(),
  thursday: z.string().optional(),
  friday: z.string().optional(),
  saturday: z.string().optional(),
  sunday: z.string().optional(),
})

export const businessFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  business_hours: businessHoursSchema,
  logo_url: z.string().optional(),
})

export type BusinessFormValues = z.infer<typeof businessFormSchema>

export function useBusinessProfileForm() {
  const { toast } = useToast()

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

  const onSubmit = async (data: BusinessFormValues) => {
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
          logo_url: data.logo_url,
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

  return {
    form,
    profile,
    isLoading,
    onSubmit,
    defaultBusinessHours,
  }
}