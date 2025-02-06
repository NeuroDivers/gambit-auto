import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { businessFormSchema, BusinessFormValues } from "../types"

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
      console.log("Submitting business profile with data:", data)
      
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
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error("Error updating business profile:", error)
        throw error
      }

      toast({
        title: "Success",
        description: "Business profile updated successfully.",
      })
      
      refetch()
    } catch (error: any) {
      console.error("Error updating business profile:", error)
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