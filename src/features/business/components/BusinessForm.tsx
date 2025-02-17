
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { businessFormSchema, BusinessFormValues } from "../schemas/businessFormSchema"

interface BusinessFormProps {
  businessProfile: any
}

export function BusinessForm({ businessProfile }: BusinessFormProps) {
  const { toast } = useToast()
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

  return (
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
  )
}
