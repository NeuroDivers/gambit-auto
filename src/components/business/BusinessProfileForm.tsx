import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"

const businessFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  business_hours: z.string().optional(),
})

type BusinessFormValues = z.infer<typeof businessFormSchema>

export function BusinessProfileForm() {
  const { toast } = useToast()

  const { data: profile, refetch } = useQuery({
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

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      company_name: profile?.company_name || "",
      phone_number: profile?.phone_number || "",
      email: profile?.email || "",
      address: profile?.address || "",
      business_hours: profile?.business_hours ? JSON.stringify(profile.business_hours) : "",
    },
  })

  async function onSubmit(data: BusinessFormValues) {
    try {
      const { error } = await supabase
        .from("business_profile")
        .upsert({
          ...data,
          business_hours: data.business_hours ? JSON.parse(data.business_hours) : null,
          id: profile?.id,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
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
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="business_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Hours (JSON format)</FormLabel>
              <FormControl>
                <Input {...field} placeholder='{"monday": "9:00-17:00"}' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Update Business Profile</Button>
      </form>
    </Form>
  )
}