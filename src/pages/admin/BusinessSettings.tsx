
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const businessFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
})

type BusinessFormValues = z.infer<typeof businessFormSchema>

interface UserProfile {
  role: {
    name: string
  } | null
}

export default function BusinessSettings() {
  const { toast } = useToast()

  const { data: businessProfile, isLoading, error } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      console.log("Fetching business profile...")
      
      // First check if user is logged in
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("Not authenticated")
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role:role_id(name)')
        .eq('id', session.user.id)
        .single<UserProfile>()

      if (profileError) {
        console.error("Error fetching user profile:", profileError)
        throw new Error("Failed to verify user role")
      }

      console.log("User profile:", userProfile)
      
      if (!userProfile?.role?.name || userProfile.role.name !== 'administrator') {
        throw new Error("Unauthorized - Admin access required")
      }

      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .maybeSingle()

      if (error) {
        console.error("Error fetching business profile:", error)
        throw error
      }
      
      console.log("Business profile data:", data)
      return data || {
        company_name: "",
        email: "",
        phone_number: "",
        address: "",
        logo_url: ""
      }
    }
  })

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      company_name: "",
      email: "",
      phone_number: "",
      address: "",
      logo_url: "",
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
      })
    }
  }, [businessProfile, form])

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

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {error instanceof Error 
                ? error.message 
                : "Failed to load business settings. Please try again later."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Business Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" placeholder="https://" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
